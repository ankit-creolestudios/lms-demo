module.exports = {
    mixins: ['block'],
    type: 'text',
    editable: true,
    toolbar: ['add', 'format', 'alignment', 'bold', 'italic', 'deleted', 'link'],
    control: ['trash', 'duplicate'],
    create: function () {
        return this.dom('<div>').addClass(this.opts.text.classname);
    },
    handleEnter: function (e, key, event) {
        e.preventDefault();
        this.app.insertion.insertBreakline();
        return true;
    },
};
