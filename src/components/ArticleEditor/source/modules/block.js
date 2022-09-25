module.exports = {
    init: function () {
        this.instance = false;
        this.$block = false;
    },
    create: function (html) {
        var instance = this.app.create('block.' + this.opts.editor.markup);
        if (html) instance.getBlock().html(html);
        return instance;
    },
    createHtml: function (html) {
        return this.create(html).getOuterHtml();
    },
    is: function ($el) {
        return $el ? this._isBlockActive($el) : this.get();
    },
    isType: function (type) {
        if (!this.is()) return;
        return this.get().isType(type);
    },
    isParent: function (type) {
        if (!this.is()) return;
        var types = Array.isArray(type) ? type : [type];
        var $block = this.get().getBlock();
        var $blocks = this.app.element.getParents($block, types);
        return $blocks.length !== 0;
    },
    get: function () {
        return this.instance;
    },
    set: function (el, caret, force) {
        if (el.isBlock) {
            el = el.getBlock();
        }
        if (force !== true && this._isBlockActive(el)) return;
        this.unset();
        this.instance = this._getInstance(el);
        this.$block = this.instance.getBlock();
        this.$block.addClass(this.prefix + '-block-focus');
        this._setCaret(caret);
        this.app.path.build();
        this.app.toolbar.build();
        this.app.control.build();
        this.app.broadcast('block.set');
    },
    unset: function () {
        if (!this.instance) return;
        this.instance = false;
        this.$block = false;
        this.app.blocks.unset();
        this.app.editor.unsetSelectAllClass();
        this.app.path.build();
        this.app.toolbar.build();
        this.app.control.close();
        this.app.broadcast('block.unset');
    },
    duplicate: function () {
        if (!this._isAction()) return;
        var instance = this.get();
        var clone = instance.duplicate();
        var newInstance = instance.insert({
            instance: clone,
            position: 'after',
            caret: 'start',
            type: 'duplicate',
        });
        this.app.broadcast('block.duplicate', {
            instance: newInstance,
        });
        return newInstance;
    },
    moveUp: function () {
        if (!this._isAction()) return;
        this.get().moveUp();
    },
    moveDown: function () {
        if (!this._isAction()) return;
        this.get().moveDown();
    },
    change: function (instance) {
        if (!this.is()) return;
        var current = this.get();
        var $block = current.getBlock();
        var $newBlock = instance.getBlock();
        $block.after($newBlock);
        $block.remove();
        this.app.parser.buildElement($newBlock);
        this.app.editor.build();
        this.set(instance);
        this.app.broadcast('block.change', {
            instance: instance,
        });
    },
    add: function (params) {
        this.app.popup.close();
        var current = this.get();
        if (params.type && params.type === 'image' && current && current.getType() === 'cell') {
            current = current.getParent('table');
        }
        var remove = false;
        var position = false;
        var newInstance = params.instance ? params.instance : this.app.create('block.' + params.name, params.source);
        if (this.app.editor.isAllSelected()) {
            current = this.create();
            this.app.editor.unsetSelectAllClass();
            this.app.editor.getLayout().html('').append(current.getBlock());
            position = 'after';
            remove = true;
        } else if (this.app.blocks.is()) {
            current = this.app.blocks.getLastSelected();
            position = 'after';
        } else if (!current) {
            if (this.opts.editor.add === 'top') {
                current = this.app.blocks.getFirst();
                position = 'before';
            } else {
                current = this.app.blocks.getLast();
                position = 'after';
            }
        } else if (current.isInlineBlock()) {
            if (newInstance.getType() !== 'variable') {
                var parent = current.getParent();
                this.app.caret.set(current.getBlock(), 'after');
                this.app.block.set(parent);
                current = this.get();
            }
        } else if (current.isEmptiable() && current.isEmpty()) {
            var $block = current.getBlock();
            $block.removeClass(this.prefix + '-empty-layer');
            $block.html('');
            position = 'append';
        }
        position = params.position ? params.position : position;
        var currentremove = true;
        if (current) {
            var type = current.getType();
            var types = ['paragraph', 'text', 'heading'];
            if (params.name === 'paragraph' && types.indexOf(type) !== -1) {
                currentremove = false;
            }
        }
        current.insert({
            instance: newInstance,
            position: position,
            caret: params.caret ? params.caret : 'end',
            remove: currentremove,
            type: 'add',
        });
        if (remove) {
            current.remove();
        }
        return newInstance;
    },
    format: function (params) {
        this.app.format.set(params);
    },
    remove: function (params) {
        var instance = this.get();
        if (!instance) return;
        var type = instance.getType();
        var parent = instance.getParent();
        var imageUrl = type === 'image' ? instance.getSrc() : false;
        var isTraverse = params && typeof params.traverse !== 'undefined' && params.traverse === false ? false : true;
        if (isTraverse) {
            var next = instance.getNext();
            var prev = instance.getPrev();
            instance.remove();
            if (next) {
                this.app.block.set(next, 'start');
            } else if (prev) {
                this.app.block.set(prev, 'end');
            } else {
                this.unset();
            }
        } else {
            this.unset();
            instance.remove();
        }
        if (type === 'image') {
            this.app.broadcast('image.remove', {
                url: imageUrl,
            });
        }
        this.app.broadcast('block.remove', {
            type: type,
            parent: parent,
        });
        if (this.app.editor.isEmpty()) {
            this.app.editor.setEmpty();
        }
    },
    observe: function (obj, name) {
        var types = ['line', 'quote', 'layer', 'code'];
        if (types.indexOf(name) !== -1 && !this.opts[name]) return false;
        if (name === 'alignment' && !this.opts.align) return false;
        if (name === 'valign' && !this.opts.valign) return false;
        if (name === 'outset' && !this.opts.outset) return false;
    },
    observeCard: function (obj, name) {
        if (name === 'image') {
            var instance = this.get();
            if (!instance.hasImage()) return false;
        }
    },
    popup: function (params, button, name) {
        var form;
        if (name === 'alignment') {
            form = this._buildSegments('align', 'alignment');
        } else if (name === 'valign') {
            form = this._buildSegments('valign');
        } else if (name === 'outset') {
            form = this._buildSegments('outset');
        }
        this.app.popup.create(name, {
            setter: 'block.setData',
            getter: 'block.getData',
            form: form,
        });
        this.app.popup.open({
            button: button,
        });
    },
    css: function (name, value) {
        if (!this.is()) return;
        var $el = this.get().getBlock();
        $el.css(name, value);
        var name = 'data-' + this.prefix + '-style-cache';
        var style = $el.attr('style');
        if (style) {
            style = style.replace(/"/g, '');
            $el.attr(name, style);
        }
    },
    getData: function () {
        if (!this.is()) return;
        var instance = this.get();
        return instance.getData();
    },
    setData: function (stack) {
        if (!this.is()) return;
        var data = stack.getData();
        var instance = this.get();
        instance.setData(data);
    },
    _isBlockActive: function (el) {
        if (this.app.blocks.is()) return false;
        return this.instance && this.dom(el).get() === this.$block.get();
    },
    _isAction: function () {
        return !this.app.blocks.is() && this.is();
    },
    _buildSegments: function (name, title) {
        var form = {};
        var segments = {};
        var obj = this.opts[name];
        for (var key in obj) {
            if (!obj[key]) continue;
            segments[key] = {
                name: obj[key],
                prefix: name,
            };
        }
        title = title || name;
        form[name] = {
            type: 'segment',
            label: '## form.' + title + ' ##',
            segments: segments,
        };
        return form;
    },
    _appendToEmptyBlock: function (instance) {
        var emptyBlock = this.app.block.create();
        emptyBlock.append(instance);
        return emptyBlock.getBlock();
    },
    _getInstance: function (el) {
        return this.dom(el).dataget('instance');
    },
    _setCaret: function (caret) {
        if (this.instance.isEditable()) {
            if (caret) {
                var $target = this.$block;
                if (this.instance.getType() === 'list' && (caret === 'start' || caret === 'end')) {
                    $target = caret === 'start' ? this.$block.find('li').first() : this.$block.find('li').last();
                }
                this.app.caret.set($target, caret);
            }
        } else {
            this.app.scroll.save();
            this.app.editor.getWin().focus();
            this.$block.focus();
            setTimeout(
                function () {
                    this.app.selection.removeAllRanges();
                }.bind(this),
                0
            );
            this.app.scroll.restore();
        }
    },
};
