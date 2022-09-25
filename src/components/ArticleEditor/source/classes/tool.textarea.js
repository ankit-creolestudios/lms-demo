module.exports = {
    mixins: ['tool'],
    type: 'textarea',
    input: {
        tag: 'textarea',
        classname: '-form-textarea',
    },
    setFocus: function () {
        this.$input.focus();
        this.$input.get().setSelectionRange(0, 0);
        this.$input.scrollTop(0);
    },
    _buildInput: function () {
        if (this._has('rows')) {
            this.$input.attr('rows', this._get('rows'));
        }
        this.$input.attr('data-gramm_editor', false);
        this.$tool.append(this.$input);
    },
};
