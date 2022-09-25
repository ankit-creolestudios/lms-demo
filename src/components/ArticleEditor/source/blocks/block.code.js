module.exports = {
    mixins: ['block'],
    type: 'code',
    editable: true,
    toolbar: ['add'],
    control: ['trash', 'duplicate'],
    create: function () {
        return this.dom(this.opts.code.template);
    },
    build: function () {
        this._buildCaption();
        this._buildItems('figcaption', 'figcaption');
    },
    handleArrow: function (e, key, event) {
        if (event.is('down-right') && this.isCaretEnd()) {
            var next = this.getNext();
            if (next) {
                this.app.block.set(next, 'start');
                return true;
            } else {
                this.app.insertion.insertEmptyBlock({
                    position: 'after',
                    caret: 'start',
                });
                return true;
            }
        }
    },
    handleTab: function (e, key, event) {
        e.preventDefault();
        var num = this.opts.code.spaces;
        var node = document.createTextNode(Array(num + 1).join(' '));
        this.app.insertion.insertNode(node, 'end');
        return true;
    },
    handleEnter: function (e, key, event) {
        e.preventDefault();
        var last = this.$block.html().search(/\n$/);
        if (this.isCaretEnd() && last === -1) {
            this.app.insertion.insertNewline('after', true);
        } else {
            this.app.insertion.insertNewline();
        }
        return true;
    },
};
