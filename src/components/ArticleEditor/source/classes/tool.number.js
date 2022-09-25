module.exports = {
    mixins: ['tool'],
    type: 'number',
    input: {
        tag: 'input',
        type: 'number',
        classname: '-form-input',
    },
    _buildInput: function () {
        this.$input.attr('min', 0).css('max-width', '65px');
        this.$tool.append(this.$input);
    },
};
