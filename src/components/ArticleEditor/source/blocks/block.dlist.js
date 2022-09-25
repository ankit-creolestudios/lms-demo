module.exports = {
    mixins: ['block'],
    type: 'dlist',
    editable: true,
    toolbar: ['add', 'format', 'alignment', 'bold', 'italic', 'deleted', 'link'],
    control: ['trash', 'duplicate'],
    create: function () {
        return this.dom('<dl>');
    },
    getPlainText: function (keepbr) {
        var html = '';
        var $items = this.$block.find('dt, dd');
        var len = $items.length;
        $items.each(function ($node, i) {
            var br = keepbr ? '<br>' : '';
            if (i === len) br = '';
            html += $node.html() + br;
        });
        return html;
    },
    setEmpty: function () {
        this.$block.html('');
        var $item = this.dom('<dt>');
        this.$block.append($item);
        this.app.caret.set($item, 'start');
    },
    isEmpty: function () {
        var html = this.$block.html();
        html = this._cleanEmpty(html);
        var $items = this.$block.find('dt, dd');
        if ($items.length === 0) {
            html = html.trim();
            return html === '';
        } else if ($items.length === 1) {
            html = $items.eq(0).html();
            html = this._cleanEmpty(html);
            return html === '';
        }
        return false;
    },
    handleEnter: function (e, key, event) {
        e.preventDefault();
        if (this.isEmpty() || this.isCaretEnd()) {
            var currentItem = this.app.selection.getBlock();
            var $currentItem = this.dom(currentItem);
            var tag = currentItem.tagName.toLowerCase();
            var isItemEmpty = this.app.content.isEmptyHtml(currentItem.innerHTML);
            if (tag === 'dt' && isItemEmpty) {
                $currentItem.remove();
                this.insertEmpty({
                    position: 'after',
                    caret: 'start',
                });
                return true;
            }
            var $newItem;
            if (tag === 'dt') {
                $newItem = this.dom('<dd>');
            } else {
                $newItem = this.dom('<dt>');
            }
            this.dom(currentItem).after($newItem);
            this.app.caret.set($newItem, 'start');
        } else if (this.isCaretStart()) {
            return true;
        } else {
            this.app.insertion.insertBreakline();
        }
        return true;
    },
};
