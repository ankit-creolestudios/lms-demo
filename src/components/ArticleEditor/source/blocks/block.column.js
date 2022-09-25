module.exports = {
    mixins: ['block'],
    type: 'column',
    nested: true,
    emptiable: true,
    toolbar: ['alignment'],
    create: function () {
        return this.dom('<div>');
    },
};
