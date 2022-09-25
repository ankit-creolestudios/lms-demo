module.exports = {
    popup: function (params, button) {
        var instance = this.app.block.get();
        var $block = instance ? instance.getBlock() : false;
        var tag = instance.getTag();
        var tags = this.opts.format;
        var items = {};
        for (var i = 0; i < tags.length; i++) {
            var key = tags[i];
            items[key] = {
                title: this.opts.formatObj[key].title,
                params: {
                    tag: key,
                },
                command: 'block.format',
                shortcut: this.opts.formatObj[key].shortcut,
            };
        }
        if (this.opts.formatAdd) {
            var obj = this.opts.formatAdd;
            for (var name in obj) {
                items[name] = {
                    title: obj[name].title,
                    params: obj[name].params,
                    command: 'block.format',
                };
            }
        }
        var active = this._isActiveFormat($block, tag, items);
        if (active) {
            items[active].active = true;
        }
        this.app.popup.create('format', {
            width: '300px',
            items: items,
        });
        this.app.popup.open({
            button: button,
        });
    },
    set: function (params) {
        if (this.app.popup.isOpen()) {
            this.app.popup.close();
        }
        if (this.app.blocks.is()) {
            return;
        }
        var $items;
        var instance = this.app.block.get();
        var isEmpty = instance.isEmpty();
        var caret = isEmpty ? 'start' : false;
        var format = {
            type: this.opts.formatObj[params.tag].type,
            tag: params.tag,
            classname: params.classname || false,
        };
        this.tag = instance.getTag();
        this.type = instance.getType();
        this.$block = instance.getBlock();
        if (!isEmpty) {
            this.app.selection.saveMarker();
        }
        if (this._isSameTag(format)) {
            format = this._checkSameFormat(this.$block, format);
        }
        if (format) {
            if (this._isListToText(format, 'list')) {
                $items = this._formatListToText(format);
            } else if (this._isListToText(format, 'dlist')) {
                $items = this._formatListToText(format, true);
            } else if (this._isTextToList(format, 'list')) {
                this._formatTextToList(format, false, caret);
            } else if (this._isTextToList(format, 'dlist')) {
                this._formatTextToList(format, true, caret);
            } else {
                this._replaceTo(instance, format, caret);
            }
        }
        if (!isEmpty) {
            this.app.selection.restoreMarker();
        }
        if ($items) {
            var $block = this.app.selection.getDataBlock();
            this.app.editor.build();
            this.app.block.set($block, caret);
        }
        instance = this.app.block.get();
        this.app.broadcast('block.format', {
            instance: instance,
        });
    },
    _isSameTag: function (format) {
        return this.tag === format.tag && this.type === format.type;
    },
    _checkSameFormat: function ($el, format) {
        var hasClass = this.app.element.hasClass($el, format.classname);
        return !format.classname || hasClass ? this._buildDefaultFormat() : format;
    },
    _buildDefaultFormat: function () {
        var type = this.opts.editor.markup;
        var tag = type === 'paragraph' ? 'p' : 'div';
        return {
            type: type,
            tag: tag,
        };
    },
    _formatListToText: function (format, dlist) {
        var $items = dlist ? this._getDlistItems() : this._getListItems();
        this._createItems($items, format);
        this.$block.remove();
        return $items;
    },
    _formatTextToList: function (format, dlist, caret) {
        var newInstance = this.app.create('block.' + format.type, '<' + format.tag + '>');
        var $newBlock = newInstance.getBlock();
        if (dlist && this.type === 'list') {
            var z = 0;
            this._getListItems().each(
                function ($node) {
                    var tag = z === 0 ? 'dt' : 'dd';
                    var $item = this.dom('<' + tag + '>').html($node.html());
                    z = tag === 'dt' ? 1 : 0;
                    $newBlock.append($item);
                }.bind(this)
            );
        } else if (!dlist && this.type === 'dlist') {
            this._getDlistItems().each(
                function ($node) {
                    var $item = this.dom('<li>').html($node.html());
                    $newBlock.append($item);
                }.bind(this)
            );
        } else {
            var tag = dlist ? '<dt>' : '<li>';
            var $item = this.dom(tag).html(this.$block.html());
            $newBlock.append($item);
        }
        this.app.create('block.' + format.type, $newBlock);
        this.$block.after($newBlock);
        this.$block.remove();
        this._setStyleAndClass($newBlock, format);
        this.app.editor.build();
        this.app.block.set($newBlock, caret);
    },
    _replaceTo: function (instance, format, caret) {
        var $block = instance.getBlock();
        var $newBlock = this._replaceToBlock($block, format);
        this.app.editor.build();
        this.app.block.set($newBlock, caret);
    },
    _replaceToBlock: function ($block, format) {
        var $newBlock = this.app.element.replaceToTag($block, format.tag);
        this._setStyleAndClass($newBlock, format);
        return this.app.create('block.' + format.type, $newBlock);
    },
    _createItems: function ($items, format) {
        $items.each(
            function ($node) {
                var $item = this.dom('<' + format.tag + '>');
                $item.html($node.html());
                $node.remove();
                this.app.create('block.' + format.type, $item);
                this.$block.before($item);
                this._setStyleAndClass($item, format);
            }.bind(this)
        );
    },
    _isListToText: function (format, type) {
        return this.type === type && ['heading', 'address', 'paragraph', 'text'].indexOf(format.type) !== -1;
    },
    _isTextToList: function (format, type) {
        var checkType = type === 'list' ? 'dlist' : 'list';
        return format.type === type && ['heading', 'address', 'paragraph', 'text', checkType].indexOf(this.type) !== -1;
    },
    _isActiveFormat: function ($el, tag, items) {
        if (!$el) return;
        var name;
        for (var key in items) {
            var classname = items[key].params.classname || false;
            var paramstag = items[key].params.tag;
            if (tag === paramstag) {
                if (!classname) {
                    name = key;
                } else if (classname && this.app.element.hasClass($el, classname)) {
                    name = key;
                }
            }
        }
        return name;
    },
    _setStyleAndClass: function ($el, format) {
        $el.removeAttr('style class data-' + this.prefix + '-style-cache');
        if (format.classname) {
            $el.addClass(format.classname);
        }
    },
    _getListItems: function () {
        var $items = this.$block.find('li');
        $items.find('ul, ol').each(function ($node) {
            $node.parent().after($node);
        });
        $items.find('ul, ol').unwrap();
        return $items;
    },
    _getDlistItems: function () {
        return this.$block.find('dt, dd');
    },
};
