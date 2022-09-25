module.exports = {
    mixins: ['block'],
    type: 'figcaption',
    editable: true,
    toolbar: ['alignment', 'bold', 'italic', 'deleted', 'link'],
    create: function () {
        return this.dom('<figcaption>');
    },
    getFigure: function () {
        return this.$block.closest('figure').dataget('instance');
    },
    handleArrow: function (e, key, event) {
        if ((event.is('up-left') && this.isCaretStart()) || (event.is('down-right') && this.isCaretEnd())) {
            e.preventDefault();
            var parentInstance = this.getFigure();
            this.app.block.set(parentInstance);
            return true;
        }
    },
    handleTab: function (e, key, event) {
        e.preventDefault();
        var parentInstance = this.getFigure();
        this.app.block.set(parentInstance);
        return true;
    },
    handleEnter: function (e, key, event) {
        e.preventDefault();
        if (this.isEmpty() || this.isCaretEnd() || this.isCaretStart()) {
            return true;
        } else {
            this.app.insertion.insertBreakline();
        }
        return true;
    },
};
