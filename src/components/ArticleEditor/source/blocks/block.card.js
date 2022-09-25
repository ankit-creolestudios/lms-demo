module.exports = {
    mixins: ['block'],
    type: 'card',
    editable: true,
    toolbar: ['add', 'bold', 'italic', 'deleted', 'link', 'image-card'],
    control: ['trash', 'duplicate'],
    create: function () {
        return this.dom(this.opts.card.template);
    },
    build: function () {
        this.data = {
            alt: {
                getter: 'getAlt',
                setter: 'setAlt',
            },
        };
    },
    hasImage: function () {
        return this.$block.find('img').length !== 0;
    },
    getImage: function () {
        return this.$block.find('img').eq(0);
    },
    getAlt: function () {
        var $img = this.getImage();
        var alt = $img.attr('alt');
        return alt ? alt : '';
    },
    setAlt: function (value) {
        var $img = this.getImage();
        $img.attr('alt', value);
    },
    setImage: function (data) {
        var $img = this.getImage();
        $img.attr('src', data.url);
        if (Object.prototype.hasOwnProperty.call(data, 'id')) {
            $img.attr('data-image', data.id);
        }
        $img.one('load', this.app.editor.adjustHeight.bind(this.app.editor));
    },
    handleEnter: function (e, key, event) {
        e.preventDefault();
        this.app.insertion.insertBreakline();
        return true;
    },
};
