module.exports = {
    init: function () {
        this.savedSelection = false;
        this.savedMarker = false;
        this.savedPosition = false;
    },
    get: function () {
        var sel = this._getSelection();
        var range = this._getRange(sel);
        var current = this._getCurrent(sel);
        return {
            selection: sel,
            range: range,
            collapsed: this._getCollapsed(sel, range),
            current: current,
            parent: this._getParent(current),
        };
    },
    getRange: function () {
        return this._getRange(this.get().selection);
    },
    getNodes: function (data) {
        var sel = this.get();
        var isInline = data && ((data.type && data.type === 'inline') || (data.tags && data.tags.indexOf('a') !== -1));
        var func = isInline ? '_getAllRangeNodes' : '_getRangeNodes';
        var nodes = [];
        if (this.app.editor.isAllSelected()) {
            nodes = this.app.editor.getLayout().children().getAll();
        } else {
            nodes = sel.selection && sel.range ? this[func](sel.range) : nodes;
        }
        return nodes.length > 0 ? this._filterNodes(nodes, sel.range, isInline, data) : nodes;
    },
    getCurrent: function () {
        var sel = this._getSelection();
        return this._getCurrent(sel);
    },
    getParent: function () {
        var current = this.getCurrent();
        return this._getParent(current);
    },
    getElement: function (el) {
        return this._getElement(el, 'element');
    },
    getInline: function (el) {
        return this._getElement(el, 'inline');
    },
    getTopInline: function (el) {
        var node = el ? this.dom(el).get() : this.getCurrent();
        var inlines = [];
        while (node) {
            if (this._getElement(node, 'inline')) {
                inlines.push(node);
            } else {
                break;
            }
            node = node.parentNode;
        }
        return inlines[inlines.length - 1];
    },
    getDataBlock: function (el) {
        var sel = this._getSelection();
        var node = el || this._getCurrent(sel);
        if (node) {
            node = this.dom(node).get();
            while (node) {
                if (node.nodeType === 1 && node.getAttribute('data-' + this.prefix + '-type')) {
                    return this.dom(node);
                }
                node = node.parentNode;
            }
        }
        return this.dom();
    },
    getBlock: function (el) {
        return this._getElement(el, 'block');
    },
    getText: function (type, num) {
        var sel = this.get();
        var text = false;
        if (!sel.selection) return false;
        if (type && sel.range) {
            num = typeof num === 'undefined' ? 1 : num;
            var el = this.app.editor.getLayout().get();
            var cloned = sel.range.cloneRange();
            if (type === 'before') {
                cloned.collapse(true);
                cloned.setStart(el, 0);
                text = cloned.toString().slice(-num);
            } else if (type === 'after') {
                cloned.selectNodeContents(el);
                cloned.setStart(sel.range.endContainer, sel.range.endOffset);
                text = cloned.toString().slice(0, num);
            }
        } else {
            text = sel.selection ? sel.selection.toString() : '';
        }
        return text;
    },
    getHtml: function () {
        var html = '';
        var sel = this.get();
        if (sel.selection) {
            var cloned = sel.range.cloneContents();
            var div = document.createElement('div');
            div.appendChild(cloned);
            html = div.innerHTML;
            html = html.replace(/<p><\/p>$/i, '');
        }
        return html;
    },
    getPosition: function () {
        var range = this.getRange();
        var pos = {
            top: 0,
            left: 0,
            width: 0,
            height: 0,
        };
        if (this.app.editor.getWinNode().getSelection && range.getBoundingClientRect) {
            range = range.cloneRange();
            var offset = range.startOffset - 1;
            range.setStart(range.startContainer, offset < 0 ? 0 : offset);
            var rect = range.getBoundingClientRect();
            pos = {
                top: rect.top,
                bottom: rect.bottom,
                left: rect.left,
                width: rect.right - rect.left,
                height: rect.bottom - rect.top,
            };
        }
        return pos;
    },
    set: function (sel, range) {
        if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
        }
    },
    setRange: function (range) {
        this.set(this.app.editor.getWinNode().getSelection(), range);
    },
    is: function (el) {
        if (typeof el !== 'undefined') {
            var node = this.dom(el).get();
            var nodes = this.getNodes();
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i] === node) return true;
            }
        } else {
            return this.get().selection;
        }
        return false;
    },
    isCollapsed: function () {
        var sel = this.get();
        return this._getCollapsed(sel.selection, sel.range);
    },
    isIn: function (el) {
        var node = this.dom(el).get();
        var current = this.getCurrent();
        return current && node ? node.contains(current) : false;
    },
    isAll: function (el) {
        var isEditor = !el;
        var node = el ? this.dom(el).get() : this.app.editor.getLayout().get();
        var selection = this.app.editor.getWinNode().getSelection();
        var range = this._getRange(selection);
        var isNode = isEditor ? true : this.is(node);
        if (selection.isCollapsed) return false;
        if (isNode) {
            return (
                typeof node.textContent !== 'undefined' &&
                node.textContent.trim().length === range.toString().trim().length
            );
        } else {
            return false;
        }
    },
    select: function (el) {
        var node = el ? this.dom(el).get() : this.app.editor.getLayout().get();
        var range = this.app.editor.getDocNode().createRange();
        range.selectNodeContents(node);
        this.setRange(range);
    },
    removeAllRanges: function () {
        var sel = this._getSelection();
        if (sel) {
            sel.removeAllRanges();
        }
    },
    deleteContents: function () {
        var range = this.getRange();
        if (!this.isCollapsed() && range) {
            range.deleteContents();
        }
    },
    collapse: function (type) {
        type = type || 'start';
        var sel = this.get();
        if (sel.selection && !sel.collapsed) {
            if (type === 'start') sel.selection.collapseToStart();
            else sel.selection.collapseToEnd();
        }
    },
    save: function (el) {
        if (!el) {
            var instance = this.app.block.get();
            if (instance) {
                el = instance.getBlock();
            } else {
                el = this.app.editor.getLayout();
            }
        }
        this.savedSelection = {
            el: el,
            offset: this.app.offset.get(el),
        };
    },
    restore: function (set) {
        if (this.savedMarker) return;
        if (!this.savedSelection) return;
        this.app.editor.setWinFocus();
        var el = this.savedSelection.el;
        var instance = this.dom(el).dataget('instance');
        if (instance && set !== false) {
            this.app.block.set(el);
        }
        if (el) {
            el.focus();
            this.app.offset.set(el, this.savedSelection.offset);
        }
        this.savedSelection = false;
    },
    savePosition: function () {
        var sel = this._getSelection();
        if (sel) {
            this.savedPosition = [sel.focusNode, sel.focusOffset];
        }
    },
    restorePosition: function () {
        if (this.savedPosition) {
            this.app.editor.getEditor().focus();
            var sel = this._getSelection();
            if (sel) {
                sel.collapse(this.savedPosition[0], this.savedPosition[1]);
            }
        }
        this.savedPosition = false;
    },
    saveMarker: function () {
        this.savedMarker = true;
        this.app.marker.insert();
    },
    restoreMarker: function () {
        this.app.marker.restore();
        this.savedMarker = false;
        this.savedSelection = false;
    },
    _getSelection: function () {
        return this.app.editor.getSelection();
    },
    _getRange: function (selection) {
        return selection ? (selection.rangeCount > 0 ? selection.getRangeAt(0) : false) : false;
    },
    _getCurrent: function (selection) {
        return selection ? selection.anchorNode : false;
    },
    _getParent: function (current) {
        return current ? current.parentNode : false;
    },
    _getElement: function (el, type) {
        var sel = this._getSelection();
        if (sel) {
            var node = el || this._getCurrent(sel);
            node = this.dom(node).get();
            while (node) {
                if (this.app.element.is(node, type)) {
                    return node;
                }
                node = node.parentNode;
            }
        }
        return false;
    },
    _getCollapsed: function (selection, range) {
        var collapsed = false;
        if (selection && selection.isCollapsed) collapsed = true;
        else if (range && range.toString().length === 0) collapsed = true;
        return collapsed;
    },
    _getNextNode: function (node) {
        if (node.firstChild) return node.firstChild;
        while (node) {
            if (node.nextSibling) return node.nextSibling;
            node = node.parentNode;
        }
    },
    _getRangeNodes: function (range, all) {
        var start = range.startContainer.childNodes[range.startOffset] || range.startContainer;
        var end = range.endContainer.childNodes[range.endOffset] || range.endContainer;
        var commonAncestor = range.commonAncestorContainer;
        var nodes = [];
        var node;
        if (all) {
            if (!this.app.editor.isLayout(start)) {
                nodes.push(start);
            }
            for (node = start.parentNode; node; node = node.parentNode) {
                if (this.app.editor.isLayout(node)) break;
                nodes.push(node);
                if (node === commonAncestor) break;
            }
            nodes.reverse();
            for (node = start; node; node = this._getNextNode(node)) {
                if (node.nodeType !== 3 && this.dom(node.parentNode).closest(commonAncestor).length === 0) break;
                nodes.push(node);
                if (node === end) break;
            }
        } else {
            if (start.nodeType === 3) {
                nodes.push(this.getBlock(start));
            }
            for (node = start; node; node = this._getNextNode(node)) {
                if (node === commonAncestor) break;
                if (node.nodeType !== 3 && this.dom(node.parentNode).closest(commonAncestor).length === 0) break;
                nodes.push(node);
                if (node === end) break;
            }
        }
        return nodes;
    },
    _getAllRangeNodes: function (range) {
        return this._getRangeNodes(range, true);
    },
    _filterNodes: function (nodes, range, isInline, data) {
        var selected = this.getText();
        selected = selected ? selected.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&') : '';
        var finalNodes = [];
        for (var i = 0; i < nodes.length; i++) {
            var push = true;
            if (this.app.editor.isLayout(nodes[i])) {
                push = false;
            }
            if (data) {
                push = data.types ? this._filterByTypes(push, data, nodes[i]) : push;
                push = data.selected ? this._filterBySelected(push, data, nodes[i], range, selected) : push;
                push = data.type ? this._filterByType(push, data, nodes[i], isInline) : push;
                push = data.tags ? this._filterByTags(push, data, nodes[i]) : push;
            }
            if (push) {
                finalNodes.push(nodes[i]);
            }
        }
        var blocks = [];
        if (data && (data.type === 'blocks' || data.type === 'blocks-first')) {
            for (var z = 0; z < finalNodes.length; z++) {
                var node;
                if (data.type === 'blocks-first') {
                    node = !this.app.element.is(finalNodes[z], 'blocks-first')
                        ? this.app.element.getFirstLevel(finalNodes[z]).get()
                        : finalNodes[z];
                } else if (data.type === 'blocks') {
                    node = !this.app.element.is(finalNodes[z], 'blocks')
                        ? this.app.element.getDataBlock(finalNodes[z]).get()
                        : finalNodes[z];
                }
                if (!this._isInNodesArray(blocks, node)) {
                    blocks.push(node);
                }
            }
            finalNodes = blocks;
        }
        return finalNodes;
    },
    _filterByTypes: function (push, data, node) {
        var type;
        if (data.types === true) {
            type = this.app.element.getType(node);
            if (!type) {
                push = false;
            }
        } else {
            type = this.app.element.getType(node);
            if (data.types.indexOf(type) === -1) {
                push = false;
            }
        }
        return push;
    },
    _filterByType: function (push, data, node, isInline) {
        var type = data.type;
        if (type === 'blocks' || type === 'blocks-first') {
            type = 'block';
        }
        if (isInline) {
            if (data.links) {
                if (!this.app.element.is(node, type)) {
                    push = false;
                }
            } else {
                if ((node.nodeType === 1 && node.tagName === 'A') || !this.app.element.is(node, type)) {
                    push = false;
                }
            }
        } else if (!this.app.element.is(node, type)) {
            push = false;
        }
        return push;
    },
    _filterByTags: function (push, data, node) {
        var isTagName = typeof node.tagName !== 'undefined';
        if (!isTagName) {
            push = false;
        } else if (isTagName && data.tags.indexOf(node.tagName.toLowerCase()) === -1) {
            push = false;
        }
        return push;
    },
    _filterBySelected: function (push, data, node, range, selected) {
        if (data.selected === true && !this._containsNodeText(range, node)) {
            push = false;
        } else if (data.selected === 'inside') {
            if (node.nodeType === 1 && node.tagName === 'A') {
                push = true;
            } else if (!this._isTextSelected(node, selected)) {
                push = false;
            }
        }
        return push;
    },
    _isTextSelected: function (node, selected) {
        var text = node.nodeType !== 9 ? this.app.utils.removeInvisibleChars(node.textContent) : '';
        return (
            selected === text ||
            text.search(selected) !== -1 ||
            selected.search(new RegExp('^' + this.app.utils.escapeRegExp(text) + '$')) !== -1
        );
    },
    _isBackwards: function () {
        var backwards = false;
        var sel = this.get();
        if (sel && !sel.collapsed) {
            var range = this.app.editor.getDocNode().createRange();
            range.setStart(sel.selection.anchorNode, sel.selection.anchorOffset);
            range.setEnd(sel.selection.focusNode, sel.selection.focusOffset);
            backwards = range.collapsed;
            range.detach();
        }
        return backwards;
    },
    _containsNodeText: function (range, node) {
        var treeWalker = this.app.editor.getDocNode().createTreeWalker(
            node,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function (node) {
                    return NodeFilter.FILTER_ACCEPT;
                },
            },
            false
        );
        var first, last, textNode;
        while ((textNode = treeWalker.nextNode())) {
            if (!first) {
                first = textNode;
            }
            last = textNode;
        }
        var nodeRange = range.cloneRange();
        if (first) {
            nodeRange.setStart(first, 0);
            nodeRange.setEnd(last, last.length);
        } else {
            nodeRange.selectNodeContents(node);
        }
        return (
            range.compareBoundaryPoints(Range.START_TO_START, nodeRange) < 1 &&
            range.compareBoundaryPoints(Range.END_TO_END, nodeRange) > -1
        );
    },
    _isInNodesArray: function (nodes, node) {
        return nodes.indexOf(node) !== -1;
    },
};
