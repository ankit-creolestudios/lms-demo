module.exports = {
    init: function () {
        this._clear();
    },
    start: function () {
        this.win = this.app.editor.getWinNode();
        this.doc = this.app.editor.getDocNode();
    },
    getFirstInserted: function () {
        return this.inserted.instances[0];
    },
    getLastInserted: function () {
        var len = this.inserted.instances.length;
        var last = this.inserted.instances[len - 1];
        if (last && last.isInlineBlock()) {
            last = last.getParent();
        }
        return last;
    },
    getInserted: function () {
        return this.inserted;
    },
    setContent: function (params) {
        this._insert(params, 'set');
        var inserted = this.getInserted();
        this.inserted = false;
        return inserted;
    },
    insertContent: function (params) {
        this._insert(params, 'insert');
        var inserted = this.getInserted();
        this.inserted = false;
        return inserted;
    },
    insertEmptyBlock: function (params) {
        if (!params) {
            params = {};
        }
        params.html = this.app.block.createHtml();
        this._insert(params, 'insert');
        var inserted = this.getInserted();
        this.inserted = false;
        this.app.broadcast('block.add', {
            instance: inserted.instances[0],
            type: 'input',
        });
        return inserted;
    },
    insertNewline: function (caret, doublenode) {
        var str = doublenode ? '\n\n' : '\n';
        return this._insertFragment(
            {
                node: document.createTextNode(str),
            },
            caret ? caret : 'after'
        );
    },
    insertPoint: function (e) {
        var range;
        var marker = this.app.utils.createInvisibleChar();
        var doc = this.app.editor.getDocNode();
        var x = e.clientX,
            y = e.clientY;
        if (doc.caretPositionFromPoint) {
            var pos = doc.caretPositionFromPoint(x, y);
            var sel = doc.getSelection();
            range = sel.getRangeAt(0);
            range.setStart(pos.offsetNode, pos.offset);
            range.collapse(true);
            range.insertNode(marker);
        } else if (doc.caretRangeFromPoint) {
            range = doc.caretRangeFromPoint(x, y);
            range.insertNode(marker);
        }
        this.app.caret.set(marker, 'after');
    },
    insertBreakline: function (caret) {
        var inlines = this.app.selection.getNodes({
            type: 'inline',
        });
        if (this.app.selection.isCollapsed() && inlines.length !== 0) {
            return this._splitInline(inlines, document.createElement('br'));
        }
        return this._insertFragment(
            {
                node: document.createElement('br'),
            },
            caret ? caret : 'after'
        );
    },
    insertNode: function (node, caret, splitinline) {
        if (splitinline) {
            var inlines = this.app.selection.getNodes({
                type: 'inline',
            });
            if (inlines.length !== 0) {
                return this._splitInline(inlines, node);
            }
        }
        return this._insertFragment(
            {
                node: this.dom(node).get(),
            },
            caret
        );
    },
    insertHtml: function (html, caret) {
        return this._insertFragment(
            {
                html: html,
            },
            caret
        );
    },
    insertText: function (text, caret) {
        var instance = this.app.block.get();
        if ((instance && !instance.isEditable()) || this.app.blocks.is()) {
            this.insertContent({
                html: text,
                caret: caret,
            });
            return;
        }
        var sel = this.win.getSelection();
        var node;
        if (sel.getRangeAt && sel.rangeCount) {
            text = this.app.content.getTextFromHtml(text, {
                nl: true,
            });
            node = document.createTextNode(text);
            var range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(node);
            caret = caret || 'end';
            this.app.caret.set(node, caret);
        }
        return node;
    },
    insertListToList: function ($list, $target, caret) {
        var $items = $list.find('li');
        var $last = $items.last();
        $items.addClass(this.prefix + '-pasteitems');
        $last.addClass(this.prefix + '-pastemarker');
        var $nodes = $list.children();
        var $item = this.dom(this.app.selection.getBlock());
        var isStart = this.app.caret.is($target, 'start');
        var isEnd = this.app.caret.is($target, 'end');
        var isStartItem = this.app.caret.is($item, 'start');
        var isEndItem = this.app.caret.is($item, 'end', ['ul', 'ol']);
        var isEmptyItem = this.app.content.isEmptyHtml($item.html());
        if (isStart) {
            if (isEmptyItem) {
                $item.remove();
            }
            $target.prepend($nodes);
        } else if (isEnd) {
            if (isEmptyItem) {
                $item.remove();
            }
            $target.append($nodes);
        } else {
            if (isEmptyItem) {
                $item.after($nodes);
                $item.remove();
            } else if (isStartItem) {
                $item.before($nodes);
            } else if (isEndItem) {
                var $childList = $item.find('ul, ol');
                if ($childList.length !== 0) {
                    $childList.prepend($nodes);
                } else {
                    $item.after($nodes);
                }
            } else {
                this.app.element.split($item).before($nodes);
            }
        }
        var pastemarker = this.prefix + '-pastemarker';
        var pasteitems = this.prefix + '-pasteitems';
        if (caret) {
            $last = this.app.editor
                .getLayout()
                .find('.' + pastemarker)
                .removeClass(pastemarker);
            this.app.caret.set($last, 'end');
        }
        return this.app.editor
            .getLayout()
            .find('.' + pasteitems)
            .removeClass(pasteitems);
    },
    detectPosition: function ($target, position) {
        if (position) return position;
        var isStart = this.app.caret.is($target, 'start');
        var isEnd = this.app.caret.is($target, 'end');
        if (isEnd) {
            position = 'after';
        } else if (isStart) {
            position = 'before';
        } else {
            position = 'split';
        }
        return position;
    },
    _insert: function (params, type) {
        this.html = params.html;
        this.html = this.app.broadcastHtml('editor.before.insert', this.html);
        this.isParse = typeof params.parse === 'undefined' ? true : params.parse;
        this.isClean = typeof params.clean === 'undefined' ? false : params.clean;
        this.isCaret = typeof params.caret === 'undefined' ? true : params.caret;
        this.isPosition = typeof params.position === 'undefined' ? false : params.position;
        if (type === 'set' || this.app.editor.isAllSelected()) {
            this._setContent();
        } else {
            this._insertContent();
        }
        this.app.broadcast('editor.insert', this.inserted);
    },
    _insertContent: function () {
        var current = this.app.block.get();
        var position = false;
        var remove = false;
        var nodes, $block;
        this._checkEmpty();
        this._checkLine();
        if (this.app.blocks.is()) {
            if (this.isEmpty) {
                return;
            } else if (this.isLine) {
                this.html = this.app.block.createHtml(this.html);
            }
            this._clean();
            this._parse();
            this._parseBuild();
            nodes = this._buildParsedNodes();
            var last = this.app.blocks.getLastSelected();
            var $last = last.getBlock();
            $last.after(nodes);
            this.app.blocks.removeSelected(false);
        } else if (!current || this.isPosition) {
            if (this.isEmpty) {
                return;
            } else if (this.isLine) {
                this.html = this.app.block.createHtml(this.html);
            }
            this._clean();
            this._parse();
            this._parseBuild();
            nodes = this._buildParsedNodes();
            var positions = ['after', 'before', 'append'];
            var emptyLayer = false;
            if (this.isPosition === 'top' || (!this.isPosition && this.opts.editor.add === 'top')) {
                current = this.app.blocks.getFirst();
                position = 'before';
            } else if (current && positions.indexOf(this.isPosition) !== -1) {
                position = this.isPosition;
                emptyLayer = current.getType('layer') && current.isEmpty();
            } else {
                current = this.app.blocks.getLast();
                position = 'after';
            }
            $block = current.getBlock();
            if (emptyLayer) {
                $block.removeClass(this.prefix + '-empty-layer');
                $block.html('');
            }
            $block[position](nodes);
        } else if (this._isListToList(current)) {
            this.app.selection.deleteContents();
            this._clean();
            this._parse();
            this._parseBuild();
            $block = current.getBlock();
            var $list = this.$parsed.children().first();
            this.$nodes = this.insertListToList($list, $block, 'end');
            this.isCaret = false;
        } else if (current) {
            if (current.isInlineBlock()) {
                var parent = current.getParent();
                this.app.caret.set(current.getBlock(), 'after');
                current.remove();
                this.app.block.set(parent);
                current = parent;
            }
            if (current.isEditable()) {
                if (this.isEmpty) {
                    return;
                }
                this._clean();
                this._cleanSpecial();
                if (this.isLine) this._parseLine();
                else this._parse();
                this._parseBuild();
                if (current.isEmpty()) {
                    remove = true;
                    position = 'after';
                } else {
                    this.app.selection.deleteContents();
                }
                nodes = this._buildParsedNodes();
                $block = current.getBlock();
                this._insertToEditable(current, $block, nodes, position, remove);
            } else {
                position = 'after';
                if (this.isEmpty) {
                    return;
                } else if (this.isLine) {
                    this.html = this.app.block.createHtml(this.html);
                }
                this._clean();
                if (this.isLine) this._parseLine();
                else this._parse();
                this._parseBuild();
                nodes = this._buildParsedNodes();
                $block = current.getBlock();
                if (current.isEmptiable() && current.isEmpty()) {
                    $block.removeClass(this.prefix + '-empty-layer');
                    $block.html('');
                    position = 'append';
                }
                $block[position](nodes);
            }
        } else {
            return;
        }
        this._buildInserted();
        this._buildEditor();
        this._buildCaret();
    },
    _insertToEditable: function (current, $block, nodes, position, remove) {
        if (this.isLine) {
            this.$nodes = this._insertFragment(
                {
                    fragment: this.$parsed.get(),
                },
                'end'
            );
            this.isCaret = false;
        } else {
            if (this.app.content.isEmptyHtml($block.html())) {
                position = 'after';
                remove = true;
            } else {
                position = this.detectPosition($block, position);
            }
            if (position === 'split') {
                this.app.element.split($block).before(nodes);
            } else {
                $block[position](nodes);
            }
            if (remove) current.remove();
        }
    },
    _insertFragment: function (obj, caret) {
        if (obj.html || obj.fragment) {
            var fragment = this.app.fragment.build(obj.html || obj.fragment);
            this.app.fragment.insert(fragment);
        } else {
            this.app.fragment.insert(obj.node);
        }
        if (caret) {
            var target = obj.node ? obj.node : caret === 'start' ? fragment.first : fragment.last;
            this.app.caret.set(target, caret);
        }
        if (obj.node) {
            return this.dom(obj.node);
        } else {
            return this.dom(fragment.nodes);
        }
    },
    _setContent: function () {
        this._checkEmpty();
        this._checkLine();
        if (this.isEmpty) {
            this.html = this.app.block.createHtml();
        } else if (this.isLine) {
            this.html = this.app.block.createHtml(this.html);
        }
        this._clean();
        this._parse();
        this._parseBuild();
        var nodes = this._buildParsedNodes();
        this.app.editor.unsetSelectAllClass();
        this.app.editor.getLayout().html('').append(nodes);
        if (this.isEmpty) {
            this.app.broadcast('editor.empty');
        }
        this._buildInserted();
        this._buildEditor();
        this._buildCaret();
    },
    _splitInline: function (inlines, node) {
        var $part = this.app.element.split(inlines[0]);
        $part.before(node);
        if ($part.html() === '') {
            $part.remove();
        }
        return this.dom(node);
    },
    _buildEditor: function () {
        this.app.placeholder.trigger();
        this.app.editor.build();
        this.app.editor.setFocus();
    },
    _buildCaret: function () {
        if (!this.isCaret) return;
        var instance,
            caret = 'end';
        if (this.isCaret === 'start') {
            instance = this.getFirstInserted();
            caret = 'start';
        } else {
            instance = this.getLastInserted();
        }
        setTimeout(
            function () {
                if (instance) {
                    this.app.block.set(instance, caret);
                }
                this.app.toolbar.observe();
            }.bind(this),
            0
        );
    },
    _buildInserted: function () {
        this.inserted = {
            $nodes: this.$nodes,
            instances: [],
        };
        this.inserted.$nodes.each(this._buildInstance.bind(this));
    },
    _buildInstance: function ($node) {
        var instance = $node.dataget('instance');
        if (instance) {
            this.inserted.instances.push(instance);
        }
        var $nodes = $node.find('[data-' + this.prefix + '-type]');
        if ($nodes.length !== 0) {
            $nodes.each(this._buildInstance.bind(this));
        }
    },
    _buildParsedNodes: function () {
        return this.$parsed.get().childNodes;
    },
    _clear: function () {
        this.html = false;
        this.isLine = false;
        this.isEmpty = false;
        this.isSplit = false;
        this.isClean = false;
        this.isParse = true;
        this.isCaret = true;
        this.isPosition = false;
    },
    _clean: function () {
        if (this.isClean) {
            this.html = this.app.cleaner.cleanHtml(this.html);
        }
    },
    _cleanSpecial: function (type) {
        var clean, extend, except;
        if (['cell', 'address', 'figcaption', 'quoteitem'].indexOf(type) !== -1) {
            clean = true;
        } else if (type === 'dlist') {
            clean = true;
            except = ['dt', 'dd'];
        } else if (type === 'list') {
            clean = true;
            except = ['ul', 'ol', 'li'];
        }
        if (clean) {
            this.isLine = true;
            this.html = this.app.content.addBrToBlocks(this.html);
            this.html = this.app.content.removeBlockTags(this.html, extend, except);
            this.html = this.html.replace(/<br\s?\/?>\n?$/gi, '');
        }
    },
    _parse: function () {
        if (this.isParse) {
            this.html = this.app.parser.parse(this.html, false);
        }
    },
    _parseLine: function () {
        if (this.isParse) {
            this.html = this.app.parser.parseLine(this.html, false);
        }
    },
    _parseBuild: function () {
        this.$parsed = this.app.parser.build(this.html);
        this.$nodes = this.$parsed.children();
    },
    _checkEmpty: function () {
        this.isEmpty = this.app.content.isEmptyHtml(this.html);
    },
    _checkLine: function () {
        this.isLine = this.app.content.isLine(this.html);
    },
    _isListToList: function (instance) {
        var $target = instance.getBlock();
        var type = $target.attr('data-' + this.prefix + '-type');
        var $list = this.dom('<div>').html(this.html);
        $list.find('meta').remove();
        $list.find('b').unwrap();
        $list = $list.children().first();
        return type === 'list' && $list.length !== 0 && ['ul', 'ol'].indexOf($list.get().tagName.toLowerCase()) !== -1;
    },
};
