module.exports = {
    start: function () {
        this._buildRole();
        this._buildLabel();
    },
    _buildRole: function () {
        this.app.editor.getEditor().attr({
            'aria-labelledby': this.prefix + '-voice',
            role: 'presentation',
        });
    },
    _buildLabel: function () {
        var html = this.lang.get('accessibility.help-label');
        var $label = this._createLabel(html);
        this.app.container.get('main').prepend($label);
    },
    _createLabel: function (html) {
        var $label = this.dom('<span />').addClass(this.prefix + '-voice-label');
        $label.attr({
            id: this.prefix + '-voice-' + this.uuid,
            'aria-hidden': false,
        });
        $label.html(html);
        return $label;
    },
};
