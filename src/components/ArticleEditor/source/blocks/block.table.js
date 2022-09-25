module.exports = {
    mixins: ['block'],
    type: 'table',
    toolbar: ['add', 'table'],
    control: ['trash', 'duplicate'],
    create: function () {
        return this.dom(this.opts.table.template);
    },
    build: function () {
        this._buildItems('tr', 'row');
        this._buildItems('td, th', 'cell');
    },
    getFirstCell: function () {
        var $cell = this.$block.find('th, td').first();
        if ($cell.length !== 0) {
            return $cell.dataget('instance');
        }
    },
};
