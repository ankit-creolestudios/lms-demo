module.exports = {
    popups: {
        cell: {
            title: '## table.table-cell ##',
            width: '300px',
            form: {
                width: {
                    type: 'input',
                    label: '## table.width ##',
                },
                nowrap: {
                    type: 'checkbox',
                    text: '## table.nowrap ##',
                },
            },
            footer: {
                insert: {
                    title: '## table.save ##',
                    command: 'table.save',
                    type: 'primary',
                },
                cancel: {
                    title: '## table.cancel ##',
                    command: 'popup.close',
                },
            },
        },
    },
    items: {
        table: {
            addhead: {
                title: '## table.add-head ##',
                command: 'table.addHead',
            },
            removehead: {
                title: '## table.remove-head ##',
                command: 'table.removeHead',
            },
        },
        row: {
            addrowbelow: {
                title: '## table.add-row-below ##',
                command: 'table.addRowBelow',
            },
            addrowabove: {
                title: '## table.add-row-above ##',
                command: 'table.addRowAbove',
            },
            removerow: {
                title: '## table.remove-row ##',
                command: 'table.removeRow',
            },
        },
        cell: {
            addcolumnafter: {
                title: '## table.add-column-after ##',
                command: 'table.addColumnAfter',
            },
            addcolumnbefore: {
                title: '## table.add-column-before ##',
                command: 'table.addColumnBefore',
            },
            addrowbelow: {
                title: '## table.add-row-below ##',
                command: 'table.addRowBelow',
            },
            addrowabove: {
                title: '## table.add-row-above ##',
                command: 'table.addRowAbove',
            },
            removecolumn: {
                title: '## table.remove-column ##',
                command: 'table.removeColumn',
            },
            removerow: {
                title: '## table.remove-row ##',
                command: 'table.removeRow',
            },
        },
    },
    add: function () {
        var instance = this.app.block.add({
            name: 'table',
            source: this.opts.table.template,
            caret: false,
        });
        var cell = instance.getFirstCell();
        if (cell) {
            this.app.block.set(cell, 'start');
        }
    },
    observe: function (obj, name, stack) {
        if (!this.opts.table) {
            return false;
        }
        var instance = this.app.block.get();
        if (stack && stack.getName() === 'addbar') {
            obj.command = 'table.add';
        } else if (instance && instance.isType(['table', 'row', 'cell'])) {
            obj.command = 'table.popup';
        }
        return obj;
    },
    popup: function (params, button) {
        var instance = this.app.block.get();
        var type = instance.getType();
        this.app.popup.create('table', {
            items: this.items[type],
        });
        this.app.popup.open({
            button: button,
        });
    },
    addHead: function () {
        this.removeHead();
        var instance = this.app.block.get();
        var $block = instance.getBlock();
        var columns = $block.find('tr').first().children('td, th').length;
        var $head = this.dom('<thead>');
        var $row = this._buildRow(columns, '<th>');
        $head.append($row);
        $block.prepend($head);
        this.app.block.set($row.children('td, th').first(), 'start');
    },
    addRowBelow: function () {
        this._addRow('below');
    },
    addRowAbove: function () {
        this._addRow('above');
    },
    addColumnBefore: function () {
        this._addColumn('before');
    },
    addColumnAfter: function () {
        this._addColumn('after');
    },
    removeHead: function () {
        this.app.popup.close();
        var instance = this.app.block.get();
        var $block = instance.getBlock();
        var $head = $block.find('thead');
        if ($head.length !== 0) {
            $head.remove();
        }
    },
    removeRow: function () {
        this.app.popup.close();
        this.app.control.close();
        var instance = this.app.block.get();
        if (instance.getType() === 'cell') {
            instance = instance.getParent(['row']);
        }
        instance.remove(true);
    },
    removeColumn: function () {
        this.app.popup.close();
        this.app.control.close();
        var instance = this.app.block.get();
        var $block = instance.getBlock();
        var $table = $block.closest('table');
        var $row = $block.closest('tr');
        var index = 0;
        $row.find('td, th').each(function ($node, i) {
            if ($node.get() === $block.get()) index = i;
        });
        $table.find('tr').each(
            function ($node) {
                var cell = $node.find('td, th').get(index);
                var $cell = this.dom(cell);
                $cell.remove();
            }.bind(this)
        );
    },
    cellSetting: function (params, button) {
        var instance = this.app.block.get();
        var popup = this.app.popup.create('cell', this.popups.cell);
        popup.setData({
            width: instance.getWidth(),
            nowrap: instance.getNowrap(),
        });
        this.app.popup.open({
            button: button,
            focus: 'width',
        });
    },
    save: function (stack) {
        this.app.popup.close();
        var data = stack.getData();
        var instance = this.app.block.get();
        if (data.width !== '') {
            instance.setWidth(data.width);
        }
        instance.setNowrap(data.nowrap);
    },
    _addColumn: function (name) {
        this.app.popup.close();
        var instance = this.app.block.get();
        var $block = instance.getBlock();
        var $table = $block.closest('table');
        var $row = $block.closest('tr');
        var index = 0;
        $row.find('td, th').each(function ($node, i) {
            if ($node.get() === $block.get()) index = i;
        });
        var rowIndex = 0;
        $table.find('tr').each(function ($node, i) {
            if ($node.get() === $row.get()) rowIndex = i;
        });
        var $newCell;
        $table.find('tr').each(
            function ($node, i) {
                var cell = $node.find('td, th').get(index);
                var $cell = this.dom(cell);
                var $td = $cell.clone();
                $td.html('');
                this.app.create('block.cell', $td);
                if (rowIndex === i) {
                    $newCell = $td;
                }
                $cell[name]($td);
            }.bind(this)
        );
        if ($newCell) {
            this.app.block.set($newCell, 'start');
        }
    },
    _addRow: function (name) {
        this.app.popup.close();
        var position = name === 'below' ? 'after' : 'before';
        var instance = this.app.block.get();
        var $block = instance.getBlock();
        var $row = $block.closest('tr');
        var $head = $block.closest('thead');
        var columns = $row.children('td, th').length;
        var $newRow = this._buildRow(columns, '<td>');
        if ($head.length !== 0) {
            $head.after($newRow);
        } else {
            $row[position]($newRow);
        }
        this.app.block.set($newRow.find('td, th').first(), 'start');
    },
    _buildRow: function (columns, tag) {
        var $row = this.dom('<tr>');
        this.app.create('block.row', $row);
        for (var i = 0; i < columns; i++) {
            var $cell = this.dom(tag);
            this.app.create('block.cell', $cell);
            $row.append($cell);
        }
        return $row;
    },
};
