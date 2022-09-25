module.exports = {
    mixins: ['block'],
    type: 'cell',
    editable: true,
    toolbar: ['table', 'alignment', 'bold', 'italic', 'deleted', 'link', 'table-tune'],
    create: function () {
        return this.dom('<td>');
    },
    getNextCell: function () {
        var cell = this.getNext();
        if (!cell) {
            var row = this.getParent('row');
            if (row) {
                var nextRow = row.getNextRow();
                if (nextRow) {
                    cell = nextRow.getChildFirst('cell');
                }
            }
        }
        return cell;
    },
    getPrevCell: function () {
        var cell = this.getPrev();
        if (!cell) {
            var row = this.getParent('row');
            if (row) {
                var prevRow = row.getPrevRow();
                if (prevRow) {
                    cell = prevRow.getChildLast('cell');
                }
            }
        }
        return cell;
    },
    getWidth: function () {
        var value = this.$block.attr('width');
        return value ? value : '';
    },
    getNowrap: function () {
        var value = this.$block.css('white-space');
        return value === 'nowrap';
    },
    setWidth: function (value) {
        this._eachCell(function ($cell) {
            if (value === '') {
                $cell.removeAttr('width');
            } else {
                value = value.search('%') !== -1 ? value : value.replace('px', '');
                $cell.attr('width', value);
            }
        });
    },
    setNowrap: function (value) {
        this._eachCell(function ($cell) {
            value = value ? 'nowrap' : '';
            $cell.css('white-space', value);
        });
    },
    handleArrow: function (e, key, event) {
        var parentInstance;
        if (event.is('up-left') && this.isCaretStart()) {
            e.preventDefault();
            var prev = this.getPrevCell();
            if (prev) {
                this.app.block.set(prev, 'end');
            } else {
                parentInstance = this.getParent('table');
                this.app.block.set(parentInstance);
            }
            return true;
        } else if (event.is('down-right') && this.isCaretEnd()) {
            e.preventDefault();
            var next = this.getNextCell();
            if (next) {
                this.app.block.set(next, 'start');
            } else {
                parentInstance = this.getParent('table');
                this.app.block.set(parentInstance);
            }
            return true;
        }
    },
    handleTab: function (e, key, event) {
        e.preventDefault();
        var next = this.getNextCell();
        if (next) {
            this.app.block.set(next, 'start');
        } else {
            var parentInstance = this.getParent('table');
            this.app.block.set(parentInstance);
        }
        return true;
    },
    handleEnter: function (e, key, event) {
        e.preventDefault();
        this.app.insertion.insertBreakline();
        return true;
    },
    _eachCell: function (func) {
        var index = 0;
        var $table = this.$block.closest('table');
        this.$block
            .closest('tr')
            .find('td, th')
            .each(
                function ($node, i) {
                    if ($node.get() === this.$block.get()) index = i;
                }.bind(this)
            );
        $table.find('tr').each(
            function ($node) {
                var cell = $node.find('td, th').get(index);
                var $cell = this.dom(cell);
                func($cell);
            }.bind(this)
        );
    },
};
