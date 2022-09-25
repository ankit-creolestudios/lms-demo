module.exports = {
    mixins: ['block'],
    type: 'form',
    create: function () {
        return this.dom('<form>');
    },
    control: {
        trash: {
            command: 'block.remove',
            title: '## buttons.delete ##',
        },
        duplicate: {
            command: 'block.duplicate',
            title: '## buttons.duplicate ##',
        },
    },
};
