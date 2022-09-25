module.exports = {
    mixins: ['block'],
    type: 'quoteitem',
    editable: true,
    toolbar: ['alignment', 'bold', 'italic', 'deleted', 'link'],
    create: function () {
        return this.dom('<p>');
    },
    getBlockquote: function () {
        return this.$block.closest('blockquote');
    },
    handleArrow: function (e, key, event) {
        var $blockquote = this.getBlockquote();
        if ($blockquote.length === 0) return;
        var isStart = this.app.caret.is($blockquote, 'start');
        var isEnd = this.app.caret.is($blockquote, 'end');
        if ((event.is('up-left') && isStart) || (event.is('down-right') && isEnd)) {
            e.preventDefault();
            var parentInstance = this.getParent('quote');
            this.app.block.set(parentInstance);
            return true;
        }
    },
    handleTab: function (e, key, event) {
        e.preventDefault();
        var next = this.getNext();
        if (next) {
            this.app.block.set(next, 'start');
            return true;
        } else {
            var quote = this.getParent('quote');
            this.app.block.set(quote);
            return true;
        }
    },
    handleEnter: function (e, key, event) {
        e.preventDefault();
        var newInstance = this.app.create('block.quoteitem');
        if (this.isEmpty() || this.isCaretEnd()) {
            this.insert({
                instance: newInstance,
                position: 'after',
                caret: 'start',
            });
        } else if (this.isCaretStart()) {
            this.insert({
                instance: newInstance,
                position: 'before',
            });
        } else {
            var $block = this.getBlock();
            var $part = this.app.element.split($block);
            this.app.block.set($part, 'start');
        }
        return true;
    },
};
