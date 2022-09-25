module.exports = {
    is: function (el, type, extend) {
        var res = false;
        var node = type === 'text' ? el : this._getNode(el);
        if (type === 'inline') {
            res = this._isElement(node) && this._isInlineTag(node.tagName, extend);
        } else if (type === 'blocks') {
            res = this._isElement(node) && node.hasAttribute('data-' + this.prefix + '-type');
        } else if (type === 'blocks-first') {
            res = this._isElement(node) && node.hasAttribute('data-' + this.prefix + '-first-level');
        } else if (type === 'block') {
            res = this._isElement(node) && this._isBlockTag(node.tagName, extend);
        } else if (type === 'element') {
            res = this._isElement(node);
        } else if (type === 'text') {
            res = typeof node === 'string' && !/^\s*<(\w+|!)[^>]*>/.test(node) ? true : this.isTextNode(node);
        } else if (type === 'list') {
            res = this._isElement(node) && ['ul', 'ol'].indexOf(node.tagName.toLowerCase()) !== -1;
        } else if (type === 'heading') {
            res =
                this._isElement(node) &&
                ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].indexOf(node.tagName.toLowerCase()) !== -1;
        }
        return res;
    },
    isEmptyOrImageInline: function (el) {
        var node = this.dom(el).get();
        if (!node || node.nodeType === 3) {
            return false;
        }
        var tag = node.tagName.toLowerCase();
        var tags = ['svg', 'img'];
        var noeditattr = node.getAttribute('contenteditable') === 'false';
        var isInline = this.is(node, 'inline');
        if ((isInline && this.isEmpty(node)) || (isInline && noeditattr) || tags.indexOf(tag) !== -1) {
            return true;
        }
        return false;
    },
    isEmpty: function (el) {
        var node = this._getNode(el);
        if (node) {
            return node.nodeType === 3 ? node.textContent.trim().replace(/\n/, '') === '' : node.innerHTML === '';
        }
        return false;
    },
    isTag: function (el, tag) {
        return this._getNode(el).tagName.toLowerCase() === tag;
    },
    isTextNode: function (el) {
        var node = this._getNode(el);
        return node && node.nodeType && node.nodeType === 3;
    },
    isVisible: function (el) {
        var node = this._getNode(el);
        return !!(node.offsetWidth || node.offsetHeight || node.getClientRects().length);
    },
    isScrollVisible: function (el) {
        var $scrollTarget = this.app.scroll.getTarget();
        var $el = this.dom(el);
        var docViewTop = $scrollTarget.scrollTop();
        var docViewBottom = docViewTop + $scrollTarget.height();
        var elemTop = $el.offset().top;
        return elemTop <= docViewBottom;
    },
    getFirstLevel: function (el) {
        return this.dom(el).closest('[data-' + this.prefix + '-first-level]');
    },
    getDataBlock: function (el) {
        return this.dom(el).closest('[data-' + this.prefix + '-type]');
    },
    getType: function (el) {
        return this.dom(el).attr('data-' + this.prefix + '-type');
    },
    getAllInlines: function (inline) {
        var inlines = [];
        var node = inline;
        while (node) {
            if (this.is(node, 'inline')) {
                inlines.push(node);
            }
            node = node.parentNode;
        }
        return inlines;
    },
    getClosest: function (el, types) {
        return this.dom(el).closest(this.getTypesSelector(types));
    },
    getParents: function (el, types) {
        return this.dom(el).parents(this.getTypesSelector(types));
    },
    getChildren: function (el, types) {
        return this.dom(el).find(this.getTypesSelector(types));
    },
    getTypesSelector: function (types) {
        return '[data-' + this.prefix + '-type=' + types.join('],[data-' + this.prefix + '-type=') + ']';
    },
    hasClass: function (el, value) {
        value = typeof value === 'string' ? [value] : value;
        var $el = this.dom(el);
        var count = value.length;
        var z = 0;
        for (var i = 0; i < count; i++) {
            if ($el.hasClass(value[i])) {
                z++;
            }
        }
        return count === z;
    },
    scrollTo: function ($el, tolerance) {
        if (!this.isScrollVisible($el)) {
            tolerance = tolerance || 60;
            var offset = $el.offset();
            var $target = this.app.scroll.getTarget();
            var value = offset.top - tolerance;
            $target.scrollTop(value);
            setTimeout(function () {
                $target.scrollTop(value);
            }, 1);
        }
    },
    replaceToTag: function (el, tag, keepchildnodes) {
        return this.dom(el).replaceWith(
            function (node) {
                var $el = this.dom('<' + tag + '>');
                if (!keepchildnodes) {
                    $el.append(node.innerHTML);
                }
                if (node.attributes) {
                    var attrs = node.attributes;
                    for (var i = 0; i < attrs.length; i++) {
                        $el.attr(attrs[i].nodeName, attrs[i].value);
                    }
                }
                if (keepchildnodes) {
                    while (node.childNodes.length > 0) {
                        $el.append(this.dom(node.firstChild));
                    }
                }
                return $el;
            }.bind(this)
        );
    },
    split: function (el) {
        var $el = this.dom(el);
        el = $el.get();
        var tag = el.tagName.toLowerCase();
        var fragment = this.app.content.extractHtmlFromCaret(el);
        if (fragment.nodeType && fragment.nodeType === 11) {
            fragment = this.dom(fragment.childNodes);
        }
        var $secondPart = this.dom('<' + tag + ' />');
        $secondPart = this.cloneAttrs(el, $secondPart);
        $secondPart.append(fragment);
        $el.after($secondPart);
        var $last = $el.children().last();
        if (this.is($last, 'inline')) {
            var html = $last.html();
            html = this.app.utils.removeInvisibleChars(html);
            if (html === '') {
                $last.remove();
            }
        }
        var type = this.getType($secondPart);
        if (type) {
            this.app.create('block.' + type, $secondPart, true);
        }
        if ($el.html() === '') $el.remove();
        return $secondPart;
    },
    cloneEmpty: function (el) {
        var $el = this.dom(el);
        var tag = $el.get().tagName.toLowerCase();
        var $clone = this.dom('<' + tag + '>');
        return $clone;
    },
    cloneAttrs: function (elFrom, elTo) {
        var $elTo = this.dom(elTo);
        var attrs = this._getNode(elFrom).attributes;
        var len = attrs.length;
        while (len--) {
            var attr = attrs[len];
            $elTo.attr(attr.name, attr.value);
        }
        return $elTo;
    },
    getAttrs: function (el) {
        var node = this._getNode(el);
        var attr = {};
        if (node.attributes != null && node.attributes.length) {
            for (var i = 0; i < node.attributes.length; i++) {
                var val = node.attributes[i].nodeValue;
                val = this._isNumber(val) ? parseFloat(val) : this._getBooleanFromStr(val);
                attr[node.attributes[i].nodeName] = val;
            }
        }
        return attr;
    },
    removeEmptyAttrs: function (el, attrs) {
        var $el = this.dom(el);
        var name = attrs.join(' ');
        var res = false;
        if (typeof $el.attr(name) === 'undefined' || $el.attr(name) === null) {
            res = true;
        } else if ($el.attr(name) === '') {
            $el.removeAttr(name);
            res = true;
        }
        return res;
    },
    getBlocks: function (el, parsertags, extendtags) {
        var node = this._getNode(el);
        var nodes = node.childNodes;
        var finalNodes = [];
        var tags = parsertags || this.opts.tags.parser;
        if (extendtags) {
            tags = this.app.utils.extendArray(tags, extendtags);
        }
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].nodeType === 1 && tags.indexOf(nodes[i].tagName.toLowerCase()) !== -1) {
                finalNodes.push(nodes[i]);
            }
        }
        return finalNodes;
    },
    hasBlocks: function (el) {
        return this.getBlocks(el).length !== 0;
    },
    hasTextSiblings: function (el) {
        var node = this._getNode(el);
        var hasPrev =
            node.previousSibling && node.previousSibling.nodeType === 3 && !this.isEmpty(node.previousSibling);
        var hasNext = node.nextSibling && node.nextSibling.nodeType === 3 && !this.isEmpty(node.nextSibling);
        return hasPrev || hasNext;
    },
    _getNode: function (el) {
        return this.dom(el).get();
    },
    _getBooleanFromStr: function (str) {
        if (str === 'true') return true;
        else if (str === 'false') return false;
        return str;
    },
    _isBlockTag: function (tag, extend) {
        var arr = this.app.utils.extendArray(this.opts.tags.block, extend);
        return arr.indexOf(tag.toLowerCase()) !== -1;
    },
    _isInlineTag: function (tag, extend) {
        var arr = this.app.utils.extendArray(this.opts.tags.inline, extend);
        return arr.indexOf(tag.toLowerCase()) !== -1;
    },
    _isElement: function (node) {
        return node && node.nodeType && node.nodeType === 1;
    },
    _isTag: function (tag) {
        return tag !== undefined && tag;
    },
    _isNumber: function (str) {
        return !isNaN(str) && !isNaN(parseFloat(str));
    },
};
