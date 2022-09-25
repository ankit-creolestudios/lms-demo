module.exports = {
    get: function (el) {
        el = this._getEl(el);
        var sel = this.app.editor.getWinNode().getSelection();
        var offset = false;
        if (sel && sel.rangeCount > 0) {
            var range = sel.getRangeAt(0);
            if (el.contains(sel.anchorNode)) {
                var cloned = range.cloneRange();
                cloned.selectNodeContents(el);
                cloned.setEnd(range.startContainer, range.startOffset);
                var start = cloned.toString().length;
                offset = {
                    start: start,
                    end: start + range.toString().length,
                };
            }
        }
        return offset;
    },
    set: function (el, offset) {
        if (offset === false) {
            offset = {
                start: 0,
                end: 0,
            };
        }
        el = this._getEl(el);
        var charIndex = 0,
            range = this.app.editor.getDocNode().createRange();
        var nodeStack = [el],
            node,
            foundStart = false,
            stop = false;
        range.setStart(el, 0);
        range.collapse(true);
        while (!stop && (node = nodeStack.pop())) {
            if (node.nodeType === 3) {
                var nextCharIndex = charIndex + node.length;
                if (!foundStart && offset.start >= charIndex && offset.start <= nextCharIndex) {
                    range.setStart(node, offset.start - charIndex);
                    foundStart = true;
                }
                if (foundStart && offset.end >= charIndex && offset.end <= nextCharIndex) {
                    range.setEnd(node, offset.end - charIndex);
                    stop = true;
                }
                charIndex = nextCharIndex;
            } else {
                var i = node.childNodes.length;
                while (i--) {
                    nodeStack.push(node.childNodes[i]);
                }
            }
        }
        this.app.selection.setRange(range);
    },
    _getEl: function (el) {
        return !el ? this.app.editor.getLayout().get() : this.dom(el).get();
    },
};
