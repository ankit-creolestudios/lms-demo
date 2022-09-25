module.exports = {
    getContent: function (clipboard) {
        var type = this.isPlainText(clipboard) ? 'text/plain' : 'text/html';
        var html = clipboard.getData(type);
        return type === 'text/plain' ? this.app.content.escapeHtml(html) : html;
    },
    setContent: function (e, html, text) {
        var clipboard = e.clipboardData;
        html = this.app.parser.unparse(html);
        html = '<meta type="' + this.prefix + '-editor"/>' + html;
        text =
            text ||
            this.app.content.getTextFromHtml(html, {
                nl: true,
            });
        clipboard.setData('text/html', html);
        clipboard.setData('text/plain', text);
    },
    isPlainText: function (clipboard) {
        var text = clipboard.getData('text/plain');
        var html = clipboard.getData('text/html');
        if (html && html.trim() !== '') {
            return false;
        } else {
            return text !== null;
        }
    },
};
