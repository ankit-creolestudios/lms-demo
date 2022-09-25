module.exports = {
    init: function () {
        this._selectors = {
            code: ['pre', 'code'],
            embed: ['figure'],
            noneditable: ['.' + this.opts.noneditable.classname],
            images: ['img'],
            links: ['a'],
        };
    },
    paragraphize: function (html) {
        return this.app.paragraphizer.paragraphize(html);
    },
    encodeEntities: function (str) {
        return this.decodeEntities(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    },
    encodeCode: function (html) {
        html = this.encodeAttrSings(html);
        html = html.replace(/<\s/gi, '&lt; ');
        html = html.replace(/<([^>]+)</gi, '&lt;$1<');
        html = html.replace(/<(.*?)>/gi, 'xtagstartz$1xtagendz');
        html = html.replace(/xtagstartzpre(.*?)xtagendz/g, '<pre$1>');
        html = html.replace(/xtagstartzcode(.*?)xtagendz/g, '<code$1>');
        html = html.replace(/xtagstartz\/codextagendz/g, '</code>');
        html = html.replace(/xtagstartz\/prextagendz/g, '</pre>');
        html = this._encodeCode(html);
        html = html.replace(/xtagstartz([\w\W]*?)xtagendz/g, '<$1>');
        html = html.replace(/xtagstartz\/(.*?)xtagendz/g, '</$1>');
        html = this.decodeAttrSings(html);
        return html;
    },
    encodeAttrSings: function (html) {
        var matches = html.match(/="(.*?)"/g);
        if (matches !== null) {
            for (var i = 0; i < matches.length; i++) {
                if (matches[i].search(/^"</) !== -1 || matches[i].search(/>"$/) !== -1) {
                    continue;
                }
                var str = matches[i].replace('>', 'xmoresignz');
                str = str.replace('<', 'xlesssignz');
                html = html.replace(matches[i], str);
            }
        }
        return html;
    },
    decodeAttrSings: function (html) {
        html = html.replace(/xmoresignz/gi, '>');
        html = html.replace(/xlesssignz/gi, '<');
        return html;
    },
    decodeEntities: function (str) {
        return String(str)
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&');
    },
    decodeHref: function (html) {
        var pattern = '(href=".*?)(&amp;)(.*?">)';
        var matches = html.match(new RegExp(pattern, 'g'));
        if (matches !== null) {
            for (var i = 0; i < matches.length; i++) {
                html = html.replace(matches[i], matches[i].replace(/&amp;/g, '&'));
            }
        }
        return html;
    },
    sanitize: function (html) {
        html = this.app.utils.wrap(
            html,
            function ($w) {
                $w.find('[src]').each(this._sanitizeSrc);
                $w.find('a').each(this._sanitizeHref);
                $w.find('a,b,i,strong,em,svg,img,details,audio').each(this._sanitizeEvents);
            }.bind(this)
        );
        return html;
    },
    escapeHtml: function (str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },
    store: function (html, name, stored, storedIndex) {
        var selectors = this._selectors[name];
        for (var i = 0; i < selectors.length; i++) {
            var matched = this._getElementsFromHtml(html, selectors[i]);
            html = this._store(html, name, matched, stored, storedIndex);
        }
        return html;
    },
    restore: function (html, name, stored) {
        if (typeof stored[name] === 'undefined') return html;
        for (var i = 0; i < stored[name].length; i++) {
            html = html.replace('####_' + name + i + '_####', stored[name][i]);
        }
        return html;
    },
    storeComments: function (html, storedComments) {
        var comments = html.match(new RegExp('<!--([\\w\\W]*?)-->', 'gi'));
        if (comments === null) return html;
        for (var i = 0; i < comments.length; i++) {
            html = html.replace(comments[i], '#####xstarthtmlcommentzz' + i + 'xendhtmlcommentzz#####');
            storedComments.push(comments[i]);
        }
        return html;
    },
    restoreComments: function (html, storedComments) {
        for (var i = 0; i < storedComments.length; i++) {
            var str = storedComments[i].replace(/\$/gi, '&#36;');
            html = html.replace('#####xstarthtmlcommentzz' + i + 'xendhtmlcommentzz#####', str);
        }
        return html;
    },
    cacheStyle: function (html) {
        var selector = this.opts.tags.block.join(',') + ',img,' + this.opts.tags.inline.join(',');
        return this.app.utils.wrap(
            html,
            function ($w) {
                $w.find(selector).each(this._cacheStyle.bind(this));
            }.bind(this)
        );
    },
    recacheStyle: function (html) {
        return this.app.utils.wrap(
            html,
            function ($w) {
                $w.find('[data-' + this.prefix + '-style-cache]').each(this._recacheStyle.bind(this));
            }.bind(this)
        );
    },
    fixListMargin: function ($block) {
        var ml = parseInt($block.css('margin-left'));
        if (ml !== 0) {
            var pl = parseInt($block.css('padding-left'));
            $block.css({
                'margin-left': 0,
                'padding-left': pl + ml + 'px',
            });
            $block.attr(this.prefix + '-list-left', ml);
        }
    },
    unfixListMargin: function ($block) {
        if ($block.attr(this.prefix + '-list-left')) {
            $block.css({
                'padding-left': '',
                'margin-left': '',
            });
            $block.removeAttr(this.prefix + '-list-left');
        }
    },
    addNofollow: function (html) {
        if (!this.opts.link.nofollow) return html;
        return this.app.utils.wrap(html, function ($w) {
            $w.find('a').attr('rel', 'nofollow');
        });
    },
    addHttps: function (html) {
        if (!this.opts.editor.https) {
            return html;
        }
        html = html.replace('href="http://', 'href="https://');
        html = html.replace('src="http://', 'src="https://');
        html = html.replace('srcset="http://', 'srcset="https://');
        return html;
    },
    addSpaceToBlocks: function (html) {
        return html.replace(/<\/(div|li|dt|dd|td|p|H[1-6])>\n?/gi, '</$1> ');
    },
    addBrToBlocks: function (html) {
        return html.replace(/<\/(div|li|dt|dd|td|p|H[1-6])>\n?/gi, '</$1><br>');
    },
    addPredefinedTagClass: function ($node) {
        var tag = $node.get().tagName.toLowerCase();
        var classes = typeof this.opts.classes.tags !== 'undefined' ? this.opts.classes.tags : this.opts.classes;
        if (typeof classes[tag] !== 'undefined') {
            $node.addClass(classes[tag]);
        }
    },
    addPredefinedBlockClass: function ($node) {
        var type = $node.attr('data-' + this.prefix + '-type');
        var classes = this.opts.classes.blocks;
        if (typeof classes[type] !== 'undefined') {
            $node.addClass(classes[type]);
        }
    },
    getPredefinedBlocks: function () {
        var blocks = [];
        for (var z in this.opts.classes.blocks) {
            blocks.push(z);
        }
        return blocks;
    },
    getPredefinedTags: function () {
        var tags = [];
        var classes = typeof this.opts.classes.tags !== 'undefined' ? this.opts.classes.tags : this.opts.classes;
        for (var z in classes) {
            tags.push(z);
        }
        return tags;
    },
    getText: function (n) {
        var rv = '';
        if (n.nodeType === 3) {
            rv = n.nodeValue;
        } else {
            for (var i = 0; i < n.childNodes.length; i++) {
                rv += this.getText(n.childNodes[i]);
            }
            var d = n.nodeType === 1 ? getComputedStyle(n).getPropertyValue('display') : '';
            if (d.match(/^block/) || d.match(/list/) || n.tagName === 'BR' || n.tagName === 'HR') {
                rv += '\n';
            }
        }
        return rv;
    },
    getTextFromHtml: function (html, params) {
        var stored = {};
        var storedIndex = 0;
        var defaults = {
            br: false,
            nl: false,
            trimlines: true,
            images: false,
            links: false,
        };
        params = globalThis.$ARX.extend({}, defaults, params);
        html = this.store(html, 'code', stored, storedIndex);
        html = params.links ? this.store(html, 'links', stored, storedIndex) : html;
        html = params.images ? this.store(html, 'images', stored, storedIndex) : html;
        html = html.replace(/<(ul|ol)>\s+<li>/gi, '<$1><li>');
        html = html.replace(/<li[^>]*>\n/gi, '<li$1>');
        html = html.replace(/<p[^>]*>(\s+|)<\/p>/gi, 'xemptyz');
        html = html.replace(/<!--[\s\S]*?-->/gi, '');
        html = html.replace(/<style[\s\S]*?style>/gi, '');
        html = html.replace(/<script[\s\S]*?script>/gi, '');
        html = html.replace(/<\/(div|li|dt|dd|td|p|H[1-6])>\n?/gi, '</$1>\n');
        html = html.replace(/&(lt|gt);/gi, 'x$1z');
        var $tmp = this.dom('<div>').html(html);
        html = this.getText($tmp.get());
        if (params.trimlines) {
            var str = '';
            var arr = html.split('\n');
            for (var i = 0; i < arr.length; i++) {
                str += arr[i].trim() + '\n';
            }
            html = str;
        }
        html = html.replace(/[\n]+/g, '\n');
        html = html.replace('xemptyz', '\n');
        html = html.replace(/x(lt|gt)z/gi, '&$1;');
        if (params.br) {
            html = html.replace(/\n/g, '<br>\n');
            html = html.replace(/<br\s?\/?>\n?$/gi, '');
        } else {
            html = params.nl ? html : html.replace(/\n/gi, ' ');
        }
        html = this.restore(html, 'code', stored);
        html = params.links ? this.restore(html, 'links', stored) : html;
        html = params.images ? this.restore(html, 'images', stored) : html;
        html = html.replace(/<pre[^>]*>/g, '');
        html = html.replace(/<code[^>]*>/g, '');
        html = html.replace(/<\/pre>\n?/g, '');
        html = html.replace(/<\/code>/g, '');
        if (!params.images) {
            html = html.replace(/<img[\s\S]*?>/gi, '');
            html = html.replace(/<a[^>]*>(\s+|)<\/a>/gi, '');
        }
        return html.trim();
    },
    extractHtmlFromCaret: function (el) {
        var node = this.dom(el).get();
        var range = this.app.selection.getRange();
        if (range) {
            var cloned = range.cloneRange();
            cloned.selectNodeContents(node);
            cloned.setStart(range.endContainer, range.endOffset);
            return cloned.extractContents();
        }
    },
    isEmptyHtml: function (html, emptyparagraph) {
        html = html.trim();
        html = this.app.utils.removeInvisibleChars(html);
        html = html.replace(/^&nbsp;$/gi, '1');
        html = html.replace(/&nbsp;/gi, '');
        html = html.replace(/<\/?br\s?\/?>/g, '');
        html = html.replace(/\s/g, '');
        html = html.replace(/^<p>\s\S<\/p>$/i, '');
        html = html.replace(/<hr(.*?[^>])>$/i, 'hr');
        html = html.replace(/<iframe(.*?[^>])>$/i, 'iframe');
        html = html.replace(/<source(.*?[^>])>$/i, 'source');
        html = this.removeComments(html);
        html = emptyparagraph ? html.replace(/<p[^>]*><\/p>/gi, '') : html;
        html = html.replace(/<[^/>]><\/[^>]+>/gi, '');
        html = html.replace(/<[^/>]><\/[^>]+>/gi, '');
        html = html.trim();
        return html === '';
    },
    isLine: function (html) {
        var element = document.createElement('div');
        element.innerHTML = html;
        return this.dom(element).find(this.opts.tags.block.join(',') + ',img').length === 0;
    },
    removeDoctype: function (html) {
        return html.replace(new RegExp('<!doctype[^>]*>', 'gi'), '');
    },
    removeComments: function (html) {
        return html.replace(/<!--[\s\S]*?-->\n?/g, '');
    },
    removeTags: function (input, denied) {
        var re = denied ? /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi : /(<([^>]+)>)/gi;
        var replacer = !denied
            ? ''
            : function ($0, $1) {
                  return denied.indexOf($1.toLowerCase()) === -1 ? $0 : '';
              };
        return input.replace(re, replacer);
    },
    removeTagsExcept: function (input, except) {
        if (except === undefined) {
            return input.replace(/(<([^>]+)>)/gi, '');
        }
        var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
        return input.replace(tags, function ($0, $1) {
            return except.indexOf($1.toLowerCase()) === -1 ? '' : $0;
        });
    },
    removeTagsWithContent: function (html, tags) {
        return this.app.utils.wrap(html, function ($w) {
            $w.find(tags.join(',')).remove();
        });
    },
    removeMarkers: function (html) {
        return this.app.utils.wrap(
            html,
            function ($w) {
                $w.find('.' + this.prefix + '-plus-button').remove();
                $w.find('.' + this.prefix + 'pastemarker').removeClass(this.prefix + 'pastemarker');
                $w.find('.' + this.prefix + 'pasteitems').removeClass(this.prefix + 'pasteitems');
                $w.find('.' + this.prefix + '-selection-marker').remove();
            }.bind(this)
        );
    },
    removeEmptySpans: function (html) {
        return this.app.utils.wrap(
            html,
            function ($w) {
                $w.find('span').each(this._removeEmptySpan.bind(this));
            }.bind(this)
        );
    },
    removeEmptyInlines: function (html) {
        return this.app.utils.wrap(
            html,
            function ($w) {
                $w.find(this.opts.tags.inline.join(',')).each(this._removeEmptyTag.bind(this));
            }.bind(this)
        );
    },
    removeEmptyAttrs: function (html, attrs) {
        return this.app.utils.wrap(html, function ($w) {
            for (var i = 0; i < attrs.length; i++) {
                $w.find('[' + attrs[i] + '=""]').removeAttr(attrs[i]);
            }
        });
    },
    removeBlockTags: function (html, tags, except) {
        var blocks = this.opts.tags.block.concat();
        if (except) {
            blocks = this.app.utils.removeFromArrayByValue(blocks, except);
        }
        if (tags) {
            tags = tags ? this.app.utils.extendArray(blocks, tags) : blocks;
        }
        return this.removeTags(html, tags);
    },
    removeBlockTagsInside: function (html, tags) {
        this.blockListTags = this.app.utils.removeFromArrayByValue(this.opts.tags.block.concat(), ['ul', 'ol', 'li']);
        return this.app.utils.wrap(
            html,
            function ($w) {
                $w.find(tags.join(',')).each(this._removeBlockTagsInside.bind(this));
            }.bind(this)
        );
    },
    removeInlineStyles: function (html) {
        var inlines = this.app.utils.removeFromArrayByValue(this.opts.tags.inline, 'a');
        return this.app.utils.wrap(html, function ($w) {
            $w.find(inlines.join(',')).removeAttr('style');
        });
    },
    removeStyleAttr: function (html, filter) {
        filter = filter || '';
        return this.app.utils.wrap(
            html,
            function ($w) {
                $w.find('*')
                    .not('[data-' + this.prefix + '-style-cache]' + filter)
                    .removeAttr('style');
            }.bind(this)
        );
    },
    _cacheStyle: function ($el) {
        var name = 'data-' + this.prefix + '-style-cache';
        var style = $el.attr('style');
        if (style) {
            style = style.replace(/"/g, '');
            $el.attr(name, style);
        } else if (!style || style === '') {
            $el.removeAttr(name);
        }
    },
    _recacheStyle: function ($el) {
        var name = 'data-' + this.prefix + '-style-cache';
        var style = $el.attr(name);
        $el.attr('style', style).removeAttr(name);
    },
    _cleanEmpty: function (html) {
        html = html.trim();
        html = this.app.utils.removeInvisibleChars(html);
        html = html.replace(/<\/?br\s?\/?>/g, '');
        html = html.replace(/\s/g, '');
        return html;
    },
    _removeEmptySpan: function ($node) {
        if ($node.get().attributes.length === 0) {
            $node.unwrap();
        }
    },
    _removeEmptyTag: function ($node) {
        var html = $node.html().trim();
        if ($node.get().attributes.length === 0 && html === '') {
            $node.unwrap();
        }
    },
    _removeBlockTagsInside: function ($node) {
        var tags = $node.get().tagName === 'LI' ? this.blockListTags : this.opts.tags.block;
        $node.find(tags.join(',')).append('<br>').unwrap();
    },
    _store: function (html, name, matched, stored, storedIndex) {
        if (!matched) return html;
        if (typeof stored[name] === 'undefined') stored[name] = [];
        for (var i = 0; i < matched.length; i++) {
            stored[name][storedIndex] = matched[i];
            html = html.replace(matched[i], '####_' + name + storedIndex + '_####');
            storedIndex++;
        }
        return html;
    },
    _getElementsFromHtml: function (html, selector) {
        var matched = [];
        var $div = this.dom('<div>').html(html);
        $div.find(selector).each(function ($node) {
            matched.push($node.get().outerHTML);
        });
        return matched;
    },
    _sanitizeSrc: function ($node) {
        var node = $node.get();
        var src = node.getAttribute('src');
        if (src.search(/^javascript:/i) !== -1 || (node.tagName !== 'IMG' && src.search(/^data:/i) !== -1)) {
            node.setAttribute('src', '');
        }
    },
    _sanitizeHref: function ($node) {
        var node = $node.get();
        var str = node.getAttribute('href');
        if (str && str.search(/^javascript:/i) !== -1) {
            node.setAttribute('href', '');
        }
    },
    _sanitizeEvents: function ($node) {
        $node.removeAttr('onload onerror ontoggle onwheel onmouseover oncopy');
    },
    _encodeCode: function (html) {
        return this.app.utils.wrap(
            html,
            function ($w) {
                $w.find('pre code, pre, code').each(this._encodeNode.bind(this));
            }.bind(this)
        );
    },
    _encodeNode: function ($node) {
        var node = $node.get();
        var first = node.firstChild;
        var html = node.innerHTML;
        if (node.tagName === 'PRE' && first && first.tagName === 'CODE') {
            return;
        }
        html = html.replace(/xtagstartz/g, '<');
        html = html.replace(/xtagendz/g, '>');
        var encoded = this.decodeEntities(html);
        node.textContent = this._encodeNodeHtml(encoded);
    },
    _encodeNodeHtml: function (html) {
        html = html.replace(/&nbsp;/g, ' ').replace(/<br\s?\/?>/g, '\n');
        html = this.opts.code.spaces ? html.replace(/\t/g, new Array(this.opts.code.spaces + 1).join(' ')) : html;
        return html;
    },
};
