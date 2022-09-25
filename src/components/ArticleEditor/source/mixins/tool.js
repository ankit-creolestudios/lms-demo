module.exports = {
    init: function (name, obj, popup, data) {
        this.name = name;
        this.setter = popup.get('setter');
        this.popup = popup;
        this.data = data;
        this.obj = this._observe(obj);
        if (this.obj) {
            this._build();
        }
    },
    getElement: function () {
        return this.$tool;
    },
    getInput: function () {
        return this.$input;
    },
    getValue: function () {
        var value = this.$input.val();
        return value.trim();
    },
    setValue: function (value) {
        this.$input.val(value);
    },
    setFocus: function () {
        this.$input.focus();
    },
    trigger: function (value) {
        this.setValue(value);
        if (this.setter) {
            this.app.api(this.setter, this.popup);
        }
    },
    _build: function () {
        this._buildTool();
        this._buildLabel();
        this._buildInputElement();
        this._buildInput();
        this._buildEvent();
        if (this._has('placeholder')) this.$input.attr('placeholder', this.lang.parse(this.obj.placeholder));
        if (this._has('width')) this.$input.css('width', this.obj.width);
        if (this._has('classname')) this.$input.addClass(this.obj.classname);
    },
    _buildInputElement: function () {
        this.$input = this.dom('<' + this._getInputParam('tag') + '>').addClass(
            this.prefix + this._getInputParam('classname')
        );
        this.$input.attr({
            name: this.name,
            type: this._getInputParam('type'),
            'data-type': this.type,
        });
        this.$input.dataset('instance', this);
    },
    _buildInput: function () {
        return;
    },
    _buildEvent: function () {
        var types = ['segment'];
        if (types.indexOf(this.type) === -1 && this.setter) {
            var events = this.type === 'checkbox' || this.type === 'select' ? 'change' : 'keydown blur';
            events = this.type === 'number' ? events + ' change' : events;
            this.$input.on(events, this._catchSetter.bind(this));
        }
    },
    _buildTool: function () {
        this.$tool = this.dom('<div>')
            .addClass(this.prefix + '-form-item')
            .dataset('instance', this);
    },
    _buildLabel: function () {
        if (this.type !== 'checkbox' && this._has('label')) {
            this.$label = this.dom('<label>')
                .addClass(this.prefix + '-form-label')
                .html(this.lang.parse(this.obj.label));
            this.$tool.append(this.$label);
        }
    },
    _getInputParam: function (name) {
        return this.input && typeof this.input[name] !== 'undefined' ? this.input[name] : '';
    },
    _get: function (name) {
        return this.obj[name];
    },
    _has: function (name) {
        return Object.prototype.hasOwnProperty.call(this.obj, name);
    },
    _observe: function (obj) {
        if (Object.prototype.hasOwnProperty.call(obj, 'observer')) {
            obj = this.app.api(obj.observer, obj, this.name);
        }
        return obj;
    },
    _catchSetter: function (e) {
        if (e.type === 'keydown' && e.which !== 13) return;
        if (e.type === 'keydown') e.preventDefault();
        this.app.api(this.setter, this.popup);
    },
};
