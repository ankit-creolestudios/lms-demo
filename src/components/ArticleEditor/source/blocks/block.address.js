module.exports = {
    mixins: ['block'],
    type: 'address',
    editable: true,
    toolbar: ['add', 'format', 'alignment', 'bold', 'italic', 'deleted', 'link'],
    control: ['trash', 'duplicate'],
    create: function () {
        return this.dom('<address>');
    },
    handleEnter: function (e, key, event) {
        e.preventDefault();
        if (this.isEmpty() || this.isCaretEnd()) {
            var $block = this.getBlock();
            var $nodes = $block.children();
            var len = $nodes.length;
            var $last = $nodes.eq(len - 1);
            var $lastPrev = $nodes.eq(len - 2);
            var html = $block.html().trim();
            html = this.app.utils.removeInvisibleChars(html);
            if (html.search(/<br\s?\/?>$/) !== -1) {
                $lastPrev.remove();
                $last.remove();
                this.insertEmpty({
                    position: 'after',
                    caret: 'start',
                });
                return;
            }
        }
        this.app.insertion.insertBreakline();
        return true;
    },
};
