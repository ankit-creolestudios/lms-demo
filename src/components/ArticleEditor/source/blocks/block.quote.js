module.exports = {
    mixins: ['block'],
    type: 'quote',
    toolbar: ['add'],
    control: ['trash', 'duplicate'],
    create: function () {
        return this.dom(this.opts.quote.template);
    },
    build: function () {
        this._buildCaption();
        this._buildItems('p', 'quoteitem');
        this._buildItems('figcaption', 'figcaption');
    },
};
