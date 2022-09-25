module.exports = {
    set: function (el, type) {
        var node = this.dom(el).get();
        var range = this.app.editor.getDocNode().createRange();
        var map = {
            start: '_setStart',
            end: '_setEnd',
            before: '_setBefore',
            after: '_setAfter',
        };
        if (!node || !this._isInPage(node)) {
            return;
        }
        this.app.editor.setWinFocus();
        if (this._isInline(node) && this._isNon(node)) {
            if (type === 'start') type = 'before';
            else if (type === 'end') type = 'after';
        }
        this[map[type]](range, node);
        this.app.selection.setRange(range);
    },
    is: function (el, type, removeblocks, trimmed, br) {
        var node = this.dom(el).get();
        var sel = this.app.editor.getWinNode().getSelection();
        var result = false;
        if (!node || !sel.isCollapsed) {
            return result;
        }
        var position = this._getPosition(node, trimmed, br);
        var size = this._getSize(node, removeblocks, trimmed);
        if (type === 'end') {
            result = position === size;
        } else if (type === 'start') {
            result = position === 0;
        }
        return result;
    },
    _setStart: function (range, node) {
        range.setStart(node, 0);
        range.collapse(true);
        var inline = this._getInlineInside(node);
        if (inline) {
            range = this._setStartInline(range, inline);
        }
        if (this._isInline(node)) {
            this._insertInvisibleNode(range);
        }
    },
    _setStartInline: function (range, inline) {
        var inlines = this.app.element.getAllInlines(inline);
        var node = inlines[0];
        range.selectNodeContents(node);
        range.collapse(true);
    },
    _setEnd: function (range, node) {
        var last = node.nodeType === 1 ? node.lastChild : false;
        var lastInline = last && this._isInline(last);
        if (lastInline) {
            node = last;
        }
        range.selectNodeContents(node);
        range.collapse(false);
    },
    _setBefore: function (range, node) {
        range.setStartBefore(node);
        range.collapse(true);
        if (this._isInline(node)) {
            this._insertInvisibleNode(range, node);
        }
    },
    _setAfter: function (range, node) {
        range.setStartAfter(node);
        range.collapse(true);
        var tag = node.nodeType !== 3 ? node.tagName.toLowerCase() : false;
        if (this._isInline(node) || tag === 'br' || tag === 'svg') {
            this._insertInvisibleNode(range);
        }
    },
    _insertInvisibleNode: function (range, before) {
        var textNode = this.app.utils.createInvisibleChar();
        if (before) {
            before.parentNode.insertBefore(textNode, before);
        } else {
            range.insertNode(textNode);
        }
        range.selectNodeContents(textNode);
        range.collapse(false);
        return textNode;
    },
    _getInlineInside: function (node) {
        var inline = node.firstChild;
        if (this._isInline(inline)) {
            var inside = inline.firstChild;
            while (inside) {
                if (this._isInline(inside)) {
                    return inside;
                }
                inside = inside.firstChild;
            }
            return inline;
        }
    },
    _getSize: function (node, removeblocks, trimmed) {
        var str;
        var isTextNode = node.nodeType === 3;
        if (removeblocks && removeblocks.length !== 0) {
            var $node = this.dom(node);
            var $cloned = $node.clone();
            $cloned.find(removeblocks.join(',')).remove();
            str = $cloned.html().trim();
        } else {
            str = isTextNode ? node.textContent : node.innerHTML;
            str = isTextNode || trimmed === false ? str : str.trim();
        }
        return this._trimmed(str, isTextNode, trimmed).length;
    },
    _getPosition: function (node, trimmed, br) {
        var range = this.app.editor.getWinNode().getSelection().getRangeAt(0);
        var caretRange = range.cloneRange();
        var tmp = document.createElement('div');
        var isTextNode = node.nodeType === 3;
        caretRange.selectNodeContents(node);
        caretRange.setEnd(range.endContainer, range.endOffset);
        tmp.appendChild(caretRange.cloneContents());
        var str = isTextNode || trimmed === false ? tmp.innerHTML : tmp.innerHTML.trim();
        var brEnd = str.search(/<\/?br\s?\/?>$/g) !== -1 ? 1 : 0;
        if (br === false) brEnd = 0;
        str = this._trimmed(str, isTextNode, trimmed);
        return str.length + brEnd;
    },
    _trimmed: function (str, isTextNode, trimmed) {
        if (trimmed === false) {
            str = str.replace(/\n$/g, '');
            return str;
        }
        str = this.app.utils.removeInvisibleChars(str);
        str = str.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, '');
        str = str.replace(/\s+/g, ' ');
        if (str !== '' && !isTextNode) {
            str = str.replace(/\s$/, '');
        }
        return str;
    },
    _isInline: function (node) {
        return this.app.element.is(node, 'inline');
    },
    _isInPage: function (node) {
        var isIn = false;
        var doc = this.app.editor.getDocNode();
        if (node && node.nodeType) {
            isIn = node === doc.body ? false : doc.body.contains(node);
        }
        return isIn;
    },
    _isNon: function (node) {
        return node.getAttribute('contenteditable') === 'false';
    },
};
