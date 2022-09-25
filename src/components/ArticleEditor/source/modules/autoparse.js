module.exports = {
    parse: function (html) {
        if (!this.opts.paste.autoparse) {
            return html;
        }
        var instance = this.app.block.get();
        var storedComments = [];
        html = this.app.content.storeComments(html, storedComments);
        html = this.app.content.removeDoctype(html);
        var tags = [
            'figure',
            'html',
            'form',
            'pre',
            'div',
            'span',
            'video',
            'object',
            'iframe',
            'code',
            'a',
            'img',
            'link',
            'script',
        ];
        var singleTags = ['div', 'img', 'html', 'span'];
        var stored = [];
        var z = 0;
        for (var i = 0; i < tags.length; i++) {
            var reTags =
                singleTags.indexOf(tags[i]) !== -1
                    ? '<' + tags[i] + '[^>]*>'
                    : '<' + tags[i] + '[^>]*>([\\w\\W]*?)</' + tags[i] + '>';
            var matched = html.match(new RegExp(reTags, 'gi'));
            if (matched !== null) {
                for (var y = 0; y < matched.length; y++) {
                    html = html.replace(matched[y], '#####replaceparse' + z + '#####');
                    stored.push(matched[y]);
                    z++;
                }
            }
        }
        html = html.replace('&amp;', '&');
        if (
            (html.match(this.opts.regex.aurl1) || html.match(this.opts.regex.aurl2)) &&
            !html.match(this.opts.regex.imageurl)
        ) {
            html = this._formatLinks(html);
        }
        if (html.match(this.opts.regex.imageurl)) {
            var imagesMatches = html.match(this.opts.regex.imageurl);
            for (var i = 0; i < imagesMatches.length; i++) {
                html = html.replace(
                    imagesMatches[i],
                    this._splitBlock(instance, '<img src="' + imagesMatches[i] + '">')
                );
            }
        }
        html = this._restoreReplaced(stored, html);
        html = this.app.content.restoreComments(html, storedComments);
        html = this._restoreReplaced(stored, html);
        return html;
    },
    _splitBlock: function (instance, str) {
        return instance ? (str = '\n' + str + '\n') : str;
    },
    _formatLinks: function (content) {
        var target = this.opts.paste.linkTarget !== false ? ' target="' + this.opts.paste.linkTarget + '"' : '';
        var protocol = this.opts.editor.https ? 'https' : 'http';
        var self = this;
        content = content.replace(this.opts.regex.aurl1, function (url) {
            return '<a href="' + url + '"' + target + '>' + self._subLinkText(url) + '</a>';
        });
        content = content.replace(this.opts.regex.aurl2, function (match, before, url) {
            return before + '<a href="' + protocol + '://' + url + '"' + target + '>' + self._subLinkText(url) + '</a>';
        });
        return content;
    },
    _subLinkText: function (text) {
        text = text.length > this.opts.link.size ? text.substring(0, this.opts.link.size) + '...' : text;
        text = text.search('%') === -1 ? decodeURIComponent(text) : text;
        return text;
    },
    _restoreReplaced: function (stored, html) {
        for (var i = 0; i < stored.length; i++) {
            html = html.replace('#####replaceparse' + i + '#####', stored[i]);
        }
        return html;
    },
};
