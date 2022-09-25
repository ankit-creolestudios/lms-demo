module.exports = {
    mixins: ['block'],
    type: 'grid',
    nested: true,
    parser: {
        unparse: function ($node) {
            $node.removeClass(this.prefix + '-grid-overlay');
        },
    },
    toolbar: ['add', 'valign'],
    control: ['trash', 'duplicate'],
    create: function () {
        var $block = this.dom('<div>').addClass(this.opts.grid.classname);
        if (this.opts.grid.classes !== '') {
            $block.addClass(this.opts.grid.classes);
        }
        return $block;
    },
    build: function () {
        this._buildOverlay();
    },
    _buildOverlay: function () {
        if (this.opts.grid && this.opts.grid.overlay) {
            this.$block.addClass(this.prefix + '-grid-overlay');
        }
    },
};
