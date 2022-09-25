module.exports = {
    init: function () {
        this.instance = false;
        this.customButtons = {};
        this.eventName = this.prefix + '-control';
    },
    start: function () {
        if (!this.opts.control) return;
        this._build();
    },
    stop: function () {
        if (this.opts.control) {
            this.$control.remove();
        }
        this.instance = false;
        this.customButtons = {};
    },
    isOpen: function () {
        return this.$control.css('display') !== 'none';
    },
    getElement: function () {
        return this.$control;
    },
    get: function (name) {
        return this._findButton(name);
    },
    add: function (name, obj) {
        this.customButtons[name] = obj;
    },
    remove: function (name) {
        this._findButton(name).remove();
    },
    build: function () {
        if (!this.opts.control) return;
        var instance = this.app.block.get();
        if (!instance) {
            this.close();
        } else {
            this.open(instance);
        }
    },
    open: function (instance) {
        if (!this.opts.control) return;
        this.$control.html('');
        this.instance = instance;
        var len = this._buildButtons();
        if (len > 0) {
            var $scrollTarget = this.app.scroll.getTarget();
            this.updatePosition();
            $scrollTarget.on('resize.' + this.eventName, this.updatePosition.bind(this));
            $scrollTarget.on('scroll.' + this.eventName, this.updatePosition.bind(this));
            this.app.editor.getWin().on('scroll.' + this.eventName, this.updatePosition.bind(this));
            this.instance.getBlock().on('keyup.' + this.eventName, this.updatePosition.bind(this));
        } else {
            this.close();
        }
    },
    close: function () {
        if (!this.opts.control) return;
        this.$control.hide();
        if (this.instance) {
            var $block = this.instance.getBlock();
            this.app.content.unfixListMargin($block);
            $block.off('.' + this.eventName);
        }
        this.app.scroll.getTarget().off('.' + this.eventName);
        this.app.editor.getDoc().off('.' + this.eventName);
        this.instance = false;
    },
    updatePosition: function () {
        if (!this.opts.control) return;
        if (!this.instance) {
            this.close();
            return;
        }
        var isEditable = this.instance.isEditable();
        var offset = this.instance.getOffset();
        var width = this.$control.width();
        var scrollTop = this.app.editor.getWin().scrollTop();
        var topOutlineFix = isEditable ? 4 : 2;
        var leftOutlineFix = isEditable ? 6 : 4;
        var top = offset.top - topOutlineFix - scrollTop;
        var left = offset.left - width - leftOutlineFix;
        var $container = this.app.container.get('toolbar');
        var toolbarBottom = $container.offset().top + $container.height() - topOutlineFix;
        var frameRect = this.app.editor.getFrameRect();
        if (this.instance.getType() === 'list') {
            var $block = this.instance.getBlock();
            this.app.content.fixListMargin($block);
        }
        if (top < toolbarBottom || frameRect.bottom < top) {
            this.$control.hide();
        } else {
            this.$control.show();
        }
        if (this.app.scroll.isTarget()) {
            var $target = this.app.scroll.getTarget();
            var targetBottom = $target.offset().top + $target.height();
            var bottom = top + this.$control.height();
            if (bottom > targetBottom) {
                this.$control.hide();
            }
        }
        if (!isEditable && left + width / 2 < frameRect.left) {
            left = frameRect.left + 3;
            top = top + 6;
        }
        this.$control.css({
            top: top + 'px',
            left: left + 'px',
        });
    },
    _buildButtons: function () {
        var buttons = this.app.editor.getButtonsFromArr(this.instance.control);
        var count = 0;
        if (buttons !== false) {
            count = this._createButtons(buttons, count);
            count = this._createButtons(this.customButtons, count);
        }
        return count;
    },
    _build: function () {
        this.$control = this.dom('<div>')
            .addClass(this.prefix + '-control ' + this.prefix + '-control-' + this.uuid)
            .hide();
        if (this.opts.bsmodal) {
            this.$control.css('z-index', 1060);
        }
        this.app.$body.append(this.$control);
    },
    _createButtons: function (buttons, count) {
        for (var name in buttons) {
            if (!this.instance.isAllowedButton(name, buttons[name])) continue;
            this.app.create('button', name, buttons[name], this.$control, 'control');
            count++;
        }
        return count;
    },
    _findButton: function (name) {
        return this.$control.find('[data-name=' + name + ']');
    },
};
