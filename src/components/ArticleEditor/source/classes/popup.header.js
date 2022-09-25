module.exports = {
    init: function (popup) {
        this.popup = popup;
        this._build();
    },
    setActive: function (stack) {
        this.$headerbox.find('.' + this.prefix + '-popup-header-item').removeClass('active');
        this.$headerbox.find('[data-' + this.prefix + '-name=' + stack.getName() + ']').addClass('active');
    },
    render: function (stacks) {
        this._reset();
        var len = this._buildItems(stacks);
        if (len > 0) {
            this._buildClose();
        }
    },
    _build: function () {
        this.$header = this.dom('<div>').addClass(this.prefix + '-popup-header');
        this.$headerbox = this.dom('<div>').addClass(this.prefix + '-popup-header-box');
        this.$header.append(this.$headerbox);
        this.popup.getElement().prepend(this.$header);
    },
    _buildClose: function () {
        var $close = this.dom('<span>').addClass(this.prefix + '-popup-close');
        $close.one('click', this._catchClose.bind(this));
        this.$header.append($close);
    },
    _buildItems: function (stacks) {
        var len = Object.keys(stacks).length;
        var count = 0;
        var z = 0;
        for (var key in stacks) {
            if (typeof stacks[key] !== 'object') {
                continue;
            }
            z++;
            var title = stacks[key].get('title');
            if (title) {
                count++;
                this._buildItem(stacks[key], title, len);
            } else if (z === 1 && len > 1) {
                count++;
                this._buildItem(stacks[key], '## popup.back ##', len);
            }
        }
        return count;
    },
    _buildItem: function (stack, title, len) {
        var isLink = len > 1;
        var $item = isLink ? this.dom('<a>').attr('href', '#') : this.dom('<span>');
        if (isLink) {
            $item.dataset('stack', stack);
            $item.addClass(this.prefix + '-popup-header-item-link');
            $item.on('click', this._catchStack.bind(this));
        }
        $item.attr('data-' + this.prefix + '-name', stack.getName());
        $item.addClass(this.prefix + '-popup-header-item');
        $item.html(this.lang.parse(title));
        this.$headerbox.append($item);
    },
    _reset: function () {
        this.$headerbox.html('');
        this.$header.find('.' + this.prefix + '-popup-close').remove();
    },
    _catchStack: function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $item = this.dom(e.target);
        var stack = $item.dataget('stack');
        var current = this.app.popup.getStack();
        if (current.isCollapsed()) {
            this.app.popup.removeStack(current);
        }
        stack.open();
    },
    _catchClose: function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.popup.close();
    },
};
