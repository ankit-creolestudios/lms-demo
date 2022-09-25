module.exports = {
    init: function () {
        this.remStart = '#####replace';
        this.remEnd = '#####';
        var extendTags = [
            'form',
            'audio',
            'figcaption',
            'object',
            'style',
            'script',
            'iframe',
            'select',
            'input',
            'textarea',
            'button',
            'option',
            'map',
            'area',
            'math',
            'fieldset',
            'legend',
            'hgroup',
            'nav',
            'details',
            'menu',
            'summary',
        ];
        this.tags = this.opts.tags.parser.concat(extendTags);
    },
    paragraphize: function (html) {
        var tag = 'p';
        var stored = [];
        var storedComments = [];
        html = this._storeTags(html, stored);
        html = this.app.content.storeComments(html, storedComments);
        html = html.trim();
        html = this._trimLinks(html);
        html = html.replace(/xparagraphmarkerz(?:\r\n|\r|\n)$/g, '');
        html = html.replace(/xparagraphmarkerz$/g, '');
        html = html.replace(/xparagraphmarkerz(?:\r\n|\r|\n)/g, '\n');
        html = html.replace(/xparagraphmarkerz/g, '\n');
        html = html.replace(/[\n]+/g, '\n');
        var str = '';
        var arr = html.split('\n');
        for (var i = 0; i < arr.length; i++) {
            str += '<' + tag + '>' + arr[i].trim() + '</' + tag + '>\n';
        }
        html = str.replace(/\n$/, '');
        html = html.replace(new RegExp('<' + tag + '>\\s+#####', 'gi'), '#####');
        html = html.replace(new RegExp('<' + tag + '>#####', 'gi'), '#####');
        html = html.replace(new RegExp('#####</' + tag + '>', 'gi'), '#####');
        html = this._restoreTags(html, stored);
        html = this.app.content.restoreComments(html, storedComments);
        html = html.replace(/<(p|h1|h2|h3|h4|h5|h6|li|td|th)(.*?)>[\s\n]*<\/\1>/gi, '<$1$2></$1>');
        html = html.replace(/<p(.*?)><\/?br\s?\/?><\/p>/gi, '<p$1></p>');
        html = html.replace(/<div(.*?)><\/?br\s?\/?><\/div>/gi, '<div$1></div>');
        html = html.replace(/<\/?br\s?\/?><\/div>/gi, '</div>');
        html = html.replace(/<\/?br\s?\/?><\/li>/gi, '</li>');
        return html;
    },
    _storeTags: function (html, stored) {
        return this.app.utils.wrap(
            html,
            function ($w) {
                $w.find(this.tags.join(', ')).each(
                    function ($node, i) {
                        this._replaceTag($node, i, stored);
                    }.bind(this)
                );
            }.bind(this)
        );
    },
    _restoreTags: function (html, stored) {
        for (var i = 0; i < stored.length; i++) {
            var str = stored[i].replace(/\$/gi, '&#36;');
            html = html.replace(this.remStart + i + this.remEnd, str);
        }
        return html;
    },
    _replaceTag: function ($node, i, stored) {
        var node = $node.get();
        var replacement = document.createTextNode(this.remStart + i + this.remEnd + 'xparagraphmarkerz');
        stored.push(node.outerHTML);
        node.parentNode.replaceChild(replacement, node);
    },
    _trimLinks: function (html) {
        return this.app.utils.wrap(
            html,
            function ($w) {
                $w.find('a').each(this._trimLink.bind(this));
            }.bind(this)
        );
    },
    _trimLink: function ($node) {
        $node.html($node.html().trim());
    },
};
