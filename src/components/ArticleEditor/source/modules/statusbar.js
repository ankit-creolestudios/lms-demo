module.exports = {
    init: function () {
        this.classname = this.prefix + '-statusbar';
    },
    start: function () {
        this._build();
    },
    add: function (name, html) {
        return this.update(name, html);
    },
    update: function (name, html) {
        var $item = this.get(name);
        if ($item.length === 0) {
            $item = this._buildItem(name);
        }
        return $item.html(html);
    },
    get: function (name) {
        var s = name ? '[data-name=' + name + ']' : '[data-name]';
        return this.$statusbar.find(s);
    },
    remove: function (name) {
        this.get(name).remove();
    },
    clear: function () {
        this.$statusbar.html('');
    },
    _build: function () {
        this.$statusbar = this.dom('<div>').attr('dir', this.opts.editor.direction);
        this.$statusbar.addClass(this.classname + ' ' + this.classname + '-' + this.uuid);
        this.app.container.get('statusbar').append(this.$statusbar);
    },
    _buildItem: function (name) {
        var $item = this.dom('<span>').addClass(this.classname + '-item');
        $item.attr('data-name', name);
        this.$statusbar.append($item);
        return $item;
    },
};
