module.exports = {
    init: function (name, popup, obj) {
        this.name = name;
        this.obj = obj;
        this.popup = popup;
        this.$button = this.dom('<button>').addClass(this.prefix + '-form-button');
        this.$button.attr('data-name', this.name);
        this.$button.html(this.lang.parse(this.obj.title));
        this.$button.dataset('instance', this);
        if (this._has('type')) this.$button.addClass(this.prefix + '-form-button-' + this.obj.type);
        if (this._has('classname')) this.$button.addClass(this.obj.classname);
        if (this._has('fullwidth')) this.$button.addClass(this.prefix + '-form-button-fullwidth');
        if (this._has('right')) this.$button.addClass(this.prefix + '-form-button-push-right');
        this.$button.on('click.' + this.prefix + '-popup-button' + this.uuid, this._catch.bind(this));
    },
    getName: function () {
        return this.name;
    },
    getElement: function () {
        return this.$button;
    },
    invokeCommand: function () {
        this._invoke();
    },
    _has: function (name) {
        return Object.prototype.hasOwnProperty.call(this.obj, name);
    },
    _catch: function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (this._has('command')) {
            this._invoke(e);
        } else if (this._has('close')) {
            this.app.popup.close();
        }
    },
    _invoke: function (e) {
        this.app.api(this.obj.command, this.popup, this.name, e);
    },
};
