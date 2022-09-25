module.exports = {
    mixins: ['block'],
    type: 'heading',
    editable: true,
    toolbar: ['add', 'format', 'alignment', 'bold', 'italic', 'deleted', 'link'],
    control: ['trash', 'duplicate'],
    create: function () {
        return this.dom('<h2>');
    },
    getTitle: function () {
        var titles = this.lang.get('headings');
        var tag = this.getTag();
        var title = this.$block.attr('data-title');
        return typeof titles[tag] !== 'undefined' ? titles[tag] : title;
    },
    handleEnter: function (e, key, event) {
        e.preventDefault();
        if (this.isEmpty() || this.isCaretEnd()) {
            this.insertEmpty({
                position: 'after',
                caret: 'start',
                remove: false,
            });
        } else if (this.isCaretStart()) {
            this.insert({
                instance: this.duplicateEmpty(),
                position: 'before',
            });
        } else {
            var $block = this.getBlock();
            var $part = this.app.element.split($block);
            this.app.block.set($part, 'start');
        }
        return true;
    },
};
