module.exports = {
    mixins: ['block'],
    type: 'list',
    editable: true,
    toolbar: ['add', 'format', 'alignment', 'bold', 'italic', 'deleted', 'outdent', 'indent', 'link'],
    control: ['trash', 'duplicate'],
    create: function () {
        return this.dom('<ul>');
    },
    unparse: function ($el) {
        this.app.content.unfixListMargin($el);
    },
    setEmpty: function () {
        this.$block.html('');
        var $item = this.dom('<li>');
        this.$block.append($item);
        this.app.caret.set($item, 'start');
    },
    isEmpty: function () {
        var html = this.$block.html();
        html = this._cleanEmpty(html);
        var $items = this.$block.find('li');
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
    handleTab: function (e, key, event) {
        var currentItem = this.app.selection.getBlock();
        var isItemStart = this.app.caret.is(currentItem, 'start');
        if (this.isCaretStart() || this.isCaretEnd()) {
            var next = this.getNext();
            if (next) {
                e.preventDefault();
                this.app.block.set(next, 'start');
                return true;
            }
        } else {
            if (this.opts.tab.spaces && !isItemStart) {
                return;
            }
            e.preventDefault();
            this.app.list.indent();
            return true;
        }
    },
    handleEnter: function (e, key, event) {
        e.preventDefault();
        var $newItem, $currentItem, currentItem, isItemEmpty;
        if (this.isEmpty() || this.isCaretEnd()) {
            currentItem = this.app.selection.getBlock();
            $currentItem = this.dom(currentItem);
            isItemEmpty = this.app.content.isEmptyHtml(currentItem.innerHTML);
            if (isItemEmpty) {
                $currentItem.remove();
                this.insertEmpty({
                    position: 'after',
                    caret: 'start',
                });
                return true;
            }
            $newItem = this.dom('<li>');
            this.app.element.cloneAttrs(currentItem, $newItem);
            this.dom(currentItem).after($newItem);
            this.app.caret.set($newItem, 'start');
        } else if (this.isCaretStart()) {
            $newItem = this.dom('<li>');
            currentItem = this.app.selection.getBlock();
            this.app.element.cloneAttrs(currentItem, $newItem);
            this.dom(currentItem).before($newItem);
        } else {
            currentItem = this.app.selection.getBlock();
            $currentItem = this.dom(currentItem);
            isItemEmpty = this.app.content.isEmptyHtml(currentItem.innerHTML);
            var isItemStart = this.app.caret.is(currentItem, 'start');
            var isItemEnd = this.app.caret.is(currentItem, 'end', ['ul', 'ol']);
            $newItem = this.dom('<li>');
            this.app.element.cloneAttrs(currentItem, $newItem);
            if (isItemEmpty) {
                $currentItem.after($newItem);
                this.app.caret.set($newItem, 'start');
            } else if (isItemStart) {
                $currentItem.before($newItem);
            } else if (isItemEnd) {
                var $listInside = $currentItem.find('ul, ol').first();
                if ($listInside.length !== 0) {
                    $newItem.append(this.app.utils.createInvisibleChar());
                    $newItem.append($listInside);
                    $currentItem.after($newItem);
                } else {
                    $currentItem.after($newItem);
                }
                this.app.caret.set($newItem, 'start');
            } else {
                var $part = this.app.element.split(currentItem);
                this.app.caret.set($part, 'start');
            }
        }
        return true;
    },
};
