module.exports = {
    init: function () {
        this.activeClass = 'active';
        this.toggledClass = 'disable';
        this.disableClass = 'disable';
        this.customButtons = {};
    },
    start: function () {
        if (!this._isTopbar()) return;
        this._build();
    },
    load: function () {
        this._buildButtons();
    },
    get: function (name) {
        return this._findButton(name);
    },
    add: function (name, obj) {
        this.customButtons[name] = obj;
    },
    setToggled: function (name) {
        if (!this._isTopbar()) return;
        this._findButtons().removeClass(this.toggledClass);
        this._findButton(name).addClass(this.toggledClass);
    },
    unsetToggled: function (name) {
        if (!this._isTopbar()) return;
        var $elms = name ? this._findButton(name) : this._findButtons();
        $elms.removeClass(this.toggledClass);
    },
    enable: function () {
        if (!this._isTopbar()) return;
        this._findButtons().removeClass(this.disableClass);
    },
    disable: function () {
        if (!this._isTopbar()) return;
        var $btns = this._findButtons();
        $btns.removeClass(this.toggledClass).removeClass(this.activeClass).addClass(this.disableClass);
    },
    _isTopbar: function () {
        return this.opts.path;
    },
    _build: function () {
        this.$topbar = this.dom('<div>').addClass(this.prefix + '-topbar');
        this.app.container.get('pathbar').append(this.$topbar);
    },
    _buildButtons: function () {
        var buttons = this.app.editor.getButtonsFromArr(this.opts.buttons.topbar);
        for (var name in buttons) {
            if (name === 'undo' && !this.opts.topbar.undoredo) continue;
            if (name === 'redo' && !this.opts.topbar.undoredo) continue;
            if (name === 'shortcut' && !this.opts.topbar.shortcuts) continue;
            this.app.create('button', name, buttons[name], this.$topbar, 'topbar');
        }
    },
    _findButtons: function () {
        return this.$topbar.find('.' + this.prefix + '-button-topbar');
    },
    _findButton: function (name) {
        return this.$topbar.find('[data-name=' + name + ']');
    },
};
