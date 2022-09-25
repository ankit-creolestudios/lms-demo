module.exports = {
    mixins: ['block'],
    type: 'row',
    toolbar: ['table'],
    create: function () {
        return this.dom('<tr>');
    },
    getNextRow: function () {
        var row = this.getNext();
        var $parent = this.$block.parent();
        if (!row && $parent.get().tagName !== 'TABLE') {
            row = $parent.nextElement().find('tr').first().dataget('instance');
        }
        return row;
    },
    getPrevRow: function () {
        var row = this.getPrev();
        var $parent = this.$block.parent();
        if (!row && $parent.get().tagName !== 'TABLE') {
            row = $parent.prevElement().find('tr').last().dataget('instance');
        }
        return row;
    },
    handleDelete: function (e, key, event) {
        e.preventDefault();
        return true;
    },
    handleArrow: function (e, key, event) {
        e.preventDefault();
        if (event.is('up-left')) {
            var parentInstance = this.getParent('table');
            this.app.block.set(parentInstance);
        } else {
            var cellInstance = this.getChildFirst('cell');
            this.app.block.set(cellInstance, 'start');
        }
        return true;
    },
    handleTab: function (e, key, event) {
        e.preventDefault();
        var next = this.getNextRow();
        if (next) {
            this.app.block.set(next);
        } else {
            var parentInstance = this.getParent('table');
            this.app.block.set(parentInstance);
        }
        return true;
    },
    handleEnter: function (e, key, event) {
        e.preventDefault();
        return true;
    },
};
