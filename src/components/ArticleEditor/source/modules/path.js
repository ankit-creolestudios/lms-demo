module.exports = {
    init: function () {
        this.activeClass = 'active';
        this.disableClass = 'disable';
        this.pathItemClass = this.prefix + '-path-item';
    },
    start: function () {
        if (!this.opts.path) return;
        this.$container = this.app.container.get('pathbar');
        this._build();
        this._buildRoot();
        this._buildActive();
    },
    build: function () {
        if (!this.opts.path) return;
        this._clear();
        this._buildRoot();
        if (this.app.blocks.is()) {
            this._buildMultipleItem();
        } else {
            this._buildItems();
            this._buildActive();
        }
    },
    disable: function () {
        if (!this.opts.path) return;
        this._getAll().addClass(this.disableClass);
    },
    enable: function () {
        if (!this.opts.path) return;
        this._getAll().removeClass(this.disableClass);
    },
    _clear: function () {
        this.$path.find('.' + this.pathItemClass).off('.' + this.prefix + '-path-' + this.uuid);
        this.$path.html('');
    },
    _getAll: function () {
        return this.$path.find('.' + this.pathItemClass);
    },
    _selectItem: function (e) {
        e.stopPropagation();
        e.preventDefault();
        var $item = this.dom(e.target).closest('.' + this.pathItemClass);
        if ($item.hasClass(this.disableClass)) return;
        var instance = $item.dataget('instance');
        if (instance) {
            this.app.popup.close();
            this.app.block.set(instance, 'start');
        } else {
            this._clear();
            this._buildRoot();
            this._buildActive();
            this.app.block.unset();
        }
    },
    _createItem: function () {
        return this.dom('<a href="#"></a>').attr('tabindex', '-1').addClass(this.pathItemClass);
    },
    _build: function () {
        this.$path = this.dom('<div>').addClass(this.prefix + '-path');
        this.$container.append(this.$path);
    },
    _buildRoot: function () {
        this._buildItem(false, this.lang.parse(this.opts.path.title));
    },
    _buildActive: function () {
        this.$path.find('a').removeClass(this.activeClass).last().addClass(this.activeClass);
    },
    _buildItems: function () {
        var current = this.app.block.get();
        if (!current) return;
        var $parents = current.getBlock().parents('[data-' + this.prefix + '-type]');
        $parents.nodes.reverse();
        $parents.each(this._buildParentItem.bind(this));
        this._buildItem(current);
    },
    _buildParentItem: function ($el) {
        var instance = $el.dataget('instance');
        this._buildItem(instance);
    },
    _buildMultipleItem: function () {
        var $item = this._createItem();
        $item.addClass(this.activeClass);
        this._buildTitle($item, this.lang.get('editor.multiple'));
        this.$path.append($item);
    },
    _buildItem: function (instance, root) {
        var $item = this._createItem();
        $item.dataset('instance', instance);
        $item.on('click.' + this.prefix + '-path-' + this.uuid, this._selectItem.bind(this));
        this._buildTitle($item, root || instance.getTitle());
        this.$path.append($item);
    },
    _buildTitle: function ($item, title) {
        var $title = this.dom('<span>').html(title);
        $item.append($title);
    },
};
