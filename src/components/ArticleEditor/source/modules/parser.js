module.exports = {
    build: function (html) {
        this.$layout = this.dom('<div>');
        this.$layout.html(html);
        this.$layout.find('[data-' + this.prefix + '-type]').each(this._build.bind(this));
        return this.$layout;
    },
    buildElement: function ($el) {
        $el.find('[data-' + this.prefix + '-type]').each(this._build.bind(this));
    },
    buildPredefinedClasses: function ($el) {
        if (!this.opts.classes) return;
        $el = $el || this.app.editor.getLayout();
        var content = this.app.content;
        var findTags = true;
        var findBlocks = false;
        if (typeof this.opts.classes['blocks'] !== 'undefined') {
            findBlocks = true;
            if (typeof this.opts.classes['tags'] === 'undefined') {
                findTags = false;
            }
        }
        if (findTags) $el.find(content.getPredefinedTags().join(',')).each(content.addPredefinedTagClass.bind(this));
        if (findBlocks) {
            var types = content.getPredefinedBlocks();
            var datatype = 'data-' + this.prefix + '-type';
            var selector = '[' + datatype + '=' + types.join('],[' + datatype + '=') + ']';
            $el.find(selector).each(content.addPredefinedBlockClass.bind(this));
        }
    },
    parse: function (html, build, start) {
        html = html.trim();
        html = this.app.broadcastHtml('editor.before.parse', html);
        if (this.app.content.isEmptyHtml(html)) {
            html = this.app.block.createHtml();
        } else {
            html = this._clean(html, start);
            html = this._parse(html);
        }
        html = this.app.broadcastHtml('editor.parse', html);
        return build !== false ? this.build(html) : html;
    },
    parseLine: function (html, build) {
        if (html === ' ') {
            html = '&nbsp;';
        } else {
            html = this.app.broadcastHtml('editor.before.parse', html);
            html = html.replace(/\r?\n/g, '<br>');
            html = this.app.content.encodeCode(html);
            html = this.app.content.sanitize(html);
            html = this.app.content.removeEmptySpans(html);
            html = this.app.content.addHttps(html);
            html = this.app.broadcastHtml('editor.parse', html);
        }
        return build !== false ? this.build(html) : html;
    },
    unparse: function (html, state) {
        var stored = {};
        var storedIndex = 0;
        html = html.trim();
        html = this.app.broadcastHtml('editor.before.unparse', html);
        if (this.app.content.isEmptyHtml(html)) {
            return '';
        }
        html = this._revertForms(html);
        html = this._revertFrames(html);
        html = this.app.content.store(html, 'noneditable', stored, storedIndex);
        html = this.app.content.store(html, 'embed', stored, storedIndex);
        html = this.app.content.addNofollow(html);
        html = this.app.content.removeMarkers(html);
        html = this.app.content.recacheStyle(html);
        html = this.app.content.restore(html, 'noneditable', stored);
        html = this.app.content.restore(html, 'embed', stored);
        html = this.app.content.removeEmptyAttrs(html, ['style', 'class', 'rel', 'alt', 'title']);
        html = this._unparseAllTags(html);
        html = this._unparseDataType(html, state);
        html = this.app.content.removeEmptyAttrs(html, ['style', 'class', 'rel', 'alt', 'title']);
        if (this.opts.classes) {
            html = this.app.utils.wrap(html, this.buildPredefinedClasses.bind(this));
        }
        if (html === '<p></p>') {
            html = '';
        }
        return this.app.broadcastHtml('editor.unparse', html);
    },
    _build: function ($node) {
        var type = $node.attr('data-' + this.prefix + '-type');
        this.app.create('block.' + type, $node);
    },
    _clean: function (html, start) {
        var stored = {};
        var storedIndex = 0;
        var storedComments = [];
        html = this.app.content.storeComments(html, storedComments);
        html = html.replace(/¤t/gi, '&current');
        if (start && this.app.editor.isTextarea()) {
            html = this.app.content.encodeCode(html);
        }
        html = this.app.content.sanitize(html);
        html = this._convertFrames(html);
        html = this._convertForms(html);
        html = this.app.content.store(html, 'noneditable', stored, storedIndex);
        html = this.app.content.store(html, 'embed', stored, storedIndex);
        html = this.app.content.removeTags(html, this.opts.tags.denied);
        html = this.app.content.removeDoctype(html);
        html = this.app.content.removeTagsWithContent(html, ['script', 'style']);
        if (this.opts.clean.comments) {
            html = this.app.content.removeComments(html);
        }
        html = this.app.content.removeEmptySpans(html);
        html = this.app.content.addHttps(html);
        html = this.app.content.removeBlockTagsInside(html, ['th', 'td', 'li', 'dt', 'dd', 'address']);
        html = this.app.content.cacheStyle(html);
        html = this.app.content.restore(html, 'noneditable', stored);
        html = this.app.content.restore(html, 'embed', stored);
        html = this.app.content.restoreComments(html, storedComments);
        if (this.app.content.isEmptyHtml(html)) {
            html = this.app.block.createHtml();
        } else {
            html = this.app.content.paragraphize(html);
        }
        return html;
    },
    _parse: function (html) {
        return this.app.utils.wrap(
            html,
            function ($w) {
                var nodes = this.app.element.getBlocks($w);
                for (var i = 0; i < nodes.length; i++) {
                    this._parseHtml(nodes[i]);
                }
                this.buildPredefinedClasses($w);
            }.bind(this)
        );
    },
    _parseHtml: function (el) {
        var tag = el.tagName.toLowerCase();
        var $el = this.dom(el);
        var type;
        var parser = this.opts.parserTags;
        if (parser[tag]) {
            for (var i = 0; i < parser[tag].length; i++) {
                type = parser[tag][i].call(this.app, $el);
                if (type) break;
            }
        }
        if (!type) {
            type = this._parseType($el, tag);
        }
        if (type) {
            $el.attr('data-' + this.prefix + '-type', type);
            if (type === 'image') {
                if (tag !== this.opts.image.tag) {
                    $el = this.app.element.replaceToTag($el, this.opts.image.tag, true);
                }
            }
            if (this.opts.nested.indexOf(type) !== -1) {
                this._parseNested($el);
            }
        }
    },
    _parseType: function ($el, tag) {
        var type;
        if ($el.attr('data-' + this.prefix + '-type')) {
            type = $el.attr('data-' + this.prefix + '-type');
        } else if (this._isNoneditable($el)) {
            type = 'noneditable';
        } else {
            type = this._parseTypeByTag($el, tag);
        }
        return type;
    },
    _parseNested: function ($el) {
        var nodes = this.app.element.getBlocks($el);
        for (var i = 0; i < nodes.length; i++) {
            this._parseHtml(nodes[i]);
        }
    },
    _parseTypeByTag: function ($el, tag) {
        var type;
        switch (tag) {
            case 'p':
                type = 'paragraph';
                if (this._isImageBlock($el, 'p')) {
                    type = 'image';
                }
                break;
            case 'figure':
                type = 'embed';
                if (this._isImageBlock($el, 'figure')) {
                    type = 'image';
                } else if (this._hasChild($el, 'pre')) {
                    type = 'code';
                } else if (this._hasChild($el, 'blockquote')) {
                    type = 'quote';
                }
                break;
            case 'div':
                type = 'layer';
                if ($el.attr('data-' + this.prefix + '-type')) {
                    type = false;
                } else if (this._isGridBlock($el)) {
                    type = 'grid';
                } else if (this._isColumnBlock($el)) {
                    type = 'column';
                } else if (this._isTextBlock($el)) {
                    type = 'text';
                } else if (this._isCardBlock($el)) {
                    type = 'card';
                } else if (this._isImageBlock($el, 'div')) {
                    type = 'image';
                }
                break;
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
                type = 'heading';
                break;
            case 'blockquote':
                type = 'quote';
                break;
            case 'table':
                type = 'table';
                break;
            case 'pre':
                type = 'code';
                break;
            case 'hr':
                type = 'line';
                break;
            case 'dl':
                type = 'dlist';
                break;
            case 'address':
                type = 'address';
                break;
            case 'ul':
            case 'ol':
                type = 'list';
                break;
            case 'main':
            case 'section':
            case 'header':
            case 'footer':
            case 'aside':
            case 'article':
                type = 'layer';
                break;
            default:
                break;
        }
        return type;
    },
    _isNoneditable: function ($el) {
        return $el.hasClass(this.opts.noneditable.classname);
    },
    _isColumnBlock: function ($el) {
        if (!this.opts.grid) return;
        var $parent = $el.parent();
        if ($parent.length !== 0 && $parent.attr('data-' + this.prefix + '-type') === 'grid') {
            return true;
        }
    },
    _isGridBlock: function ($el) {
        if (!this.opts.grid) return;
        return $el.hasClass(this.opts.grid.classname);
    },
    _isTextBlock: function ($el) {
        return this.opts.text && $el.hasClass(this.opts.text.classname);
    },
    _isCardBlock: function ($el) {
        return this.opts.card && $el.hasClass(this.opts.card.classname);
    },
    _isImageBlock: function ($el, tag) {
        var $img = $el.find('img');
        if ($img.length === 0) return;
        if (tag === 'div' && $img.closest('figure').length !== 0) return;
        var $target = $img;
        var $parent = $img.parent();
        var parentTag = $parent.length !== 0 ? $parent.get().tagName : false;
        if (parentTag && (parentTag === 'A' || parentTag === 'SPAN')) {
            $target = $parent;
        } else if (parentTag && $parent.get() !== $el.get()) {
            return;
        }
        if ($target.prevElement().length !== 0) return;
        if (tag !== 'figure' && $target.nextElement().length !== 0) return;
        return true;
    },
    _hasChild: function ($el, tag) {
        if (tag === 'pre') {
            var $pre = $el.find('pre');
            if ($pre.length !== 0) {
                return true;
            }
        } else if (tag === 'blockquote') {
            var $quote = $el.find('blockquote');
            var $script = $el.find('script');
            if ($script.length === 0 && $quote.length !== 0) {
                return true;
            }
        }
    },
    _getPredefinedTags: function () {
        var tags = [];
        for (var z in this.opts.classes) {
            tags.push(z);
        }
        return tags;
    },
    _addPredefinedClass: function ($node) {
        var tag = $node.get().tagName.toLowerCase();
        if (typeof this.opts.classes[tag] !== 'undefined') {
            $node.addClass(this.opts.classes[tag]);
        }
    },
    _unparseAllTags: function (html) {
        return this.app.utils.wrap(
            html,
            function ($w) {
                $w.find('*').removeAttr('contenteditable data-gramm_editor');
                if (!this.opts.image.states) {
                    $w.find('img').removeAttr('data-image');
                }
            }.bind(this)
        );
    },
    _unparseDataType: function (html, state) {
        return this.app.utils.wrap(
            html,
            function ($w) {
                var $elms = $w.find('[data-' + this.prefix + '-type]');
                if (state !== true) {
                    $elms.removeClass(this.prefix + '-block-state');
                }
                $elms.removeAttr('data-' + this.prefix + '-first-level data-' + this.prefix + '-parsed');
                $elms.removeClass(
                    this.prefix +
                        '-block-focus ' +
                        this.prefix +
                        '-block-multiple-focus ' +
                        this.prefix +
                        '-block-multiple-hover ' +
                        this.prefix +
                        '-editable-pause'
                );
                $elms.removeClass(this.prefix + '-empty-layer');
                $elms.each(this._unparseByType.bind(this));
                $elms.removeAttr('data-' + this.prefix + '-type');
                $w.find('figcaption')
                    .removeAttr('data-' + this.prefix + '-type data-placeholder')
                    .each(this.app.content._removeEmptyTag.bind(this));
            }.bind(this)
        );
    },
    _unparseByType: function ($node) {
        var type = $node.attr('data-' + this.prefix + '-type');
        if (this.opts.parser[type] && this.opts.parser[type].unparse) {
            this.opts.parser[type].unparse.call(this.app, $node);
        }
    },
    _convertFrames: function (html) {
        return this.app.utils.wrap(
            html,
            function ($w) {
                $w.find('iframe').each(this._convertFrame.bind(this));
            }.bind(this)
        );
    },
    _convertForms: function (html) {
        return this.app.utils.wrap(
            html,
            function ($w) {
                $w.find('form').each(this._convertForm.bind(this));
            }.bind(this)
        );
    },
    _convertFrame: function ($node) {
        if ($node.closest('figure').length === 0) {
            $node.wrap('<figure>');
            $node.parent().addClass(this.prefix + '-figure-iframe');
        }
    },
    _convertForm: function ($node) {
        var $el = this.app.element.replaceToTag($node, 'figure');
        $el.addClass(this.prefix + '-figure-form');
        $el.attr('data-' + this.prefix + '-type', 'form');
    },
    _revertFrames: function (html) {
        return this.app.utils.wrap(
            html,
            function ($w) {
                $w.find('.' + this.prefix + '-figure-iframe').each(this._revertFrame.bind(this));
            }.bind(this)
        );
    },
    _revertForms: function (html) {
        return this.app.utils.wrap(
            html,
            function ($w) {
                $w.find('.' + this.prefix + '-figure-form').each(this._revertForm.bind(this));
            }.bind(this)
        );
    },
    _revertFrame: function ($node) {
        var $figcaption = $node.find('figcaption');
        if ($figcaption.length !== 0) {
            $node.removeClass(this.prefix + '-figure-iframe');
        } else {
            $node.unwrap();
        }
    },
    _revertForm: function ($node) {
        var $el = this.app.element.replaceToTag($node, 'form');
        $el.removeClass(this.prefix + '-figure-form');
    },
};
