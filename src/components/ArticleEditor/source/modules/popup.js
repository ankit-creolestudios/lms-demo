module.exports = {
    init: function () {
        this.stack = false;
        this.stacks = [];
        this.name = false;
        this.supername = false;
        this.control = false;
        this.saved = false;
    },
    start: function () {
        this._build();
        this._buildDepth();
    },
    stop: function () {
        this._stopEvents();
        this._stop();
    },
    stopStack: function () {
        this._stopEvents();
        this.app.toolbar.unsetToggled();
        this.$popup.removeAttr('data-' + this.prefix + '-popup-name');
        this.$popup.removeClass('open');
    },
    isOpen: function (name) {
        var opened = this.$popup.hasClass('open');
        if (name) {
            return this._getName() === name && opened;
        }
        return opened;
    },
    create: function (name, params) {
        if (this.isOpen(name)) {
            return this.stack;
        }
        this._reset();
        this.name = name;
        this.supername = name;
        this.stack = this._createStack(name, params);
        return this.stack;
    },
    add: function (name, params) {
        return this._createStack(name, params, true);
    },
    setStack: function (stack) {
        this.stack = stack;
        this.name = stack.getName();
    },
    setData: function (data) {
        this.stack.setData(data);
    },
    setFocus: function (name) {
        this.stack.setFocus(name);
    },
    setWidth: function (width) {
        this.stack.setWidth(width);
    },
    getName: function () {
        return this.name;
    },
    getElement: function () {
        return this.$popup;
    },
    getButton: function () {
        return this.button;
    },
    getStack: function (name) {
        return name ? this.stacks[name] : this.stack;
    },
    getBody: function () {
        return this.stack.getBody();
    },
    getItems: function () {
        return this.stack.getItems();
    },
    getFooter: function () {
        return this.stack.getFooter();
    },
    getFooterPrimary: function () {
        return this.stack.getFooterPrimary();
    },
    getTool: function (name) {
        return this.stack.getTool(name);
    },
    getInput: function (name) {
        return this.stack.getInput(name);
    },
    getFormItem: function (name) {
        return this.stack.getFormItem(name);
    },
    getData: function (name) {
        return this.stack.getData(name);
    },
    open: function (params) {
        if (!this.isOpen()) {
            this._open(params);
        } else if (this.isOpen(this.supername)) {
            this.close(false);
        } else {
            this.close(false);
            this._open(params, false);
        }
    },
    openStack: function (name) {
        var stack = this.getStack(name);
        var params = {};
        if (this.stack && this.stack.isCollapsed()) {
            params = {
                collapse: true,
            };
            this.removeStack(this.stack);
        }
        stack.open(params);
    },
    close: function (e) {
        if (!this.isOpen()) return;
        if (e && this._isPopupTarget(e)) return;
        this._stopEvents();
        this._resetToolbarToggledButton();
        if (e !== false) {
            this.app.scroll.save();
            this._restore();
            this.app.scroll.restore();
        }
        this.$popup.hide();
        this._closed();
    },
    closeStacks: function () {
        for (var key in this.stacks) {
            if (typeof this.stacks[key] === 'object') {
                this.stacks[key].close();
            }
        }
    },
    removeStack: function (stack) {
        var name = stack.getName();
        delete this.stacks[name];
        this.$popup.find('[data-' + this.prefix + '-stack-name=' + name + ']').remove();
    },
    updatePosition: function (e) {
        this._buildPosition(e);
        this._buildHeight();
    },
    resize: function () {
        var data = this.$popup.attr('data-width');
        var width = this.app.editor.getWidth();
        if (data !== '100%') {
            var w = parseInt(data);
            if (w < width) {
                return;
            }
        }
        this.$popup.css('width', width + 'px');
    },
    _build: function () {
        this.$popup = this.dom('<div>').addClass(this.prefix + '-popup ' + this.prefix + '-popup-' + this.uuid);
        this.$popup.hide();
        this.$popup.attr('dir', this.opts.editor.direction);
        this.app.$body.append(this.$popup);
    },
    _buildDepth: function () {
        if (this.opts.bsmodal) {
            this.$popup.css('z-index', 1061);
        }
    },
    _buildButton: function (params) {
        if (!params) return;
        this.button = Object.prototype.hasOwnProperty.call(params, 'button') ? params.button : false;
    },
    _buildControl: function (params) {
        if (!params) return;
        this.control = Object.prototype.hasOwnProperty.call(params, 'control') ? params.control : false;
    },
    _buildName: function () {
        this.$popup.attr('data-' + this.prefix + '-popup-name', this.name);
        this.$popup.addClass(this.prefix + '-popup-' + this.name);
    },
    _buildHeader: function () {
        this.header = this.app.create('popup.header', this);
    },
    _buildHeight: function () {
        var targetHeight, top;
        var $target = this.app.scroll.getTarget();
        var tolerance = 10;
        var offset = this.$popup.offset();
        if (this.app.scroll.isTarget()) {
            top = offset.top - $target.offset().top;
            targetHeight = $target.height() - parseInt($target.css('border-bottom-width'));
        } else {
            top = offset.top - $target.scrollTop();
            targetHeight = $target.height();
        }
        var cropHeight = targetHeight - top - tolerance;
        this.$popup.css('max-height', cropHeight + 'px');
    },
    _buildPosition: function () {
        var topFix = 1;
        var pos;
        if ((this._isButton() && this.button.isControl()) || this._isControl()) {
            pos = this._buildPositionControl();
        } else if (this._isButton()) {
            pos = this._buildPositionButton();
        } else {
            pos = this._buildPositionModal();
        }
        this.$popup.css({
            top: pos.top - topFix + 'px',
            left: pos.left + 'px',
        });
    },
    _buildPositionButton: function () {
        var editorRect = this.app.editor.getRect();
        var offset = this.button.getOffset();
        var dim = this.button.getDimension();
        var popupWidth = this.$popup.width();
        var pos = {};
        if (this._isToolbarButton() || this._isTopbarButton()) {
            pos = {
                top: offset.top + dim.height,
                left: offset.left,
            };
            if (pos.left + popupWidth > editorRect.right) {
                pos.left = offset.left + dim.width - popupWidth;
            }
        } else {
            pos = {
                top: offset.top + editorRect.top + dim.height,
                left: offset.left + editorRect.left + dim.width / 2 - popupWidth / 2,
            };
            if (pos.left + popupWidth > editorRect.right) {
                pos.left = editorRect.left + editorRect.width - popupWidth;
            }
        }
        if (pos.left < editorRect.left || pos.left < 0) {
            pos.left = editorRect.left;
        }
        return pos;
    },
    _buildPositionControl: function () {
        var instance = this.app.block.get();
        if (instance.isSecondLevel()) {
            instance = instance.getFirstLevel();
        }
        var $block = instance.getBlock();
        var offset = $block.offset();
        return {
            top: offset.top,
            left: offset.left,
        };
    },
    _buildPositionModal: function () {
        var offset, top, left;
        if (!this.opts.toolbar) {
            var instance = this.app.block.get();
            if (instance.isSecondLevel()) {
                instance = instance.getFirstLevel();
            }
            var $block = instance.getBlock();
            offset = $block.offset();
            top = offset.top;
            left = offset.left;
        } else {
            var $container = this.app.container.get('toolbar');
            var height = $container.height();
            offset = $container.offset();
            top = offset.top + height;
            left = offset.left;
        }
        return {
            top: top,
            left: left,
        };
    },
    _getName: function () {
        return this.$popup.attr('data-' + this.prefix + '-popup-name');
    },
    _setToolbarToggledButton: function () {
        this.app.toolbar.unsetToggled();
        if (!this._isToolbarButton()) {
            return;
        }
        var name = this.button.getName();
        this.app.toolbar.setToggled(name);
    },
    _createStack: function (name, params, collapse) {
        if (Object.prototype.hasOwnProperty.call(params, 'collapse') && params.collapse === false) {
            collapse = false;
        }
        var stack = this.app.create('popup.stack', name, params, collapse, this);
        this.stacks[name] = stack;
        return stack;
    },
    _open: function (params, animation) {
        this._buildButton(params);
        this._buildControl(params);
        this._buildName();
        this._buildHeader();
        var event = this.app.broadcast('popup.before.open');
        if (event.isStopped()) {
            this.stopStack();
            return;
        }
        this._setToolbarToggledButton();
        this._startEvents();
        if (animation !== false && this.app.editor.isPopupSelection()) {
            this._save();
        }
        this.stack = this._findActiveStack();
        this.stack.open(params, false, false);
        this._buildPosition();
        if (animation === false) {
            this.$popup.show();
            this._opened();
        } else {
            this.$popup.fadeIn(100, this._opened.bind(this));
        }
    },
    _opened: function () {
        this._buildHeight();
        this.$popup.addClass('open');
        this.app.broadcast('popup.open');
        this.stack.renderFocus();
    },
    _closed: function () {
        this.$popup.removeAttr('data-' + this.prefix + '-popup-name');
        this.$popup.removeClass('open');
        this.saved = false;
        this.app.broadcast('popup.close');
    },
    _isPopupTarget: function (e) {
        return this.dom(e.target).closest('.' + this.prefix + '-popup').length !== 0;
    },
    _isButton: function () {
        return this.button;
    },
    _isControl: function () {
        return this.control;
    },
    _isToolbarButton: function () {
        return this.button && (this.button.type === 'toolbar' || this.button.type === 'context');
    },
    _isTopbarButton: function () {
        return this.button && this.button.type === 'topbar';
    },
    _findActiveStack: function () {
        for (var key in this.stacks) {
            if (typeof this.stacks[key] === 'object' && this.stacks[key].isActive()) {
                this.stack = this.stacks[key];
            }
        }
        return this.stack;
    },
    _reset: function () {
        this.button = false;
        this.control = false;
        this.stack = false;
        this.stacks = [];
        this.$popup.html('');
        this.$popup.removeClass('has-footer has-items has-form ' + this.prefix + '-popup-' + this.name);
    },
    _resetToolbarToggledButton: function () {
        if (!this.button) return;
        var name = this.button.getName();
        this.app.toolbar.unsetToggled(name);
    },
    _startEvents: function () {
        var eventname = this.prefix + '-popup';
        this.app.scroll.getTarget().on('resize.' + eventname + ' scroll.' + eventname, this.updatePosition.bind(this));
    },
    _stopEvents: function () {
        this.app.scroll.getTarget().off('.' + this.prefix + '-popup');
    },
    _stop: function () {
        if (this.$popup) this.$popup.remove();
    },
    _save: function () {
        if (this.app.selection.isCollapsed()) {
            var inline = this.app.selection.getInline();
            if (inline && inline.innerHTML.trim() === '') {
                this.app.selection.savePosition();
                this.saved = true;
                return;
            }
        }
        this.app.selection.save();
    },
    _restore: function () {
        if (this.saved) {
            this.app.selection.restorePosition();
            this.saved = false;
            return;
        }
        this.app.selection.restore();
    },
};
