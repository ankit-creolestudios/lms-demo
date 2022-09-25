module.exports = {
    defaults: {
        id: {
            getter: 'getId',
            setter: 'setId',
        },
        html: {
            getter: 'getHtml',
            setter: 'setHtml',
        },
        align: {
            getter: 'getAlign',
            setter: 'setAlign',
        },
        valign: {
            getter: 'getValign',
            setter: 'setValign',
        },
        outset: {
            getter: 'getOutset',
            setter: 'setOutset',
        },
    },
    init: function (source, params) {
        this.$block = source ? this.dom(source) : this.create(params);
        this._build(params);
        this._buildData();
        this._render();
    },
    isType: function (type) {
        var types = Array.isArray(type) ? type : [type];
        return types.indexOf(this.type) !== -1;
    },
    isBlock: function () {
        return true;
    },
    isAllowedButton: function (name, obj) {
        var type = this.getType();
        if (typeof this.opts.buttons.hidden[name] !== 'undefined') {
            var val = this.opts.buttons.hidden[name];
            if (val === true) {
                return false;
            } else if (Array.isArray(val) && val.indexOf(type) !== -1) {
                return false;
            }
        }
        if (typeof obj.blocks === 'undefined') {
            return true;
        }
        var blocks = obj.blocks;
        if (blocks.except && blocks.except.indexOf(type) !== -1) {
            return false;
        }
        if (Array.isArray(blocks.types) && blocks.types.indexOf(type) !== -1) {
            return true;
        }
        if (blocks.all) {
            if (blocks.all === true || blocks.all === 'all') {
                return true;
            } else if (blocks.all === 'editable' && this.isEditable()) {
                return true;
            } else if (blocks.all === 'first-level' && this.isFirstLevel()) {
                return true;
            } else if (blocks.all === 'noneditable' && !this.isEditable()) {
                return true;
            }
        }
        return false;
    },
    isFirstLevel: function () {
        return this.$block.attr('data-' + this.prefix + '-first-level');
    },
    isSecondLevel: function () {
        return ['quoteitem', 'row', 'cell'].indexOf(this.type) !== -1;
    },
    isEditable: function () {
        return typeof this.editable !== 'undefined' && this.editable === true;
    },
    isInlineBlock: function () {
        return typeof this.inline !== 'undefined';
    },
    isAllSelected: function () {
        if (this.isEditable()) {
            return this.app.selection.isAll(this.$block);
        } else {
            return true;
        }
    },
    isEmpty: function () {
        if (this.isEmptiable()) {
            if (this.$block.hasClass(this.prefix + '-empty-layer')) {
                return true;
            } else {
                var html = this.$block.html();
                html = html.trim();
                html = this._cleanEmpty(html);
                return html === '';
            }
        } else if (this.isEditable()) {
            return this._isEmpty();
        }
    },
    isEmptiable: function () {
        return typeof this.emptiable !== 'undefined';
    },
    isCaretStart: function () {
        if (this.getType() === 'code') {
            return this.app.caret.is(this.$block, 'start', false, false);
        } else if (this.getType() === 'list') {
            var current = this.app.selection.getCurrent();
            var $item = this.dom(current).closest('li');
            var $prev = $item.prev();
            if ($prev.length === 0) {
                return this.app.caret.is(this.$block, 'start');
            } else {
                return false;
            }
        } else if (this.isEditable()) {
            return this.app.caret.is(this.$block, 'start');
        }
        return true;
    },
    isCaretEnd: function () {
        if (this.getType() === 'code') {
            return this.app.caret.is(this.$block, 'end', false, false);
        } else if (this.getType() === 'address') {
            return this.app.caret.is(this.$block, 'end', false, true, false);
        } else if (this.isEditable()) {
            return this.app.caret.is(this.$block, 'end');
        }
        return true;
    },
    getData: function (name) {
        var data = {};
        for (var key in this.data) {
            data[key] = this[this.data[key].getter].apply(this);
        }
        return name ? data[name] : data;
    },
    getType: function () {
        return this.type;
    },
    getTag: function () {
        return this.$block ? this.$block.get().tagName.toLowerCase() : false;
    },
    getTitle: function () {
        var type = this.getType();
        var titles = this.lang.get('blocks');
        var title = this.$block.attr('data-title');
        return typeof titles[type] !== 'undefined' ? titles[type] : title;
    },
    getOffset: function () {
        var offset = this.app.editor.getFrame().offset();
        var elOffset = this.$block.offset();
        return {
            top: offset.top + elOffset.top,
            left: offset.left + elOffset.left,
        };
    },
    getBlock: function () {
        return this.$block;
    },
    getHtml: function () {
        return this.$block.html();
    },
    getPlainText: function () {
        var html = this.$block.html();
        return this.app.content.getTextFromHtml(html, {
            nl: true,
        });
    },
    getOuterHtml: function () {
        return this.$block.get().outerHTML;
    },
    getParent: function (type) {
        type = type ? '=' + type : '';
        var $el = this.$block.parent().closest('[data-' + this.prefix + '-type' + type + ']');
        if ($el.length !== 0) {
            return $el.dataget('instance');
        }
        return false;
    },
    getNext: function (type) {
        type = type ? '=' + type : '';
        var $el = this.$block.nextElement();
        if ($el.length !== 0 && $el.is('[data-' + this.prefix + '-type' + type + ']')) {
            return $el.dataget('instance');
        }
        return false;
    },
    getPrev: function (type) {
        type = type ? '=' + type : '';
        var $el = this.$block.prevElement();
        if ($el.length !== 0 && $el.is('[data-' + this.prefix + '-type' + type + ']')) {
            return $el.dataget('instance');
        }
        return false;
    },
    getChildFirst: function (type) {
        type = type ? '=' + type : '';
        var $el = this.$block.find('[data-' + this.prefix + '-type' + type + ']').first();
        if ($el.length !== 0) {
            return $el.dataget('instance');
        }
        return false;
    },
    getChildLast: function (type) {
        type = type ? '=' + type : '';
        var $el = this.$block.find('[data-' + this.prefix + '-type' + type + ']').last();
        if ($el.length !== 0) {
            return $el.dataget('instance');
        }
        return false;
    },
    getId: function () {
        return this.$block.attr('id');
    },
    getAlign: function () {
        var obj = this.opts.align;
        if (!obj) return false;
        var value = 'left';
        for (var key in obj) {
            if (this.$block.hasClass(obj[key])) {
                value = key;
            }
        }
        return value;
    },
    getValign: function () {
        var obj = this.opts.valign;
        if (!obj) return false;
        var value = 'none';
        for (var key in obj) {
            if (this.$block.hasClass(obj[key])) {
                value = key;
            }
        }
        return value;
    },
    getOutset: function () {
        var obj = this.opts.outset;
        if (!obj) return false;
        var value = 'none';
        for (var key in obj) {
            if (this.$block.hasClass(obj[key])) {
                value = key;
            }
        }
        return value;
    },
    getCaption: function () {
        var $caption = this.$block.find('figcaption');
        return $caption.length !== 0 ? $caption.html().trim() : '';
    },
    setData: function (data) {
        for (var key in data) {
            if (!this.data[key]) continue;
            this[this.data[key].setter].call(this, data[key]);
        }
    },
    setEmpty: function () {
        this.$block.html('');
        if (this.isEmptiable()) {
            this._addEmptyButton(this.$block);
        }
    },
    setSelectAll: function () {
        if (this.isEditable()) {
            this.app.selection.select(this.$block);
        }
    },
    setHtml: function (html) {
        this.$block.html(html);
        if (html !== '') {
            this._buildInstancesInside(this.$block);
        }
    },
    setId: function (value) {
        if (value === '') {
            this.$block.removeAttr('id');
        } else {
            this.$block.attr('id', value);
        }
    },
    setAlign: function (value) {
        this._removeObjClasses(this.opts.align);
        this.$block.addClass(this.opts.align[value]);
    },
    setValign: function (value) {
        this._removeObjClasses(this.opts.valign);
        if (value !== 'none') {
            this.$block.addClass(this.opts.valign[value]);
        }
    },
    setOutset: function (value) {
        this._removeObjClasses(this.opts.outset);
        if (value !== 'none') {
            this.$block.addClass(this.opts.outset[value]);
        }
        this.app.control.updatePosition();
    },
    setCaption: function (value) {
        if (value === '') {
            this.$block.find('figcaption').remove();
        } else {
            var $caption = this.$block.find('figcaption');
            if ($caption.length === 0) {
                $caption = this.dom('<figcaption>');
                $caption.attr('data-placeholder', this.lang.get('placeholders.figcaption'));
                this.$block.append($caption);
                this.app.create('block.figcaption', $caption);
            }
            $caption.html(value);
        }
    },
    setClassFromObj: function (obj, key) {
        this._removeObjClasses(obj);
        var value = obj[key];
        if (value !== 'none' || value !== false) {
            this.$block.addClass(value);
        }
    },
    hasClass: function (value) {
        value = typeof value === 'string' ? [value] : value;
        for (var i = 0; i < value.length; i++) {
            if (this.$block.hasClass(value[i])) {
                return value[i];
            }
        }
        return false;
    },
    remove: function (broadcast) {
        var parent = this.getParent();
        var type = this.getType();
        this.$block.remove();
        if (parent && parent.isEmptiable() && parent.isEmpty()) {
            parent.setEmpty();
        }
        if (broadcast) {
            this.app.broadcast('block.remove', {
                type: type,
                parent: parent,
            });
        }
    },
    duplicate: function (empty) {
        var type = this.getType();
        var $clone = this.$block.clone();
        $clone.removeClass(this.prefix + '-block-focus ' + this.prefix + '-block-multiple-hover');
        if (empty) {
            $clone.html('');
        }
        return this.app.create('block.' + type, $clone);
    },
    duplicateEmpty: function () {
        return this.duplicate(true);
    },
    insertEmpty: function (params) {
        params = params || {};
        params.instance = this.app.block.create();
        return this.insert(params);
    },
    insert: function (params) {
        var defs = {
            instance: false,
            position: false,
            caret: false,
            remove: true,
            type: 'input',
        };
        var p = globalThis.$ARX.extend({}, defs, params);
        var $block = p.instance.getBlock();
        if (this.isEditable()) {
            this.app.selection.deleteContents();
        }
        if (p.instance.getType() === 'list' && this.getType() === 'list') {
            this.app.insertion.insertListToList($block, this.$block, p.caret);
        } else {
            if (p.instance.isInlineBlock() && this.isInlineBlock()) {
                this.$block.after($block);
                this.$block.remove();
            } else if (p.instance.isInlineBlock() && this.isEditable()) {
                this.app.insertion.insertNode(p.instance.getBlock(), false, true);
            } else if (this.isEditable() && this.getType() !== 'card') {
                p.position = this.app.insertion.detectPosition(this.$block, p.position);
                if (p.position === 'split') {
                    this.app.element.split(this.$block).before($block);
                } else {
                    this.$block[p.position]($block);
                    if (p.remove && this.isEmpty()) {
                        this.$block.remove();
                    }
                }
            } else {
                p.position = p.position || 'after';
                this.$block[p.position]($block);
            }
            this.app.editor.build();
            if (p.caret) {
                this.app.block.set(p.instance, p.caret);
            }
            this.app.toolbar.observe();
            this.app.broadcast('block.add', {
                instance: p.instance,
                type: p.type,
            });
            return p.instance;
        }
    },
    appendNext: function () {
        var next = this.getNext();
        if (next.isEmpty()) {
            next.remove();
            return;
        } else if (this.isEmpty()) {
            this.remove();
            this.app.block.set(next, 'start');
            return;
        }
        var html = next.getHtml();
        var type = this.getType();
        var nextType = next.getType();
        var insert = true;
        var remove = true;
        if (type === 'code' && nextType !== 'code') {
            html = next.getPlainText();
        }
        if (nextType === 'dlist') {
            if (type === 'dlist') {
                var nodes = next.getBlock().children();
                this.$block.append(nodes);
                insert = false;
            } else {
                html = next.getPlainText(true);
            }
        } else if (nextType === 'list') {
            if (type === 'list') {
                var $items = next.getBlock().children();
                this.$block.append($items);
                insert = false;
                remove = true;
            } else {
                html = this._appendListHtml(next.getBlock(), html);
                remove = next.isEmpty();
            }
        }
        if (insert) {
            var inline = this.app.selection.getTopInline();
            if (inline) {
                this.app.caret.set(inline, 'after');
            }
            this.app.insertion.insertHtml(html, 'start');
            this._buildInstancesInside(this.$block);
        }
        if (remove) {
            next.remove();
        }
    },
    appendToPrev: function () {
        var prev = this.getPrev();
        if (this.isEmpty()) {
            this.remove();
            this.app.block.set(prev, 'end');
            return;
        } else if (prev.isEmpty()) {
            prev.remove();
            this.app.control.updatePosition();
            return;
        }
        var prevType = prev.getType();
        var html = this.getHtml();
        var type = this.getType();
        var insert = true;
        var remove = true;
        if (type !== 'code' && prevType === 'code') {
            html = this.getPlainText();
        }
        if (type === 'dlist') {
            if (prevType === 'dlist') {
                var nodes = this.getBlock().children();
                this.app.block.set(prev, 'end');
                prev.getBlock().append(nodes);
                insert = false;
            } else {
                html = this.getPlainText(true);
            }
        } else if (type === 'list') {
            if (prevType === 'list') {
                var $items = this.getBlock().children();
                this.app.block.set(prev, 'end');
                prev.getBlock().append($items);
                insert = false;
                remove = true;
            } else {
                html = this._appendListHtml(this.getBlock(), html);
                remove = this.isEmpty();
            }
        }
        if (insert) {
            this.app.block.set(prev, 'end');
            var inline = this.app.selection.getTopInline();
            if (inline) {
                this.app.caret.set(inline, 'after');
            }
            this.app.insertion.insertHtml(html, 'start');
            this._buildInstancesInside(prev.getBlock());
        }
        if (remove) {
            this.remove();
        }
    },
    append: function (instance, set) {
        if (this.isEmptiable() && this.isEmpty()) {
            this.$block.html('');
            this.$block.removeClass(this.prefix + '-empty-layer');
        }
        this.$block.append(instance.getBlock());
        if (set !== false) {
            this.app.block.set(instance);
        }
        this.app.broadcast('block.add', {
            instance: instance,
        });
    },
    change: function (newInstance, broadcast) {
        var $newBlock = newInstance.getBlock();
        this.$block.after($newBlock);
        this.$block.remove();
        this.app.editor.build();
        this.app.toolbar.observe();
        this.app.block.set(newInstance);
        if (broadcast !== false) {
            this.app.broadcast('block.change', {
                instance: newInstance,
            });
        }
    },
    moveUp: function () {
        var target = this.getPrev();
        if (!target) return;
        this._move(target, 'before');
    },
    moveDown: function (direction) {
        var target = this.getNext();
        if (!target) return;
        this._move(target, 'after');
    },
    _appendListHtml: function ($target, html) {
        var $item = $target.find('li').first();
        html = $item.html().trim();
        html = html.replace(/<\/li>/gi, '</li><br>');
        html = html.replace(/<(ul|ol)/gi, '<br><$1');
        html = this.app.content.removeTags(html, ['ul', 'ol', 'li']);
        html = html.trim();
        html = html.replace(/<br\s?\/?>$/gi, '');
        $item.remove();
        return html;
    },
    _move: function (target, func) {
        if (this.isEditable()) this.app.selection.save(this.$block);
        var $targetBlock = target.getBlock();
        $targetBlock[func](this.$block, true);
        this.app.block.set(this.$block, false, true);
        if (this.isEditable()) this.app.selection.restore(this.$block);
    },
    _build: function (params) {
        if (this.isEmptiable() && this.isEmpty()) {
            this._addEmptyButton(this.$block);
        }
        if (this.build) {
            this.build(params);
        }
        this._buildInstancesInside(this.$block);
    },
    _buildData: function () {
        if (!this.data) this.data = {};
        this.data = globalThis.$ARX.extend({}, true, this.defaults, this.data);
    },
    _buildInstancesInside: function ($block) {
        $block.find('[data-' + this.prefix + '-type]').each(this._buildInstanceInside.bind(this));
    },
    _buildInstanceInside: function ($node) {
        var instance = $node.dataget('instance');
        if (!instance) {
            var type = $node.attr('data-' + this.prefix + '-type');
            this.app.create('block.' + type, $node);
        }
    },
    _buildItems: function (selector, type) {
        var $items = this.$block.find(selector);
        if ($items.length !== 0) {
            $items.each(
                function ($node) {
                    this.app.create('block.' + type, $node);
                }.bind(this)
            );
        }
    },
    _buildCaption: function () {
        if (this.getTag() !== 'figure') return;
        this.$block.find('figcaption').attr('data-placeholder', this.lang.get('placeholders.figcaption'));
    },
    _isEmpty: function () {
        var html = this.$block.text();
        html = this._cleanEmpty(html);
        return html === '';
    },
    _getNameByTag: function () {
        var tag = this.getTag();
        var name = this.app.utils.capitalize(tag);
        return name;
    },
    _render: function () {
        this._renderEdit();
        this._renderDraggable();
        this._renderEditable();
    },
    _renderDraggable: function () {
        if (typeof this.draggable !== 'undefined' && this.draggable === false) {
            this.$block.on('dragstart', function (e) {
                e.preventDefault();
                return false;
            });
            this.$block.find('img').on('dragstart', function (e) {
                e.preventDefault();
                return false;
            });
        }
    },
    _renderEditable: function () {
        if (this.isEditable()) {
            this.$block.attr('contenteditable', true);
        } else if (typeof this.editable !== 'undefined' && this.editable === false) {
            this.$block.attr('contenteditable', false);
        }
        if (this.isEditable() && !this.opts.editor.grammarly) this.$block.attr('data-gramm_editor', false);
    },
    _renderEdit: function () {
        this.$block.dataset('instance', this);
        this.$block.attr('data-' + this.prefix + '-type', this.getType());
    },
    _cleanEmpty: function (html) {
        html = this.app.utils.removeInvisibleChars(html);
        html = html.search(/^<br\s?\/?>$/) !== -1 ? '' : html;
        html = html.replace(/\n/g, '');
        return html;
    },
    _removeObjClasses: function (obj) {
        var classes = this._buildObjClasses(obj);
        this.$block.removeClass(classes.join(' '));
        this.app.element.removeEmptyAttrs(this.$block, ['class']);
    },
    _buildObjClasses: function (obj) {
        var classes = [];
        for (var key in obj) {
            if (obj[key]) {
                classes.push(obj[key]);
            }
        }
        return classes;
    },
    _addEmptyButton: function ($el) {
        if ($el.hasClass(this.prefix + '-empty-layer')) return;
        $el.addClass(this.prefix + '-empty-layer');
        var $plus = this.dom('<span>').addClass(this.prefix + '-plus-button');
        this.app.create(
            'button',
            {
                name: 'plus',
                element: $plus,
            },
            {
                command: 'addbar.popup',
            }
        );
        $el.append($plus);
    },
};
