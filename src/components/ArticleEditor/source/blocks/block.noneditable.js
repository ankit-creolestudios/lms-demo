module.exports = {
    mixins: ['block'],
    type: 'noneditable',
    toolbar: ['add'],
    control: ['trash', 'duplicate'],
    create: function () {
        return this.dom('<div>').addClass(this.opts.noneditable.classname);
    },
};
