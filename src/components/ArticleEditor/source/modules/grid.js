module.exports = {
    popup: function () {
        var stack = this.app.popup.add('grid', {
            title: '## popup.grid ##',
            width: '320px',
            items: this.buildItems(),
        });
        stack.open();
    },
    observe: function () {
        if (!this.opts.grid) return false;
    },
    buildItems: function () {
        var items = {};
        var z = 0;
        for (var pattern in this.opts.grid.patterns) {
            z++;
            var $item = this._createPattern(pattern);
            items['column' + z] = {
                html: $item,
                command: 'grid.add',
                params: {
                    pattern: pattern,
                    columns: this.opts.grid.patterns[pattern],
                },
            };
        }
        return items;
    },
    add: function (params) {
        this.app.popup.close();
        var pattern = params.columns === '';
        var columns = pattern ? params.pattern.split('|') : params.columns.split('|');
        var $grid = this.dom('<div>').addClass(this.opts.grid.classname);
        if (this.opts.grid.classes !== '') {
            $grid.addClass(this.opts.grid.classes);
        }
        for (var i = 0; i < columns.length; i++) {
            var column = this.app.create('block.column');
            var $column = column.getBlock();
            if (!pattern) {
                $column.addClass(columns[i]);
            }
            $grid.append($column);
        }
        var instance = this.app.block.add({
            name: 'grid',
            source: $grid,
            caret: false,
        });
        this.app.block.set(instance);
    },
    _createPattern: function (pattern) {
        var $item = this.dom('<div>').addClass(this.prefix + '-popup-grid-box');
        var columns = pattern.split('|');
        var sum = this.app.utils.sumOfArray(columns);
        var unit = 100 / sum;
        for (var i = 0; i < columns.length; i++) {
            var $column = this.dom('<span>');
            $column.addClass(this.prefix + '-popup-grid-column');
            $column.css('width', columns[i] * unit + '%');
            $item.append($column);
        }
        return $item;
    },
};
