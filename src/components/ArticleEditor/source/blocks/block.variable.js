module.exports = {
    mixins: ['block'],
    type: 'variable',
    editable: false,
    inline: true,
    toolbar: ['add'],
    create: function () {
        return this.dom('<span>').addClass(this.opts.variable.classname);
    },
    build: function () {
        this.$block.addClass(this.opts.variable.classname);
    },
};
