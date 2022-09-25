module.exports = {
    mixins: ['tool'],
    type: 'checkbox',
    input: {
        tag: 'input',
        type: 'checkbox',
        classname: '-form-checkbox',
    },
    getValue: function () {
        return this.$input.val();
    },
    _buildInput: function () {
        this.$box = this.dom('<label>').addClass(this.prefix + '-form-checkbox-item');
        this.$box.append(this.$input);
        if (this._has('text')) {
            var $span = this.dom('<span>').html(this.lang.parse(this.obj.text));
            this.$box.append($span);
        }
        this.$tool.append(this.$box);
    },
};
