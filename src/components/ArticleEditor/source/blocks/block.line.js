module.exports = {
    mixins: ['block'],
    type: 'line',
    toolbar: ['add'],
    control: ['trash', 'duplicate'],
    create: function () {
        return this.dom('<hr>');
    },
};
