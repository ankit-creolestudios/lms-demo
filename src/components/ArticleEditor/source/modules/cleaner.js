module.exports = {
    cleanHtml: function (html) {
        html = this.app.broadcastHtml('editor.before.clean', html);
        var stored = {};
        var storedIndex = 0;
        var exceptedTags = this.opts.paste.blockTags
            .concat(this.opts.paste.inlineTags)
            .concat(this.opts.paste.formTags);
        var isPages = this._isPages(html);
        var isMsWord = this._isHtmlMsWord(html);
        var isEditor = this._isEditor(html);
        html = this.app.content.store(html, 'embed', stored, storedIndex);
        html = this.app.content.removeDoctype(html);
        html = this.app.content.removeTags(html, this.opts.tags.denied);
        html = html.trim();
        html = this.app.content.removeComments(html);
        html = this.app.content.removeTagsWithContent(html, ['script', 'style']);
        html = isPages ? this._cleanPages(html) : html;
        html = isMsWord ? html : this._cleanGDocs(html);
        html = this._encodePhp(html);
        html = this.app.content.removeTagsExcept(html, exceptedTags);
        html = isMsWord ? this._cleanMsWord(html) : html;
        var restored = false;
        if (!isEditor && this.app.event.pasteEvent) {
            html = this.app.content.restore(html, 'embed', stored);
            restored = true;
        }
        if (!isEditor) {
            var filterClass = this.opts.paste.keepClass.length !== 0 ? this.opts.paste.keepClass.join(',') : '';
            var filterAttrs = this.opts.paste.keepAttrs.length !== 0 ? this.opts.paste.keepAttrs.join(',') : '';
            html = this.app.utils.wrap(html, function ($w) {
                var $elms = $w.find('*');
                $elms.not(filterClass).removeAttr('class');
                $elms.not(filterAttrs).each(function ($node) {
                    var node = $node.get();
                    var attrs = node.attributes;
                    for (var i = attrs.length - 1; i >= 0; i--) {
                        var name = attrs[i].name;
                        if (name === 'class' || name === 'dir' || name.search(/^data-/) !== -1) continue;
                        if (node.tagName === 'IMG' && (name === 'src' || name === 'alt')) continue;
                        if (node.tagName === 'A' && (name === 'href' || name === 'target')) continue;
                        node.removeAttribute(name);
                    }
                });
            });
        }
        if (!restored) {
            html = this.app.content.restore(html, 'embed', stored);
        }
        if (isEditor) {
            html = this.app.content.cacheStyle(html);
        } else {
            html = this.app.content.removeStyleAttr(html);
        }
        html = this.app.content.removeEmptyInlines(html);
        html = html.replace(/<figure[^>]*><\/figure>/gi, '');
        html = html.replace(/<p>&nbsp;<\/p>/gi, '<p></p>');
        html = html.replace(/<p><br\s?\/?><\/p>/gi, '<p></p>');
        html = html.replace(/^<li/gi, '<ul><li');
        html = html.replace(/<\/li>$/gi, '</li></ul>');
        if (isMsWord || isPages) {
            html = html.replace(/<p><\/p>/gi, '');
            html = html.replace(/<p>\s<\/p>/gi, '');
        }
        html = this.app.utils.wrap(
            html,
            function ($w) {
                $w.find('.Apple-converted-space').unwrap();
                $w.find('ul, ol').each(this._placeListToItem.bind(this));
                $w.find('li p').unwrap();
            }.bind(this)
        );
        return this.app.broadcastHtml('editor.clean', html);
    },
    _encodePhp: function (html) {
        html = html.replace('<?php', '&lt;?php');
        html = html.replace('<?', '&lt;?');
        html = html.replace('?>', '?&gt;');
        return html;
    },
    _isEditor: function (html) {
        return html.match(new RegExp('meta\\stype="' + this.prefix + '-editor"', 'i'));
    },
    _isHtmlMsWord: function (html) {
        return html.match(/class="?Mso|style="[^"]*\bmso-|style='[^'']*\bmso-|w:WordDocument/i);
    },
    _isPages: function (html) {
        return html.match(/name="Generator"\scontent="Cocoa\sHTML\sWriter"/i);
    },
    _placeListToItem: function ($node) {
        var node = $node.get();
        var prev = node.previousSibling;
        if (prev && prev.tagName === 'LI') {
            var $li = this.dom(prev);
            $li.find('p').unwrap();
            $li.append(node);
        }
    },
    _cleanPages: function (html) {
        html = html.replace(/\sclass="s[0-9]"/gi, '');
        html = html.replace(/\sclass="p[0-9]"/gi, '');
        return html;
    },
    _cleanGDocs: function (html) {
        html = html.replace(/<b\sid="internal-source-marker(.*?)">([\w\W]*?)<\/b>/gi, '$2');
        html = html.replace(/<b(.*?)id="docs-internal-guid(.*?)">([\w\W]*?)<\/b>/gi, '$3');
        html = html.replace(
            /<span[^>]*(font-style:\s?italic;\s?font-weight:\s?(bold|600|700)|font-weight:\s?(bold|600|700);\s?font-style:\s?italic)[^>]*>([\w\W]*?)<\/span>/gi,
            '<b><i>$4</i></b>'
        );
        html = html.replace(/<span[^>]*font-style:\s?italic[^>]*>([\w\W]*?)<\/span>/gi, '<i>$1</i>');
        html = html.replace(/<span[^>]*font-weight:\s?(bold|600|700)[^>]*>([\w\W]*?)<\/span>/gi, '<b>$2</b>');
        return html;
    },
    _cleanMsWord: function (html) {
        html = html.replace(/<!--[\s\S]+?-->/gi, '');
        html = html.trim();
        html = html.replace(
            /<(!|script[^>]*>.*?<\/script(?=[>\s])|\/?(\?xml(:\w+)?|meta|link|style|\w:\w+)(?=[\s/>]))[^>]*>/gi,
            ''
        );
        html = html.replace(/<(\/?)s>/gi, '<$1strike>');
        html = html.replace(/&nbsp;/gi, ' ');
        html = html.replace(
            /<span\s+style\s*=\s*"\s*mso-spacerun\s*:\s*yes\s*;?\s*"\s*>([\s\u00a0]*)<\/span>/gi,
            function (str, spaces) {
                return spaces.length > 0
                    ? spaces
                          .replace(/./, ' ')
                          .slice(Math.floor(spaces.length / 2))
                          .split('')
                          .join('\u00a0')
                    : '';
            }
        );
        html = this.app.utils.wrap(
            html,
            function ($w) {
                $w.find('p').each(function ($node) {
                    var matches = /mso-list:\w+ \w+([0-9]+)/.exec($node.attr('style'));
                    if (matches) {
                        $node.attr('data-listLevel', parseInt(matches[1], 10));
                    }
                });
                this._parseWordLists($w);
                $w.find('[align]').removeAttr('align');
                $w.find('[name]').removeAttr('name');
                $w.find('span').each(function ($node) {
                    var str = $node.attr('style');
                    var matches = /mso-list:Ignore/.exec(str);
                    if (matches) $node.remove();
                    else $node.unwrap();
                });
                $w.find('[style]').removeAttr('style');
                $w.find("[class^='Mso']").removeAttr('class');
                $w.find('a')
                    .filter(function ($node) {
                        return !$node.attr('href');
                    })
                    .unwrap();
            }.bind(this)
        );
        html = html.replace(/<p><img(.*?)>/gi, '<p><img$1></p><p>');
        html = html.replace(/<p[^>]*><\/p>/gi, '');
        html = html.replace(/<li>·/gi, '<li>');
        html = html.trim();
        html = html.replace(
            /\/(p|ul|ol|h1|h2|h3|h4|h5|h6|blockquote)>\s+<(p|ul|ol|h1|h2|h3|h4|h5|h6|blockquote)/gi,
            '/$1>\n<$2'
        );
        var result = '';
        var lines = html.split(/\n/);
        for (var i = 0; i < lines.length; i++) {
            var space = lines[i] !== '' && lines[i].search(/>$/) === -1 ? ' ' : '\n';
            result += lines[i] + space;
        }
        result = result.trim();
        return result;
    },
    _parseWordLists: function ($w) {
        var lastLevel = 0;
        var $item = null;
        var $list = null;
        var $listChild = null;
        $w.find('p').each(
            function ($node) {
                var level = $node.attr('data-listLevel');
                if (level === null && $node.hasClass('MsoListParagraphCxSpMiddle')) {
                    level = 1;
                }
                if (level !== null) {
                    var txt = $node.text();
                    var listTag = /^\s*\w+\./.test(txt) ? '<ol></ol>' : '<ul></ul>';
                    if ($node.hasClass('MsoListParagraphCxSpFirst') || $node.hasClass('MsoNormal')) {
                        $list = this.dom(listTag);
                        $node.before($list);
                    } else if (level > lastLevel && lastLevel !== 0) {
                        $listChild = this.dom(listTag);
                        $item.append($listChild);
                        $list = $listChild;
                    }
                    if (level < lastLevel) {
                        var len = lastLevel - level + 1;
                        for (var i = 0; i < len; i++) {
                            $list = $list.parent();
                        }
                    }
                    $node.find('span').first().unwrap();
                    $item = this.dom('<li>' + $node.html().trim() + '</li>');
                    if ($list === null) {
                        $node.before(listTag);
                        $list = $node.prev();
                    }
                    $list.append($item);
                    $node.remove();
                    lastLevel = level;
                } else {
                    $list = null;
                    lastLevel = 0;
                }
            }.bind(this)
        );
    },
};
