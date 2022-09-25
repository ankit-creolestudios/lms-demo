module.exports = {
    mixins: ['tool'],
    type: 'input',
    input: {
        tag: 'input',
        type: 'text',
        classname: '-form-input',
    },
    _buildInput: function () {
        this.$tool.append(this.$input);
    },
};
