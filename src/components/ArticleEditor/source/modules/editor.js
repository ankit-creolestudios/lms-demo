module.exports = {
    init: function () {
        this.mobileMode = false;
        this.customButtons = {};
    },
    start: function () {
        this._buildFrame();
        this._buildDisabled();
        this._buildBlurClass();
        this._buildOptions();
        this._buildMultiple();
        this._buildParserTags();
        this._buildStartHtml();
        this._buildLayout();
        this._buildContent();
    },
    stop: function () {
        this.$editor = false;
        this.customButtons = {};
        this.app.$element.show();
    },
    build: function () {
        this.app.embed.build();
        this.app.blocks.build();
        this.app.image.observeStates();
        this.app.parser.buildPredefinedClasses();
        this.app.broadcast('editor.build');
    },
    insertContent: function (params) {
        this.app.insertion.insertContent(params);
    },
    setContent: function (params) {
        this.app.insertion.setContent(params);
    },
    setEmpty: function () {
        this.app.insertion.setContent({
            html: '',
        });
    },
    setWinFocus: function () {
        this.getWin().focus();
    },
    setFocus: function (caret) {
        if (this.opts.disableMode) return;
        if (caret) {
            this._setFocusCaret(caret);
        } else {
            this._setFocusEvent();
        }
    },
    setBlur: function () {
        if (this.opts.disableMode || !this.isFocus()) return;
        if (!this.$editor.get) return;
        this.app.container.setBlur();
        if (!this.app.source.is()) {
            this._enableToolbarButtons();
            this.app.block.unset();
            this.app.blocks.unset();
        }
        this.app.selection.removeAllRanges();
        if (!this.app.source.is() && !this.isMobileView()) {
            this.app.path.build();
            this.app.toolbar.build();
            this.app.control.close();
        }
        this.app.popup.close(false);
        this.app.broadcast('editor.blur');
    },
    selectAll: function (type) {
        if (this.isAllSelected()) return;
        this._setSelectAllClass();
        this.app.blocks.unset();
        this.app.blocks.setFirstLevel();
        this.app.selection.removeAllRanges();
        this.app.path.build();
        this.app.toolbar.build();
        this.app.control.close();
    },
    unselectAll: function () {
        if (!this.isAllSelected()) return;
        this.unsetSelectAllClass();
        this.app.block.unset();
        this.app.blocks.unset();
    },
    unsetSelectAllClass: function () {
        this.$editor.removeClass(this.prefix + '-select-all');
    },
    addButton: function (name, obj) {
        this.customButtons[name] = obj;
    },
    getButtons: function () {
        var buttons = this.getButtonsFromArr(this.opts.buttons.editor);
        var res = {};
        for (var name in buttons) {
            if (name === 'html' && !this.opts.source) continue;
            if (name === 'templates' && !this.opts.templates.json) continue;
            res[name] = buttons[name];
        }
        res = globalThis.$ARX.extend(true, {}, res, this.customButtons);
        return res;
    },
    getContent: function (tidy) {
        var html = '';
        if (this.app.source.is()) {
            html = this.app.source.getContent();
        } else {
            html = this._getContent();
            html = tidy ? this.app.tidy.parse(html) : html;
        }
        html = this.app.content.decodeHref(html);
        return html;
    },
    getWidth: function () {
        var $editor = this.getEditor();
        var padLeft = parseInt($editor.css('padding-left'));
        var padRight = parseInt($editor.css('padding-right'));
        return $editor.width() - padLeft - padRight;
    },
    getRect: function () {
        return this.getFrameRect();
    },
    getFrameRect: function () {
        var offset = this.$editor.offset();
        var width = this.$editor.width();
        var height = this.$editor.height();
        var top = Math.round(offset.top);
        var left = Math.round(offset.left);
        return {
            top: top,
            left: left,
            bottom: top + height,
            right: left + width,
            width: width,
            height: height,
        };
    },
    getSelection: function () {
        var sel = this.getWinNode().getSelection();
        if (sel === null) {
            return false;
        }
        return sel.rangeCount > 0 ? sel : false;
    },
    getEditor: function () {
        return this.getFrame();
    },
    getFrame: function () {
        return this.$editor ? this.$editor : this.dom();
    },
    getLayout: function () {
        return this.$layout;
    },
    getOverlay: function () {
        return this.$overlay;
    },
    getHead: function () {
        return this.getDoc().find('head');
    },
    getBody: function () {
        return this.$editor ? this.getDoc().find('body') : this.dom();
    },
    getDoc: function () {
        return this.dom(this.getDocNode());
    },
    getDocNode: function () {
        return this.$editor.get().contentWindow.document;
    },
    getWin: function () {
        return this.dom(this.getWinNode());
    },
    getWinNode: function () {
        return this.$editor.get().contentWindow;
    },
    getButtonsFromArr: function (arr) {
        var buttons = {};
        if (!Array.isArray(arr) && typeof arr === 'object') {
            return arr;
        } else if (arr) {
            var obj = globalThis.$ARX.extend(true, {}, this.opts.buttonsObj);
            for (var i = 0; i < arr.length; i++) {
                var name = arr[i];
                if (typeof obj[name] !== 'undefined') {
                    buttons[name] = obj[name];
                }
            }
        }
        return buttons;
    },
    adjustHeight: function () {
        if (!this.$editor) return;
        setTimeout(
            function () {
                if (typeof this.$editor.height !== 'function') {
                    return;
                }
                this.$editor.height(this.getBody().height());
            }.bind(this),
            1
        );
    },
    toggleView: function (button) {
        if (this.mobileMode) {
            this.$editor.css('width', '');
            this.enableUI();
            this.app.toolbar.unsetToggled('mobile');
            this.app.event.run();
            this.app.blocks.runEditableBlocks();
            this.app.observer.build();
            this.mobileMode = false;
        } else {
            this.$editor.css('width', this.opts.editor.mobile + 'px');
            this.disableUI();
            this.app.toolbar.setToggled('mobile');
            this.app.popup.close();
            this.app.control.close();
            this.app.event.pause();
            this.app.blocks.pauseEditableBlocks();
            this.app.observer.stop();
            this.mobileMode = true;
        }
        this.adjustHeight();
    },
    observeUI: function () {
        this.app.toolbar.observe();
    },
    enableUI: function () {
        this.app.path.enable();
        this.app.topbar.enable();
        this.app.toolbar.enable();
        this.app.toolbar.enableSticky();
    },
    disableUI: function () {
        this.app.path.disable();
        this.app.topbar.disable();
        this.app.toolbar.disable();
        this.app.toolbar.disableSticky();
    },
    isEditor: function (el) {
        return this.isLayout(el);
    },
    isLayout: function (el) {
        return this.dom(el).get() === this.$layout.get();
    },
    isTextarea: function () {
        return this.opts.content === false;
    },
    isAllSelected: function () {
        return this.$editor.hasClass(this.prefix + '-select-all');
    },
    isFocus: function () {
        return this.app.container.isFocus();
    },
    isEmpty: function (emptyparagraph) {
        var blocks = this.app.blocks.getFirstLevel();
        if (blocks.length > 1) {
            return false;
        } else {
            return this.app.content.isEmptyHtml(this.$layout.html(), emptyparagraph);
        }
    },
    isMobileView: function () {
        return this.mobileMode;
    },
    isPopupSelection: function () {
        return true;
    },
    isBlocksSelection: function () {
        return false;
    },
    _buildFrame: function () {
        this.app.$element.hide();
        this.$editor = this.dom('<iframe>').addClass(this.prefix + '-editor-frame');
        this.app.container.get('editor').append(this.$editor);
        this.$overlay = this.dom('<div>').addClass(this.prefix + '-editor-overlay');
        this.app.container.get('editor').append(this.$overlay);
    },
    _buildDisabled: function () {
        this.opts.disableMode = this.opts.editor.disabled || this.app.$element.attr('disabled') !== null;
    },
    _buildBlurClass: function () {
        this.app.container.get('main').addClass(this.prefix + '-in-blur');
    },
    _buildMultiple: function () {
        if (this.opts.selection.multiple === false) {
            this.app.shortcut.remove('meta+click');
        }
    },
    _buildOptions: function () {
        var $e = this.$editor;
        var o = this.opts.editor;
        var p = this.opts.paste;
        if (Object.prototype.hasOwnProperty.call(p, 'autolink')) {
            p.autoparse = p.autolink;
        }
        $e.attr('dir', o.direction);
        $e.attr('scrolling', 'no');
        $e.css('visibility', 'hidden');
        if (o.minHeight) $e.css('min-height', o.minHeight);
        if (o.maxHeight) {
            $e.css('max-height', o.maxHeight);
            $e.attr('scrolling', 'yes');
        }
        if (o.notranslate) $e.addClass('notranslate');
        if (!o.spellcheck) $e.attr('spellcheck', false);
    },
    _buildStartHtml: function () {
        var doctype = this._createDoctype();
        var scripts = this._createScripts();
        var layout = '<div class="' + this.opts.editor.classname + '"></div>';
        var code = doctype + '<html><head></head><body>' + layout + scripts + '</body></html>';
        this._writeCode(code);
    },
    _buildLayout: function () {
        var $body = this.getBody();
        this.$layout = $body.find('.' + this.opts.editor.classname).first();
        this.$layout.attr('dir', this.opts.editor.direction);
        if (this.opts.editor.padding === false) {
            this.$layout.css('padding', 0);
        }
        $body.css('height', 'auto');
    },
    _buildContent: function () {
        var content = this._getContentValue();
        content = this.app.broadcastHtml('editor.before.load', content);
        var $parsed = this.app.parser.parse(content, true, true);
        this.$layout.html($parsed.get().childNodes);
        var unparsed = this.app.parser.unparse(this.$layout.html());
        this.app.$element.val(unparsed);
        this._load();
    },
    _buildVisibility: function () {
        this.$editor.css('visibility', 'visible');
    },
    _buildEditorCss: function () {
        if (!this.opts.css) return;
        var css;
        if (Array.isArray(this.opts.css)) {
            css = this.opts.css;
        } else {
            css = [this.opts.css + 'arx-frame.min.css', this.opts.css + 'arx-content.min.css'];
        }
        for (var i = 0; i < css.length; i++) {
            this._buildCssLink(css[i]);
        }
    },
    _buildCustomCss: function () {
        if (!this.opts.custom.css) return;
        for (var i = 0; i < this.opts.custom.css.length; i++) {
            this._buildCssLink(this.opts.custom.css[i]);
        }
    },
    _buildCssLink: function (href) {
        var obj =
            typeof href === 'object'
                ? href
                : {
                      href: href,
                  };
        obj.href = obj.href + '?' + new Date().getTime();
        var $css = this.dom('<link>').attr({
            class: this.prefix + '-css',
            rel: 'stylesheet',
        });
        $css.attr(obj);
        this.getHead().append($css);
    },
    _buildGridCssVar: function () {
        if (!this.opts.grid) return;
        var style = this.getDocNode().documentElement.style;
        style.setProperty('--' + this.prefix + '-grid-columns', this.opts.grid.columns);
        style.setProperty('--' + this.prefix + '-grid-gutter', this.opts.grid.gutter);
        style.setProperty('--' + this.prefix + '-grid-offset-left', this.opts.grid.offset.left);
        style.setProperty('--' + this.prefix + '-grid-offset-right', this.opts.grid.offset.right);
        if (this.app.initialSettings.grid && this.app.initialSettings.grid.patterns) {
            this.opts.grid.patterns = this.app.initialSettings.grid.patterns;
        }
    },
    _buildParserTags: function () {
        var parser = this.opts.parser;
        for (var key in parser) {
            if (parser[key].parse && parser[key].tag) {
                var tag = parser[key].tag;
                if (typeof this.opts.parserTags[tag] === 'undefined') this.opts.parserTags[tag] = [];
                this.opts.parserTags[tag].push(parser[key].parse);
            }
        }
    },
    _buildDraggable: function () {
        var $items = this.app.$body.find('[data-' + this.prefix + '-drop-id]');
        $items.each(
            function ($node) {
                $node.attr('draggable', true);
                $node.on(
                    'dragstart',
                    function (e) {
                        var $target = this.dom(e.target);
                        var id = $target.attr('data-' + this.prefix + '-drop-id');
                        e.dataTransfer.setData('item', id);
                    }.bind(this)
                );
            }.bind(this)
        );
    },
    _load: function () {
        try {
            this._loadImages();
            this._loaded();
        } catch (e) {
            globalThis.$ARX.error(e);
        }
    },
    _loaded: function () {
        this.app.sync.build();
        this.app.event.build();
        this.app.embed.build();
        this.app.blocks.build();
        this.app.image.observeStates();
        this._buildVisibility();
        this._buildEditorCss();
        this._buildCustomCss();
        this._buildGridCssVar();
        this._buildDraggable();
        this.getWin().on('resize.' + this.prefix + '-editor-frame', this.adjustHeight.bind(this));
        this.app.broadcast('editor.load');
        this.adjustHeight();
        setTimeout(
            function () {
                this.adjustHeight();
                this._setFocusOnStart();
                this.app.observer.build();
                this.app.broadcast('editor.ready');
            }.bind(this),
            1000
        );
        setTimeout(this.adjustHeight.bind(this), 3000);
    },
    _loadedImage: function () {
        this.imageslen--;
    },
    _loadImages: function () {
        var $doc = this.getDoc();
        var $images = $doc.find('img');
        this.imageslen = $images.length;
        $images.each(this._loadImage.bind(this));
        var timerImg = setInterval(
            function () {
                if (this.imageslen === 0) {
                    this.adjustHeight();
                    clearInterval(timerImg);
                    return;
                }
            }.bind(this),
            50
        );
    },
    _loadImage: function ($img) {
        var img = $img.get();
        if (this.opts.editor.images) {
            var arr = img.src.split('/');
            var last = arr[arr.length - 1];
            img.src = this.opts.editor.images + last;
        }
        $img.one('load', this._loadedImage.bind(this));
    },
    _setFocusOnStart: function () {
        if (!this.opts.editor.focus) return;
        this.setFocus();
        this.setFocus(this.opts.editor.focus);
    },
    _setSelectAllClass: function () {
        this.$editor.addClass(this.prefix + '-select-all');
    },
    _setFocusCaret: function (caret) {
        caret = this._getCaretPosition(caret);
        var target = this._getFocusTarget(caret);
        this.app.block.set(target, caret);
    },
    _setFocusEvent: function () {
        if (this.isFocus()) return;
        for (var i = 0; i < globalThis.$ARX.instances.length; i++) {
            if (globalThis.$ARX.instances[i] !== this.app) {
                globalThis.$ARX.instances[i].editor.setBlur();
            }
        }
        this.app.container.setFocus();
        this.app.broadcast('editor.focus');
    },
    _getCaretPosition: function (caret) {
        return caret === true ? 'start' : caret;
    },
    _getFocusTarget: function (caret) {
        return caret === 'start' ? this.app.blocks.getFirst() : this.app.blocks.getLast();
    },
    _getContent: function () {
        var html = this.$layout.html();
        html = this.app.parser.unparse(html);
        return html;
    },
    _getContentValue: function () {
        return this.opts.content ? this.opts.content : this.app.$element.val();
    },
    _enableToolbarButtons: function () {
        if (this.app.source.is() || this.isMobileView()) return;
        this.app.toolbar.enable();
    },
    _writeCode: function (html) {
        var doc = this.getDocNode();
        doc.open();
        doc.write(html);
        doc.close();
    },
    _createDoctype: function () {
        return this.opts.editor.doctype + '\n';
    },
    _createScripts: function () {
        if (!this.opts.custom.js) return '';
        var str = '';
        var scripts = this.opts.custom.js;
        for (var i = 0; i < scripts.length; i++) {
            var obj =
                typeof scripts[i] === 'object'
                    ? scripts[i]
                    : {
                          src: scripts[i],
                      };
            obj.src = obj.src + '?' + new Date().getTime();
            var $el = this.dom('<script>')
                .addClass(this.prefix + '-js')
                .attr(obj);
            str = str + $el.get().outerHTML;
        }
        return str;
    },
};
