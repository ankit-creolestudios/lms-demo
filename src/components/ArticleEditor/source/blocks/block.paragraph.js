module.exports = {
    mixins: ['block'],
    type: 'paragraph',
    editable: true,
    toolbar: ['add', 'format', 'alignment', 'bold', 'italic', 'deleted', 'link'],
    control: ['trash', 'duplicate'],
    create: function () {
        return this.dom('<p>');
    },
    handleEnter: function (e, key, event) {
        e.preventDefault();
        if (this.isEmpty() || this.isCaretEnd()) {
            var clone = this.app.block.create();
            if (!this.opts.clean.enter) {
                clone = this.duplicateEmpty();
                clone.getBlock().removeAttr('id');
            }
            if (!this.opts.clean.enterinline) {
                var inline = this.app.selection.getInline();
                if (inline) {
                    var cloned;
                    var inlines = this.app.element.getAllInlines(inline);
                    for (var i = 0; i < inlines.length; i++) {
                        if (i === 0) {
                            cloned = inlines[i].cloneNode();
                            cloned.removeAttribute('id');
                            cloned.innerHTML = '';
                        } else {
                            var clonedInline = inlines[i].cloneNode();
                            clonedInline.removeAttribute('id');
                            clonedInline.innerHTML = '';
                            cloned.appendChild(clonedInline);
                        }
                    }
                    clone = this.app.block.create(cloned.outerHTML);
                }
            }
            if (clone.isEmpty()) {
                clone.getBlock().html(this.app.utils.createInvisibleChar());
            }
            this.insert({
                instance: clone,
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
