module.exports = {
    init: function () {
        this.eventname = this.prefix + '-toolbar';
        this.activeClass = 'active';
        this.toggledClass = 'toggled';
        this.disableClass = 'disable';
        this.customButtons = {};
        this.aTags = {};
        this.aTypes = {};
    },
    start: function () {
        if (this.opts.toolbar) {
            this.sticky = this.opts.toolbar;
        } else if (this.opts.path && this.opts.path.sticky) {
            this.sticky = this.opts.path;
        }
        if (this._isToolbar()) {
            this.$container = this.app.container.get('toolbar');
            this._build();
        }
        this._buildSticky();
    },
    load: function () {
        this._buildActiveButtons();
        if (this._isToolbar()) {
            this.$toolbar.html('');
            this._buildButtons();
        }
    },
    stop: function () {
        if (!this._isToolbar()) return;
        this.$toolbar.remove();
        this.customButtons = {};
        this.editorButtons = {};
    },
    build: function () {
        if (!this._isToolbar()) return;
        this.$toolbar.html('');
        this._buildButtons();
    },
    observe: function () {
        if (!this._isToolbar()) return;
        this.unsetActive();
        if (this.app.blocks.is() || this.app.editor.isAllSelected()) return;
        if (!this._isObserveButtons()) return;
        var instance = this.app.block.get();
        var type = instance ? instance.getType() : false;
        var tag = instance ? instance.getTag() : false;
        var inlines = this.app.selection.getNodes({
            type: 'inline',
            selected: 'inside',
            links: true,
        });
        var tags = this._getObservedTags(tag, inlines);
        var buttons = [];
        var keys;
        for (var i = 0; i < tags.length; i++) {
            keys = this.aTags[tags[i]];
            if (keys) {
                buttons = buttons.concat(keys);
            }
        }
        if (type) {
            keys = this.aTypes[type];
            if (keys) {
                buttons = buttons.concat(keys);
            }
        }
        this._setActiveKeys(buttons);
    },
    getElement: function () {
        return this.$toolbar;
    },
    get: function (name) {
        return this._findButton(name);
    },
    add: function (name, obj) {
        this.customButtons[name] = obj;
    },
    setActive: function (name) {
        if (!this._isToolbar()) return;
        this._findButtons().removeClass(this.activeClass);
        this._findButton(name).removeClass(this.disableClass).addClass(this.activeClass);
    },
    setToggled: function (name) {
        if (!this._isToolbar()) return;
        this._findButtons().removeClass(this.toggledClass);
        this._findButton(name).removeClass(this.disableClass).addClass(this.toggledClass);
    },
    unsetActive: function (name) {
        if (!this._isToolbar()) return;
        var $elms = name ? this._findButton(name) : this._findButtons();
        $elms.removeClass(this.activeClass);
    },
    unsetToggled: function (name) {
        if (!this._isToolbar()) return;
        var $elms = name ? this._findButton(name) : this._findButtons();
        $elms.removeClass(this.toggledClass);
    },
    enable: function () {
        if (!this._isToolbar()) return;
        this._findButtons().removeClass(this.disableClass);
    },
    disable: function (except) {
        if (!this._isToolbar()) return;
        this._findButtons().removeClass(this.toggledClass).removeClass(this.activeClass).addClass(this.disableClass);
    },
    disableSticky: function () {
        if (!this._isToolbar()) return;
        var $container = this.app.container.get('bars');
        $container.removeClass(this.prefix + '-bars-sticky');
        $container.css('top', '');
    },
    enableSticky: function () {
        if (!this._isToolbar()) return;
        if (this.opts.toolbar.sticky) {
            var $container = this.app.container.get('bars');
            $container.addClass(this.prefix + '-bars-sticky');
            $container.css('top', this.opts.toolbar.stickyTopOffset + 'px');
        }
    },
    isSticky: function () {
        var $container = this.app.container.get('bars');
        var $main = this.app.container.get('main');
        var mainTop = $main.offset().top + parseInt($main.css('border-top-width'));
        var containerTop = $container.offset().top;
        return containerTop > mainTop || containerTop < mainTop;
    },
    _build: function () {
        this.$toolbar = this.dom('<div>').addClass(this.prefix + '-toolbar');
        this.$container.append(this.$toolbar);
        this.app.container.get('bars').addClass('has-toolbar');
    },
    _buildSticky: function () {
        if (this.sticky) {
            var $container = this.app.container.get('bars');
            $container.addClass(this.prefix + '-bars-sticky');
            $container.css('top', this.sticky.stickyTopOffset + 'px');
            var $scrollTarget = this.app.scroll.getTarget();
            $scrollTarget.on('scroll.' + this.prefix + '-toolbar', this._observeSticky.bind(this));
        }
    },
    _buildActiveButtons: function () {
        this.aTags = this.opts.buttons.tags ? this.opts.buttons.tags : {};
        this.aTypes = this.opts.buttons.types ? this.opts.buttons.types : {};
        var btns = this.customButtons;
        for (var key in btns) {
            var active = btns[key].active;
            if (active) {
                this._buildActiveButton(key, active.tags, this.aTags);
                this._buildActiveButton(key, active.types, this.aTypes);
            }
        }
    },
    _buildActiveButton: function (key, arr, obj) {
        if (!arr) return;
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            if (obj[item]) {
                obj[item].push(key);
            } else {
                obj[item] = [key];
            }
        }
    },
    _buildButtons: function () {
        var instance = this._getCurrentInstance();
        var buttons = instance ? this.app.editor.getButtonsFromArr(instance.toolbar) : this.app.editor.getButtons();
        this._createButtons(buttons, instance);
        if (instance) {
            this._createButtons(this.customButtons, instance);
        }
    },
    _createButtons: function (buttons, instance) {
        for (var name in buttons) {
            if (instance && !instance.isAllowedButton(name, buttons[name])) continue;
            if (this._isHidden(name)) continue;
            this.app.create('button', name, buttons[name], this.$toolbar, 'toolbar');
        }
    },
    _observeSticky: function () {
        if (this.app.source.is()) {
            this.app.container.get('bars').css('top', 0);
            return;
        }
        var $scrollTarget = this.app.scroll.getTarget();
        var paddingTop = this.app.scroll.isTarget() ? parseInt($scrollTarget.css('padding-top')) : 0;
        var $container = this.app.container.get('bars');
        $container.css('top', 0 - paddingTop + this.sticky.stickyTopOffset + 'px');
        if (this.isSticky()) {
            this.app.broadcast('toolbar.sticky');
        } else {
            this.app.broadcast('toolbar.static');
        }
    },
    _findButtons: function () {
        return this.$toolbar.find('.' + this.prefix + '-button-toolbar');
    },
    _findButton: function (name) {
        return this.$toolbar.find('[data-name=' + name + ']');
    },
    _isHidden: function (name) {
        return this.opts.toolbar.hide.indexOf(name) !== -1;
    },
    _isToolbar: function () {
        return this.opts.toolbar;
    },
    _isObserveButtons: function () {
        if (!this.opts.buttons.tags && !this.opts.buttons.types) return false;
        return true;
    },
    _setActiveKeys: function (keys) {
        for (var i = 0; i < keys.length; i++) {
            this._findButton(keys[i]).addClass(this.activeClass);
        }
    },
    _getCurrentInstance: function () {
        var instance = this.app.block.is() ? this.app.block.get() : false;
        return this.app.blocks.is() ? false : instance;
    },
    _getObservedTags: function (tag, inlines) {
        var tags = [];
        if (tag) {
            tags.push(tag);
        }
        if (inlines.length > 0) {
            for (var i = 0; i < inlines.length; i++) {
                tags.push(inlines[i].tagName.toLowerCase());
            }
        }
        return tags;
    },
};
