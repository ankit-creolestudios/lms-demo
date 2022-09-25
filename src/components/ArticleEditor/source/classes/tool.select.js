module.exports = {
    mixins: ['tool'],
    type: 'select',
    input: {
        tag: 'select',
        classname: '-form-select',
    },
    _buildInput: function () {
        for (var value in this.obj.options) {
            var $option = this.dom('<option>');
            $option.val(value);
            $option.html(this.lang.parse(this.obj.options[value]));
            this.$input.append($option);
        }
        this.$tool.append(this.$input);
    },
};
