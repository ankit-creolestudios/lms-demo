module.exports = {
    init: function () {
        this.dragoverEvent = false;
        this.imageDrag = false;
        this.pressedCmd = false;
        this.isPopupMouseUp = false;
        this.isBlockMouseUp = false;
        this.pasteEvent = false;
        this.events = {
            frame: [
                'click',
                'contextmenu',
                'touchstart',
                'mouseover',
                'mouseup',
                'mousedown',
                'keydown',
                'keyup',
                'paste',
                'copy',
                'cut',
                'drop',
                'dragstart',
                'dragover',
                'dragleave',
            ],
            doc: ['keydown', 'mousedown', 'click'],
            win: ['focus'],
        };
    },
    run: function () {
        this._runEvents();
    },
    pause: function () {
        this._pauseEvents();
    },
    build: function () {
        this._buildTargets();
        this._buildPreventLinks();
        this._buildEvents();
    },
    stop: function () {
        var eventname = this.prefix + '-events';
        this.$body.off('.' + eventname);
        this.$win.off('.' + eventname);
        this.app.$doc.off('.' + eventname);
    },
    onmouseover: function (e) {
        this._buildHover(e);
        this.app.broadcast('editor.mouseover', {
            e: e,
        });
    },
    oncontextmenu: function (e) {
        if (this.pressedCmd) {
            e.preventDefault();
            var $block = this._getBlock(e);
            this.app.blocks.set($block);
        }
    },
    onclick: function (e) {
        this.app.broadcast('editor.click', {
            e: e,
        });
        if (this._isEditorClick(e) && !this.isBlockMouseUp) {
            this._setByClick(e);
        }
    },
    onmouseup: function (e) {
        this.app.state.add(e);
        this.app.broadcast('editor.mouseup', {
            e: e,
        });
        this.app.toolbar.observe();
    },
    onmousedown: function (e) {
        if (this.app.popup.isOpen()) {
            this.app.popup.close();
        }
        this._setBlock(e);
        this._setCaretInline(e);
        this.app.placeholder.handleClick(e);
        if (this._isEditorClick(e)) {
            this.isBlockMouseUp = false;
            return;
        } else {
            this.isBlockMouseUp = true;
        }
        this.app.state.add(e);
        this.app.broadcast('editor.mousedown', {
            e: e,
        });
    },
    ontouchstart: function (e) {
        this.app.state.add(e);
    },
    onkeydown: function (e) {
        var event = this.app.broadcast('editor.keydown', this._buildEventKeysObj(e));
        if (event.isStopped()) return e.preventDefault();
        if (this.opts.editor.enterKey === false && e.which === 13) {
            e.preventDefault();
            return;
        }
        if (this.app.state.listen(e)) {
            this.pressedCmd = false;
            return;
        }
        this.pressedCmd = this._isCmdPressed(e);
        if (this._isEsc(e)) {
            this.app.block.unset();
            this.app.selection.removeAllRanges();
        }
        if (this.app.shortcut.handle(e)) return;
        this.app.input.handle(event);
    },
    onkeyup: function (e) {
        var event = this.app.broadcast('editor.keyup', this._buildEventKeysObj(e));
        if (event.isStopped()) return e.preventDefault();
        var key = e.which;
        if (key === this.app.keycodes.TAB && !this.app.block.is()) {
            if (e.target && e.target.tagName === 'BODY') {
                var $first = this.app.blocks.getFirst();
                this.app.editor.setFocus();
                this.app.block.set($first);
            } else {
                this._setBlock(e);
            }
        }
        this.pressedCmd = false;
        this.app.blocks.unsetHover();
        this.app.toolbar.observe();
    },
    onpaste: function (e) {
        this._paste(e);
    },
    oncopy: function (e) {
        this._copy(e);
    },
    oncut: function (e) {
        this._cut(e);
    },
    ondrop: function (e) {
        if (!this.opts.editor.drop) return e.preventDefault();
        var event = this.app.broadcast('editor.drop', {
            e: e,
        });
        if (event.isStopped()) return e.preventDefault();
        var html;
        var dt = e.dataTransfer;
        var item = dt.getData('item');
        if (item !== '') {
            e.preventDefault();
            if (this.opts.draggable && typeof this.opts.draggable[item] !== 'undefined') {
                html = this.opts.draggable[item];
            } else {
                html = this.dom('[data-' + this.prefix + '-drop-item=' + item + ']').html();
                html = html.trim();
            }
            if (html) {
                var position = 'after';
                var $over = this.app.editor.getBody().find('.' + this.prefix + '-draggable-over');
                if ($over.length !== 0) {
                    position = 'append';
                }
                this._drop(e, html, position, false);
            }
        } else if (this.opts.image && this.opts.image.upload && dt.files !== null && dt.files.length > 0) {
            e.preventDefault();
            this.app.image.drop(e, dt);
        } else {
            html = dt.getData('text/html');
            html = html.trim() === '' ? dt.getData('Text') : html;
            var dropped = this._drop(e, html);
            if (this.imageDrag && dropped.instances.length !== 0) {
                var instance = dropped.instances[0];
                instance.change(this.imageDrag, false);
            }
        }
        this._removeDragPlaceholder();
        this.imageDrag = false;
        this.app.observer.trigger = true;
    },
    ondragstart: function (e) {
        var $block = this._getBlock(e.target);
        if ($block.length !== 0 && this.app.element.getType($block) === 'image') {
            this.imageDrag = $block.dataget('instance');
        }
        this.app.broadcast('editor.dragstart', {
            e: e,
        });
    },
    ondragover: function (e) {
        e.preventDefault();
        this.dragoverEvent = true;
        this.app.observer.trigger = false;
        this._removeDragPlaceholder();
        var types = e.dataTransfer.types;
        if (types.indexOf('item') !== -1) {
            var $block = this._getBlock(e.target);
            if ($block.length !== 0) {
                var instance = $block.dataget('instance');
                if (instance.getType('layer') && instance.isEmpty()) {
                    $block.addClass(this.prefix + '-draggable-over');
                } else {
                    var $pl = this.dom('<div>').addClass(this.prefix + '-draggable-placeholder');
                    $block.after($pl);
                }
            }
        }
        this.app.broadcast('editor.dragover', {
            e: e,
        });
    },
    ondragleave: function (e) {
        e.preventDefault();
        this.dragoverEvent = false;
        this._removeDragPlaceholder();
        this.app.observer.trigger = true;
        this.app.broadcast('editor.dragleave', {
            e: e,
        });
    },
    onwinfocus: function (e) {
        if (this._isRemoveRanges()) {
            setTimeout(
                function () {
                    this.app.selection.removeAllRanges();
                }.bind(this),
                0
            );
            return;
        }
    },
    ondockeydown: function (e) {
        if (this._isEsc(e) && this.app.popup.isOpen()) {
            this.app.popup.close(false);
        }
    },
    ondocmousedown: function (e) {
        this.isPopupMouseUp = this.dom(e.target).closest('.' + this.prefix + '-popup-' + this.uuid).length !== 0;
    },
    ondocclick: function (e) {
        if (!this._isOutsideEditor(e)) return;
        if (this.app.popup.isOpen()) {
            if (this.isPopupMouseUp === false) this.app.popup.close(false);
        } else {
            this.app.editor.setBlur();
        }
        this.pressedCmd = false;
    },
    _buildPreventLinks: function () {
        var eventname = this.prefix + '-prevent-events';
        this.$body.on('click.' + eventname + ' dblclick.' + eventname, this._preventLinks.bind(this));
    },
    _buildTargets: function () {
        this.$body = this.app.editor.getBody();
        this.$win = this.app.editor.getWin();
    },
    _buildEventKeysObj: function (e) {
        var key = e.which;
        var arrowKeys = [this.app.keycodes.UP, this.app.keycodes.DOWN, this.app.keycodes.LEFT, this.app.keycodes.RIGHT];
        var isAlphaKeys = !e.ctrlKey && !e.metaKey && ((key >= 48 && key <= 57) || (key >= 65 && key <= 90));
        var k = this.app.keycodes;
        return {
            e: e,
            key: key,
            ctrl: e.ctrlKey || e.metaKey,
            shift: e.shiftKey,
            alt: e.altKey,
            select: (e.ctrlKey || e.metaKey) && !e.altKey && key === 65,
            enter: key === k.ENTER,
            space: key === k.SPACE,
            esc: key === k.ESC,
            tab: key === k.TAB && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey,
            delete: key === k.DELETE,
            backspace: key === k.BACKSPACE,
            alpha: isAlphaKeys,
            arrow: arrowKeys.indexOf(key) !== -1,
            left: key === k.LEFT,
            right: key === k.RIGHT,
            up: key === k.UP,
            down: key === k.DOWN,
            'left-right': key === k.LEFT || key === k.RIGHT,
            'up-left': key === k.UP || key === k.LEFT,
            'down-right': key === k.DOWN || key === k.RIGHT,
        };
    },
    _buildEvents: function () {
        var eventname = this.prefix + '-events';
        this._buildTargetEvents(this.$body, this.events.frame, eventname, '');
        this._buildTargetEvents(this.$win, this.events.win, eventname, 'win');
        this._buildTargetEvents(this.app.$doc, this.events.doc, eventname, 'doc');
    },
    _buildTargetEvents: function ($target, events, eventname, type) {
        for (var i = 0; i < events.length; i++) {
            $target.on(events[i] + '.' + eventname, this['on' + type + events[i]].bind(this));
        }
    },
    _buildHover: function (e) {
        var instance = this.app.block.get();
        if (!this.pressedCmd || !instance) return;
        var $block = this.dom(e.target).closest('[data-' + this.prefix + '-first-level]');
        if ($block.length === 0) return;
        this.app.blocks.unsetHover();
        if (!$block.hasClass(this.prefix + '-block-focus')) {
            $block.addClass(this.prefix + '-block-multiple-hover');
        }
    },
    _runEvents: function () {
        var eventname = this.prefix + '-events';
        this._buildTargetEvents(this.$body, this.events.frame, eventname, '');
        this._buildTargetEvents(this.$win, this.events.win, eventname, 'win');
    },
    _pauseEvents: function () {
        var eventname = this.prefix + '-events';
        if (this.$body) {
            this.$body.off('.' + eventname);
            this.$win.off('.' + eventname);
        }
    },
    _getBlock: function (target) {
        return this.dom(target).closest('[data-' + this.prefix + '-type]');
    },
    _setByClick: function (e) {
        var blocks = this.app.blocks.getFirstLevel();
        var coords = [];
        blocks.each(function ($node) {
            var rect = $node.get().getBoundingClientRect();
            coords.push([rect.x, rect.y, rect.y + rect.height]);
        });
        var distances = [];
        var heightIndex = false;
        coords.forEach(function (coord, index) {
            var y = parseInt(e.clientY);
            var x = parseInt(e.clientX);
            if (coord[1] < y && y < coord[2]) {
                heightIndex = index;
                return;
            }
            var distance = Math.hypot(coord[0] - x, coord[1] - y);
            distances.push(parseInt(distance));
        });
        var closestIndex = heightIndex !== false ? heightIndex : distances.indexOf(Math.min.apply(Math, distances));
        var $block = blocks.eq(closestIndex);
        this.app.block.set($block.dataget('instance'), 'start');
        this.app.editor.setFocus();
    },
    _setCaretInline: function (e) {
        var instance = this.app.block.get();
        var code = false;
        if (instance && instance.isEditable()) {
            if (this.app.element.isEmptyOrImageInline(e.target)) {
                this.app.caret.set(e.target, 'after');
            } else if (this.app.selection.isCollapsed() && e.target.tagName === 'CODE') {
                code = true;
                setTimeout(
                    function () {
                        var current = this.app.selection.getElement();
                        if (current && code && current.tagName !== 'CODE') {
                            this.app.caret.set(e.target, 'start');
                            code = false;
                        }
                    }.bind(this),
                    1
                );
            }
        }
    },
    _setBlock: function (e) {
        this.app.editor.setFocus();
        var $block = e ? this._getBlock(e.target) : this.app.selection.getDataBlock();
        if ($block.length === 0) return;
        if ($block.attr('contenteditable') === false) {
            e.preventDefault();
        }
        if (this.pressedCmd) {
            if (e) e.preventDefault();
            this.app.blocks.set($block);
        } else {
            this.app.block.set($block);
        }
    },
    _isRemoveRanges: function () {
        var instance = this.app.block.get();
        return this.app.blocks.is() || (instance && instance.isInlineBlock());
    },
    _isEsc: function (e) {
        return e.which === this.app.keycodes.ESC;
    },
    _isEditorClick: function (e) {
        if (this.app.editor.isEditor(e.target)) {
            e.preventDefault();
            return true;
        }
    },
    _isOutsideEditor: function (e) {
        var $target = this.dom(e.target);
        var targets = ['-container-', '-popup-', '-control-'];
        return (
            $target.closest('.' + this.prefix + targets.join(this.uuid + ',.' + this.prefix) + this.uuid).length === 0
        );
    },
    _isCmdPressed: function (e) {
        return this.opts.selection.multiple ? (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey : false;
    },
    _isLinkClick: function (e) {
        return this.dom(e.target).closest('a').length !== 0;
    },
    _removeDragPlaceholder: function () {
        var $body = this.app.editor.getBody();
        $body.find('.' + this.prefix + '-draggable-placeholder').remove();
        $body.find('.' + this.prefix + '-draggable-over').removeClass(this.prefix + '-draggable-over');
    },
    _preventLinks: function (e) {
        if (this._isLinkClick(e)) e.preventDefault();
    },
    _drop: function (e, html, position, cleanDrop) {
        var target = this.app.element.getDataBlock(e.target);
        target = target.length === 0 ? this.app.blocks.getFirst() : target;
        this.app.block.set(target);
        if (!position) {
            this.app.insertion.insertPoint(e);
        }
        var clean = true;
        var parse = true;
        var instance = this.app.block.get();
        var isAll = this.app.editor.isAllSelected();
        if (instance && instance.getType() === 'code' && !isAll) {
            clean = false;
            parse = false;
            html = this.app.content.getTextFromHtml(html, {
                nl: true,
                trimlines: false,
            });
        }
        if (cleanDrop === false) {
            clean = false;
        }
        if (html === '') {
            return;
        }
        html = clean ? this.app.autoparse.parse(html) : html;
        return this.app.insertion.insertContent({
            html: html,
            clean: clean,
            parse: parse,
            position: position,
        });
    },
    _paste: function (e) {
        e.preventDefault();
        var clipboard = e.clipboardData;
        if (this.app.image.insertFromClipboard(clipboard)) {
            return;
        }
        var url = clipboard.getData('URL');
        var html = this.app.clipboard.getContent(clipboard);
        this.pasteEvent = true;
        var event = this.app.broadcast('editor.before.paste', {
            e: e,
            html: html,
        });
        if (event.isStopped()) {
            this.pasteEvent = false;
            return;
        }
        html = event.get('html');
        html = !url || url === '' ? html : url;
        var instance = this.app.block.get();
        var clean = true;
        var parse = true;
        var isAll = this.app.editor.isAllSelected();
        if (this.opts.paste.plaintext) {
            clean = false;
            parse = false;
            html = this.app.content.getTextFromHtml(html, {
                br: true,
            });
        } else if (instance && instance.getType() === 'code' && !isAll) {
            clean = false;
            parse = false;
            html = this.app.content.getTextFromHtml(html, {
                nl: true,
                trimlines: false,
            });
        } else if (!this.opts.paste.clean) {
            clean = false;
        }
        html = this.opts.paste.links ? html : this.app.content.removeTags(html, ['a']);
        html = this.opts.paste.images ? html : this.app.content.removeTags(html, ['img']);
        if (html === '') {
            this.pasteEvent = false;
            return;
        }
        var rtf = clipboard.getData('text/rtf');
        var images;
        if (rtf) {
            images = this._findLocalImages(html);
            html = this._replaceLocalImages(html, images, this._extractImagesFromRtf(rtf));
        }
        html = clean ? this.app.autoparse.parse(html) : html;
        var inserted = this.app.insertion.insertContent({
            html: html,
            clean: clean,
            parse: parse,
        });
        if (this.opts.image.upload) {
            this.app.image.parseInserted(inserted);
        }
        this.app.placeholder.toggle();
        this.app.broadcast('editor.paste', inserted);
        this.pasteEvent = false;
    },
    _copy: function (e) {
        this._action(e, 'copy');
    },
    _cut: function (e) {
        this._action(e, 'cut');
    },
    _action: function (e, name) {
        var instance = this.app.block.get();
        var isMultiple = this.app.blocks.is();
        var html = false;
        var obj = {
            html: false,
            remove: 'content',
        };
        if (!isMultiple && !instance) return;
        if (!isMultiple && instance && instance.isEditable() && this.app.selection.isCollapsed()) return;
        e.preventDefault();
        if (this.app.editor.isAllSelected()) {
            obj = {
                html: this.app.editor.getLayout().html(),
                remove: 'all',
            };
        } else if (isMultiple) {
            obj = {
                html: this._copyFromMultiple(name),
                remove: 'blocks',
            };
        } else if (instance && instance.isEditable()) {
            obj = this._copyFromEditable(name, instance);
        } else if (instance) {
            obj = this._copyFromNonEditable(name, instance);
        }
        var event = this.app.broadcast('editor.before.' + name, {
            e: e,
            html: obj.html,
        });
        if (event.isStopped()) {
            return;
        }
        if (name === 'cut') {
            this._cutDeleteContent(obj);
        }
        html = event.get('html');
        html = this.app.clipboard.setContent(e, html);
        this.app.broadcastHtml('editor.' + name, html);
    },
    _cutDeleteContent: function (obj) {
        if (obj.remove === 'instance') {
            obj.instance.remove(true);
            this.app.control.close();
        } else if (obj.remove === 'all') {
            this.app.editor.setEmpty();
        } else if (obj.remove === 'blocks') {
            this.app.blocks.removeSelected(false);
        } else if (obj.remove === 'row') {
            obj.instance.getBlock().find('td, th').html('');
        } else if (obj.remove === 'noneditable') {
            var type = obj.instance.getType();
            var parentInstance = obj.instance.getParent('layer');
            if (type === 'column') {
                obj.instance.setEmpty();
            } else {
                obj.instance.remove(true);
                this.app.control.close();
            }
            if (type === 'layer' && parentInstance && parentInstance.isEmpty()) {
                parentInstance.setEmpty();
            }
        } else if (obj.remove !== false) {
            this.app.selection.deleteContents();
        }
    },
    _copyFromMultiple: function (name) {
        var $blocks = this.app.blocks.getSelected();
        var $tmp = this.dom('<div>');
        $blocks.each(function ($node) {
            $tmp.append($node.clone());
        });
        return $tmp.html();
    },
    _copyFromEditable: function (name, instance) {
        var type = instance.getType();
        var html = this.app.selection.getHtml();
        var remove = 'content';
        if (type === 'figcaption' || type === 'cell') {
            remove = 'content';
        } else if (instance.isAllSelected()) {
            html = instance.getOuterHtml();
            remove = 'instance';
        } else if (type === 'dlist') {
            if (html.search(/<dl/gi) === -1) {
                html = '<dl>' + html + '</dl>';
            }
        } else if (type === 'list') {
            var tag = instance.getTag();
            if (html.search(/<li/gi) !== -1) {
                if (html.search(/^<li/g) === -1) {
                    html = '<li>' + html + '</li>';
                }
                html = '<' + tag + '>' + html + '</' + tag + '>';
            }
        }
        return {
            html: html,
            remove: remove,
            instance: instance,
        };
    },
    _copyFromNonEditable: function (name, instance) {
        var $block = instance.getBlock();
        var type = instance.getType();
        var html = '';
        var remove = 'noneditable';
        if (type === 'column') {
            html = $block.html();
        } else if (type === 'row') {
            html = instance.getOuterHtml();
            html = '<table>' + html + '</table>';
            remove = 'row';
        } else {
            html = instance.getOuterHtml();
        }
        return {
            html: html,
            remove: remove,
            instance: instance,
        };
    },
    _findLocalImages: function (html) {
        var images = [];
        this.app.utils.wrap(html, function ($w) {
            $w.find('img').each(function ($node) {
                if ($node.attr('src').search(/^file:\/\//) !== -1) {
                    images.push($node.attr('src'));
                }
            });
        });
        return images;
    },
    _extractImagesFromRtf: function (rtf) {
        if (!rtf) return [];
        var reHeader = /{\\pict[\s\S]+?\\bliptag-?\d+(\\blipupi-?\d+)?({\\\*\\blipuid\s?[\da-fA-F]+)?[\s}]*?/;
        var reImage = new RegExp('(?:(' + reHeader.source + '))([\\da-fA-F\\s]+)\\}', 'g');
        var images = rtf.match(reImage);
        if (!images) return [];
        var res = [];
        for (var i = 0; i < images.length; i++) {
            var type = false;
            if (images[i].indexOf('\\pngblip') !== -1) {
                type = 'image/png';
            } else if (images[i].indexOf('\\jpegblip') !== -1) {
                type = 'image/jpeg';
            }
            if (type) {
                res.push({
                    hex: images[i].replace(reHeader, '').replace(/[^\da-fA-F]/g, ''),
                    type: type,
                });
            }
        }
        return res;
    },
    _convertHexToBase64: function (str) {
        return btoa(
            str
                .match(/\w{2}/g)
                .map(function (char) {
                    return String.fromCharCode(parseInt(char, 16));
                })
                .join('')
        );
    },
    _replaceLocalImages: function (html, images, sources) {
        if (images.length === sources.length) {
            for (var i = 0; i < images.length; i++) {
                var src = 'data:' + sources[i].type + ';base64,' + this._convertHexToBase64(sources[i].hex);
                html = html.replace(new RegExp('src="' + images[i] + '"', 'g'), 'src="' + src + '"');
            }
        }
        return html;
    },
};
