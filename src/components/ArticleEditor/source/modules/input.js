module.exports = {
    handle: function (event) {
        var e = event.get('e');
        var key = event.get('key');
        if (this._doSelectAll(e, event)) {
            return;
        }
        if (event.is('enter') && event.is('shift')) {
            this.handleShiftEnter(e, key, event);
        } else if (event.is('enter')) {
            this.handleEnter(e, key, event);
        } else if (event.is('space') && event.is('shift')) {
            this.handleShiftSpace(e, key, event);
        } else if (event.is('space')) {
            this.handleSpace(e, key, event);
        } else if (event.is('tab') && this.opts.tab.key) {
            this.handleTab(e, key, event);
        } else if (event.is('arrow')) {
            if (event.is(['shift', 'alt', 'ctrl'])) return;
            this.handleArrow(e, key, event);
        } else if (event.is(['delete', 'backspace'])) {
            this.handleDelete(e, key, event);
        }
    },
    handleDelete: function (e, key, event) {
        var instance = this.app.block.get();
        var isBackspace = event.is('backspace');
        var isDelete = event.is('delete');
        if (this.app.blocks.is()) {
            e.preventDefault();
            this.app.blocks.removeSelected();
            return;
        }
        if (
            instance &&
            instance.isEditable() &&
            this._trimInvisibleChar(e, event.is('backspace') ? 'left' : 'right', isDelete)
        ) {
            return;
        }
        var inline = this.app.selection.getInline();
        if (inline && inline.innerHTML.length === 1) {
            e.preventDefault();
            inline.innerHTML = '';
            return;
        }
        if (instance.handleDelete && instance.handleDelete(e, key, event)) {
            return;
        }
        var next = instance.getNext();
        var prev = instance.getPrev();
        if (instance.isInlineBlock()) {
            e.preventDefault();
            var $block = instance.getBlock();
            var parent = instance.getParent();
            this.app.caret.set($block, 'after');
            instance.remove(true);
            this.app.block.set(parent);
        } else if (!instance.isEditable()) {
            e.preventDefault();
            instance.remove(true);
            if (next) {
                this.app.block.set(next, 'start');
            } else if (prev) {
                this.app.block.set(prev, 'end');
            } else {
                if (this.app.editor.isEmpty()) {
                    this.app.editor.setEmpty();
                } else {
                    this.app.block.unset();
                }
            }
        } else if (instance.isEditable()) {
            var type = instance.getType();
            if (instance.isAllSelected()) {
                e.preventDefault();
                if (type === 'card') {
                    this.app.block.remove();
                } else {
                    instance.setEmpty();
                }
                return;
            }
            if (isDelete && next && instance.isCaretEnd()) {
                e.preventDefault();
                if (next.getType() === 'card' || !next.isEditable()) {
                    this.app.block.set(next);
                } else {
                    if (type === 'card') {
                        return;
                    } else {
                        instance.appendNext();
                    }
                }
            } else if (isBackspace && prev && instance.isCaretStart()) {
                e.preventDefault();
                if (prev.getType() === 'card' || !prev.isEditable()) {
                    this.app.block.set(prev);
                    if (instance.isEmpty()) {
                        instance.remove(true);
                    }
                } else {
                    if (type === 'card') {
                        return;
                    } else {
                        instance.appendToPrev();
                    }
                }
            }
        }
    },
    handleArrow: function (e, key, event) {
        var instance = this.app.block.get();
        if (this.app.blocks.is()) {
            return;
        }
        if (instance.isEditable()) {
            var current = this.app.selection.getCurrent();
            var inline = this.app.selection.getTopInline();
            if (event.is('right') && inline && inline.tagName === 'CODE') {
                var inlineEnd = this.app.caret.is(inline, 'end');
                var blockEnd = this.app.caret.is(instance.getBlock(), 'end');
                if (inlineEnd && blockEnd) {
                    e.preventDefault();
                    this.app.caret.set(inline, 'after');
                    return;
                }
            }
            if (inline && this._catchInlineBlock(e, event, inline)) {
                return;
            } else if (current && this._catchInlineBlock(e, event, current)) {
                return;
            }
        }
        if (instance.isEditable() && this._trimInvisibleChar(e, event.is('left') ? 'left' : 'right')) {
            return;
        }
        if (instance.handleArrow && instance.handleArrow(e, key, event)) {
            return;
        }
        if (instance.isInlineBlock()) {
            e.preventDefault();
            var $block = instance.getBlock();
            var parent = instance.getParent();
            var caret = event.is('up-left') ? 'before' : 'after';
            this.app.caret.set($block, caret);
            this.app.block.set(parent);
        } else {
            this._doArrow(e, event, instance);
        }
    },
    handleTab: function (e, key, event) {
        var instance = this.app.block.get();
        if (this.app.blocks.is()) {
            e.preventDefault();
            return;
        }
        if (instance.handleTab && instance.handleTab(e, key, event)) {
            return;
        }
        if (this.opts.tab.spaces && instance.isEditable()) {
            e.preventDefault();
            var num = this.opts.tab.spaces;
            var node = document.createTextNode(Array(num + 1).join('\u00a0'));
            this.app.insertion.insertNode(node, 'end');
            return;
        } else if (instance.isInlineBlock()) {
            e.preventDefault();
            var $block = instance.getBlock();
            var parent = instance.getParent();
            this.app.caret.set($block, 'after');
            this.app.block.set(parent);
        } else {
            e.preventDefault();
            var next = instance.getNext();
            if (next) {
                this.app.block.set(next, 'start');
            }
        }
    },
    handleShiftSpace: function (e, key, event) {
        var instance = this.app.block.get();
        if (this.app.blocks.is()) return;
        var $block = instance.getBlock();
        if (instance.isEditable()) {
            if (instance.isAllSelected()) {
                instance.setEmpty();
                return;
            } else {
                if (instance.getType() !== 'code') {
                    e.preventDefault();
                    this.app.insertion.insertHtml('&nbsp;', 'end');
                }
            }
        } else if (instance.isInlineBlock()) {
            e.preventDefault();
            var parent = instance.getParent();
            this.app.caret.set($block, 'after');
            instance.remove(true);
            this.app.block.set(parent);
            this.app.insertion.insertHtml('&nbsp;', 'end');
        } else if (instance.isEmptiable() && instance.isEmpty()) {
            e.preventDefault();
            $block.removeClass(this.prefix + '-empty-layer');
            $block.html('');
            instance.insertEmpty({
                position: 'append',
                caret: 'start',
            });
        }
    },
    handleSpace: function (e, key, event) {
        var instance = this.app.block.get();
        if (this.app.blocks.is()) {
            e.preventDefault();
            var last = this.app.blocks.getLastSelected();
            last.insertEmpty({
                position: 'after',
                caret: 'start',
            });
            this.app.blocks.removeSelected(false);
            return;
        }
        var $block = instance.getBlock();
        var type = instance.getType();
        if (instance.handleSpace && instance.handleSpace(e, key, event)) {
            return;
        }
        if (type === 'row') {
            e.preventDefault();
            return;
        } else if (instance.isEditable() && instance.isAllSelected()) {
            instance.setEmpty();
            return;
        } else if (instance.isInlineBlock()) {
            e.preventDefault();
            var parent = instance.getParent();
            this.app.caret.set($block, 'after');
            instance.remove(true);
            this.app.block.set(parent);
            this.app.insertion.insertHtml('&nbsp;', 'end');
        } else if (instance.isEmptiable() && instance.isEmpty()) {
            e.preventDefault();
            $block.removeClass(this.prefix + '-empty-layer');
            $block.html('');
            instance.insertEmpty({
                position: 'append',
                caret: 'start',
            });
        } else if (!instance.isEditable()) {
            e.preventDefault();
            instance.insertEmpty({
                position: 'after',
                caret: 'start',
            });
            instance.remove(true);
            this.app.control.updatePosition();
        }
    },
    handleShiftEnter: function (e, key, event) {
        var instance = this.app.block.get();
        var type = instance.getType();
        var $block = instance.getBlock();
        if (this.app.blocks.is() || type === 'row') {
            e.preventDefault();
        } else if (instance.isInlineBlock()) {
            e.preventDefault();
            var parent = instance.getParent();
            this.app.caret.set($block, 'after');
            instance.remove(true);
            this.app.block.set(parent);
            this.app.insertion.insertBreakline();
        } else if (instance.isEditable()) {
            e.preventDefault();
            this.app.insertion.insertBreakline();
        } else {
            e.preventDefault();
            var position = 'after';
            if (instance.isEmptiable() && instance.isEmpty()) {
                position = 'append';
                $block.removeClass(this.prefix + '-empty-layer');
                $block.html('');
            }
            instance.insertEmpty({
                position: position,
                caret: 'start',
            });
        }
    },
    handleEnter: function (e, key, event) {
        var instance = this.app.block.get();
        if (this.app.blocks.is()) {
            e.preventDefault();
            var last = this.app.blocks.getLastSelected();
            last.insertEmpty({
                position: 'after',
                caret: 'start',
            });
            return;
        }
        var $block = instance.getBlock();
        if (instance.isEditable()) {
            if (instance.isAllSelected()) {
                e.preventDefault();
                instance.setEmpty();
                return;
            } else if (!this.app.selection.isCollapsed()) {
                e.preventDefault();
                if (instance.getType() === 'code') {
                    this.app.insertion.insertNewline();
                } else {
                    this.app.insertion.insertBreakline();
                }
                return;
            }
        }
        if (instance.isInlineBlock()) {
            e.preventDefault();
            var parent = instance.getParent();
            this.app.caret.set($block, 'after');
            instance.remove(true);
            this.app.block.set(parent);
        } else if (instance.isEmptiable() && instance.isEmpty()) {
            e.preventDefault();
            $block.removeClass(this.prefix + '-empty-layer');
            $block.html('');
            instance.insertEmpty({
                position: 'append',
                caret: 'start',
            });
        } else if (!instance.isEditable()) {
            e.preventDefault();
            instance.insertEmpty({
                position: 'after',
                caret: 'start',
            });
        }
        if (instance.handleEnter) {
            instance.handleEnter(e, key, event);
        }
        this.app.control.updatePosition();
    },
    handleTextareaTab: function (e) {
        if (e.keyCode !== 9) return true;
        e.preventDefault();
        var el = e.target;
        var val = el.value;
        var start = el.selectionStart;
        el.value = val.substring(0, start) + '    ' + val.substring(el.selectionEnd);
        el.selectionStart = el.selectionEnd = start + 4;
    },
    _isNextBlock: function (event, node) {
        return event.is('right') && this.app.caret.is(node, 'end') && this.app.element.getType(node.nextSibling);
    },
    _isPrevBlock: function (event, node) {
        return event.is('left') && this.app.caret.is(node, 'start') && this.app.element.getType(node.previousSibling);
    },
    _isSiblingInlineBlock: function (e, node) {
        var $el = this.dom(node);
        var instance = $el.dataget('instance');
        if (instance && instance.isInlineBlock()) {
            e.preventDefault();
            this.app.block.set(instance);
            return true;
        }
    },
    _isInvisibleChar: function (direction) {
        var sel = this.app.selection.get();
        var text = this.app.selection.getText(direction);
        return sel.current && sel.current.nodeType === 3 && this.app.utils.searchInvisibleChars(text) === 0;
    },
    _catchInlineBlock: function (e, event, node) {
        if (event.is('left') && node.nodeType === 3) {
            var str = node.textContent;
            var isChar = this.app.utils.searchInvisibleChars(str) !== -1;
            if (isChar) {
                var charnode = node;
                if (this._isSiblingInlineBlock(e, node.previousSibling)) {
                    charnode.parentNode.removeChild(charnode);
                    return true;
                }
            }
        }
        if (this._isPrevBlock(event, node)) {
            if (this._isSiblingInlineBlock(e, node.previousSibling)) return true;
        } else if (this._isNextBlock(event, node)) {
            if (this._isSiblingInlineBlock(e, node.nextSibling)) return true;
        }
    },
    _trimInvisibleChar: function (e, pointer, remove) {
        var direction = pointer === 'left' ? 'before' : 'after';
        var sel = this.app.selection.get();
        var isChar = this._isInvisibleChar(direction);
        var el;
        if (isChar && pointer === 'left') {
            el = sel.current;
            this.dom(el).replaceWith(el.textContent.replace(/\uFEFF/g, ''));
        } else if (isChar && remove && sel.current && sel.current.nextSibling) {
            el = sel.current.nextSibling;
            this.dom(el).replaceWith(el.textContent.replace(/\uFEFF/g, ''));
        } else if (isChar && pointer === 'right') {
            e.preventDefault();
            el = sel.current;
            var data = this.app.offset.get();
            this.app.offset.set(false, {
                start: data.start + 1,
                end: data.end + 1,
            });
            return true;
        }
    },
    _doSelectAll: function (e, event) {
        var instance = this.app.block.get();
        if (this._isAllSelected(event)) {
            this._setEditorEmpty(e, event);
            return true;
        }
        if (event.is('select')) {
            e.preventDefault();

            if (!this.app.blocks.is() && instance) {
                if ((!instance.isAllSelected() && e.shiftKey) || instance.isEmpty()) {
                    this.app.editor.selectAll();
                } else {
                    instance.setSelectAll();
                }
            } else {
                this.app.editor.selectAll();
            }
            return true;
        }
    },
    _doArrow: function (e, event, instance) {
        var target, caret;
        var type = instance.getType();
        var types = ['code', 'line', 'image', 'embed', 'layer', 'grid'];
        if (event.is('up-left') && instance.isCaretStart()) {
            caret = 'end';
            target = instance.getPrev();
            if (!target && types.indexOf(type) !== -1) {
                this.app.insertion.insertEmptyBlock({
                    position: 'before',
                    caret: 'start',
                });
                return;
            }
        } else if (event.is('down-right') && instance.isCaretEnd()) {
            caret = 'start';
            target = instance.getNext();
            if (!target && types.indexOf(type) !== -1) {
                this.app.insertion.insertEmptyBlock({
                    position: 'after',
                    caret: 'start',
                });
                return;
            }
        }
        if (target) {
            e.preventDefault();
            this.app.block.set(target, caret);
        }
    },
    _isAllSelected: function (event) {
        return this.app.editor.isAllSelected() && event.is(['enter', 'delete', 'backspace', 'alpha', 'space']);
    },
    _setEditorEmpty: function (e, event) {
        if (!event.is(['alpha', 'space'])) e.preventDefault();
        this.app.editor.setEmpty();
    },
};
