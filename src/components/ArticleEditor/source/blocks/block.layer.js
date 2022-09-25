module.exports = {
    mixins: ['block'],
    type: 'layer',
    nested: true,
    emptiable: true,
    toolbar: ['add'],
    control: ['trash', 'duplicate'],
    create: function () {
        return this.dom(this.opts.layer.template);
    },
    getTitle: function () {
        var title = this.$block.attr('data-title');
        return title || this._getNameByTag();
    },
};
