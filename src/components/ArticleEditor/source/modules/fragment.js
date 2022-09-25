module.exports = {
    build: function (node) {
        return this.is(node) ? node : this.create(node);
    },
    insert: function (fragment) {
        var sel = this.app.selection.get();
        if (!sel.range) return;
        if (sel.collapsed) {
            var start = sel.range.startContainer;
            if (start.nodeType !== 3 && start.tagName === 'BR') {
                start.parentNode.removeChild(start);
            }
        } else {
            sel.range.deleteContents();
        }
        if (fragment.frag) {
            sel.range.insertNode(fragment.frag);
        } else {
            sel.range.insertNode(fragment);
        }
    },
    createContainer: function (html) {
        var $div = this.dom('<div>');
        if (typeof html === 'string') $div.html(html);
        else $div.append(this.dom(html).clone(true));
        return $div.get();
    },
    create: function (html) {
        var el = typeof html === 'string' ? this.createContainer(html) : html;
        var frag = document.createDocumentFragment(),
            node,
            firstNode,
            lastNode;
        var nodes = [];
        var i = 0;
        while ((node = el.firstChild)) {
            i++;
            var n = frag.appendChild(node);
            if (i === 1) firstNode = n;
            nodes.push(n);
            lastNode = n;
        }
        return {
            frag: frag,
            first: firstNode,
            last: lastNode,
            nodes: nodes,
        };
    },
    is: function (obj) {
        return typeof obj === 'object' && obj.frag;
    },
};
