module.exports = {
    removeFormat: function () {
        this.app.popup.close();
        var instance = this.app.block.get();
        var $block = instance.getBlock();
        this.app.selection.save($block);
        var nodes = this.app.selection.getNodes({
            type: 'inline',
        });
        for (var i = 0; i < nodes.length; i++) {
            var $node = this.dom(nodes[i]);
            if (!$node.attr('data-' + this.prefix + '-type')) {
                $node.unwrap();
            }
        }
        this.app.selection.restore();
        this.app.editor.observeUI();
    },
    set: function (params) {
        if (this.app.popup.isOpen()) {
            this.app.popup.close();
        }
        if (this.app.editor.isBlocksSelection()) {
            return;
        }
        this.params = params;
        var nodes = [];
        var sel = this.app.selection.get();
        if (sel.collapsed) {
            nodes = this.formatCollapsed();
        } else {
            nodes = this.formatUncollapsed();
        }
        this.app.editor.observeUI();
        this.app.broadcast('inline.format', {
            nodes: nodes,
        });
        this.app.sync.trigger();
        return nodes;
    },
    formatCollapsed: function () {
        var node;
        var inline = this.app.selection.getInline();
        var $inline = this.dom(inline);
        var tags = this._getParamsTags();
        var hasSameTag = this._isSameTag(inline, tags);
        var caret = this.params && this.params.caret ? this.params.caret : false;
        if (!inline) {
            node = this._insertInline(this.params.tag, caret);
        } else {
            if (this.app.content.isEmptyHtml(inline.innerHTML)) {
                if (hasSameTag) {
                    this.app.caret.set(inline, caret ? caret : 'after');
                    $inline.remove();
                } else {
                    var $el = this.app.element.replaceToTag(inline, this.params.tag);
                    this.app.caret.set($el, caret ? caret : 'start');
                }
            } else {
                if (hasSameTag) {
                    var isEnd = this.app.caret.is(inline, 'end');
                    var $target = inline;
                    if (isEnd) {
                        caret = 'after';
                    } else {
                        var extractedContent = this.app.content.extractHtmlFromCaret(inline);
                        var $secondPart = this.dom('<' + this.params.tag + ' />');
                        $secondPart = this.app.element.cloneAttrs(inline, $secondPart);
                        $inline.after($secondPart.append(extractedContent));
                        $target = $secondPart;
                    }
                    this.app.caret.set($target, caret ? caret : 'before');
                } else {
                    node = this._insertInline(this.params.tag, caret);
                }
            }
        }
        if (node && this.params && typeof this.params.attr !== 'undefined') {
            var $node = this.dom(node);
            for (var name in this.params.attr) {
                $node.attr(name, this.params.attr[name]);
            }
        }
        return node ? node : [];
    },
    formatUncollapsed: function () {
        var instance = this.app.block.get();
        var $block = instance.getBlock();
        this.app.selection.save($block);
        this._convertTags('u', instance);
        this._convertTags('del', instance);
        this.app.selection.restore();
        var inlines = this.app.selection.getNodes({
            type: 'inline',
        });
        this.app.selection.save($block);
        this._convertToStrike(inlines);
        this.app.selection.restore();
        this.app.selection.save($block);
        this.app.editor.getDocNode().execCommand('strikethrough');
        var nodes = this._revertToInlines(instance);
        this.app.selection.restore();
        var finalNodes = [];
        var selected = this.app.selection.getText();
        for (var i = 0; i < nodes.length; i++) {
            if (this._isInSelection(nodes[i], selected)) {
                finalNodes.push(nodes[i]);
            }
        }
        this._clearEmptyStyle();
        if (this.params && typeof this.params.attr !== 'undefined') {
            for (var z = 0; z < finalNodes.length; z++) {
                for (var name in this.params.attr) {
                    finalNodes[z].setAttribute(name, this.params.attr[name]);
                }
            }
        }
        this.app.selection.save($block);
        $block.get().normalize();
        this._revertTags('u', instance);
        this._revertTags('del', instance);
        this.app.selection.restore();
        if (this.params && this.params.caret) {
            var len = finalNodes.length;
            var last = finalNodes[len - 1];
            this.app.caret.set(last, this.params.caret);
        }
        return finalNodes;
    },
    _clearEmptyStyle: function () {
        var inlines = this.app.selection.getNodes({
            type: 'inline',
        });
        for (var i = 0; i < inlines.length; i++) {
            this._clearEmptyStyleAttr(inlines[i]);
            var childNodes = inlines[i].childNodes;
            if (childNodes) {
                for (var z = 0; z < childNodes.length; z++) {
                    this._clearEmptyStyleAttr(childNodes[z]);
                }
            }
        }
    },
    _clearEmptyStyleAttr: function (node) {
        if (node.nodeType !== 3 && node.getAttribute('style') === '') {
            node.removeAttribute('style');
        }
    },
    _isSameTag: function (inline, tags) {
        return inline && tags.indexOf(inline.tagName.toLowerCase()) !== -1;
    },
    _isInSelection: function (node, selected) {
        var text = this.app.utils.removeInvisibleChars(node.textContent);
        return selected.search(new RegExp(this.app.utils.escapeRegExp(text))) !== -1;
    },
    _insertInline: function (tag, caret) {
        return this.app.insertion.insertNode(document.createElement(tag), caret ? caret : 'start');
    },
    _convertTags: function (tag, instance) {
        if (this.params.tag !== tag) {
            var $block = instance.getBlock();
            $block.find(tag).each(
                function (node) {
                    var $el = this.app.element.replaceToTag(node, 'span');
                    $el.addClass(this.prefix + '-convertable-' + tag);
                }.bind(this)
            );
        }
    },
    _revertTags: function (tag, instance) {
        var $block = instance.getBlock();
        $block.find('span.' + this.prefix + '-convertable-' + tag).each(
            function (node) {
                var $el = this.app.element.replaceToTag(node, tag);
                $el.removeClass(this.prefix + '-convertable-' + tag);
                if (this.app.element.removeEmptyAttrs($el, ['class'])) {
                    $el.removeAttr('class');
                }
            }.bind(this)
        );
    },
    _convertToStrike: function (inlines) {
        var tags = this._getParamsTags();
        for (var i = 0; i < inlines.length; i++) {
            var inline = inlines[i];
            var $inline = this.dom(inline);
            var tag = inlines[i].tagName.toLowerCase();
            if (tags.indexOf(tag) !== -1) {
                this._replaceToStrike($inline);
            }
        }
    },
    _getParamsTags: function () {
        var tags = [this.params.tag];
        if (this.params.tag === 'b' || this.params.tag === 'strong') {
            tags = ['b', 'strong'];
        } else if (this.params.tag === 'i' || this.params.tag === 'em') {
            tags = ['i', 'em'];
        }
        return tags;
    },
    _replaceToStrike: function ($el) {
        $el.replaceWith(
            function () {
                return this.dom('<strike>').append($el.html());
            }.bind(this)
        );
    },
    _revertToInlines: function (instance) {
        var nodes = [];
        var $block = instance.getBlock();
        $block.find('strike').each(
            function (node) {
                var $node = this.app.element.replaceToTag(node, this.params.tag);
                nodes.push($node.get());
            }.bind(this)
        );
        return nodes;
    },
};
