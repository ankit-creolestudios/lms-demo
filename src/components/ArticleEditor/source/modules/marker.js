module.exports = {
    build: function (pos) {
        var $marker = this.dom('<span>').attr('id', 'selection-marker-' + pos);
        $marker.addClass(this.prefix + '-selection-marker');
        $marker.html(this.opts.markerChar);
        return $marker.get();
    },
    insert: function () {
        this.remove();
        var sel = this.app.selection.get();
        var both = !sel.collapsed;
        if (!sel.range) return;
        var start = this.build('start');
        var end = this.build('end');
        var cloned = sel.range.cloneRange();
        if (both) {
            cloned.collapse(false);
            cloned.insertNode(end);
        }
        cloned.setStart(sel.range.startContainer, sel.range.startOffset);
        cloned.collapse(true);
        cloned.insertNode(start);
        sel.range.setStartAfter(start);
        if (both) {
            sel.range.setEndBefore(end);
        }
        this.app.selection.setRange(sel.range);
    },
    restore: function () {
        var start = this.find('start');
        var end = this.find('end');
        var sel = this.app.selection.get();
        var range = sel.range ? sel.range : this.app.editor.getDocNode().createRange();
        if (start) {
            var prev = end ? end.previousSibling : false;
            var next = start.nextSibling;
            next = next && next.nodeType === 3 && next.textContent.replace(/[\n\t]/g, '') === '' ? false : next;
            if (!end) {
                if (next) {
                    range.selectNodeContents(next);
                    range.collapse(true);
                } else {
                    this._restoreInject(range, start);
                }
            } else if (next && next.id === 'selection-marker-end') {
                this._restoreInject(range, start);
            } else {
                if (prev && next) {
                    range.selectNodeContents(prev);
                    range.collapse(false);
                    range.setStart(next, 0);
                } else if (prev && !next) {
                    range.selectNodeContents(prev);
                    range.collapse(false);
                    range.setStartAfter(start);
                } else {
                    range.setStartAfter(start);
                    range.setEndBefore(end);
                }
            }
            this.app.selection.setRange(range);
            var fix = start && end ? 2 : 1;
            var offset = this.app.offset.get();
            offset = {
                start: offset.start - fix,
                end: offset.end - fix,
            };
            if (start) start.parentNode.removeChild(start);
            if (end) end.parentNode.removeChild(end);
            this.app.editor.setWinFocus();
            this.app.offset.set(false, offset);
        }
    },
    find: function (pos) {
        var $editor = this.app.editor.getLayout();
        var $marker = $editor.find('#selection-marker-' + pos);
        return $marker.length !== 0 ? $marker.get() : false;
    },
    remove: function () {
        var start = this.find('start');
        var end = this.find('end');
        if (start) start.parentNode.removeChild(start);
        if (end) end.parentNode.removeChild(end);
    },
    _restoreInject: function (range, start) {
        var textNode = this.app.utils.createInvisibleChar();
        this.dom(start).after(textNode);
        range.selectNodeContents(textNode);
        range.collapse(false);
    },
};
