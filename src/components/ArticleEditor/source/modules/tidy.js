module.exports = {
    init: function () {},
    parse: function (code) {
        code = this.app.content.encodeAttrSings(code);
        var ownLine = ['li'];
        var contOwnLine = ['li'];
        var newLevel = [
            'p',
            'ul',
            'ol',
            'li',
            'div',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'blockquote',
            'figure',
            'figcaption',
            'table',
            'thead',
            'tbody',
            'tfoot',
            'tr',
            'td',
            'th',
            'dl',
            'dt',
            'dd',
        ];
        this.lineBefore = new RegExp('^<(/?' + ownLine.join('|/?') + '|' + contOwnLine.join('|') + ')[ >]');
        this.lineAfter = new RegExp('^<(/?' + ownLine.join('|/?') + '|/' + contOwnLine.join('|/') + ')[ >]');
        this.newLevel = new RegExp('^</?(' + newLevel.join('|') + ')[ >]');
        var i = 0,
            codeLength = code.length,
            point = 0,
            start = null,
            end = null,
            tag = '',
            out = '',
            cont = '';
        this.cleanlevel = 0;
        for (; i < codeLength; i++) {
            point = i;
            if (-1 === code.substr(i).indexOf('<')) {
                out += code.substr(i);
                return this.finish(out);
            }
            while (point < codeLength && code.charAt(point) !== '<') {
                point++;
            }
            if (i !== point) {
                cont = code.substr(i, point - i);
                if (!cont.match(/^\s{2,}$/g)) {
                    if ('\n' === out.charAt(out.length - 1)) out += this.getTabs();
                    else if ('\n' === cont.charAt(0)) {
                        out += '\n' + this.getTabs();
                        cont = cont.replace(/^\s+/, '');
                    }
                    out += cont;
                }
            }
            start = point;
            while (point < codeLength && '>' !== code.charAt(point)) {
                point++;
            }
            tag = code.substr(start, point - start);
            i = point;
            var t;
            if ('!--' === tag.substr(1, 3)) {
                if (!tag.match(/--$/)) {
                    while ('-->' !== code.substr(point, 3)) {
                        point++;
                    }
                    point += 2;
                    tag = code.substr(start, point - start);
                    i = point;
                }
                if ('\n' !== out.charAt(out.length - 1)) out += '\n';
                out += this.getTabs();
                out += tag + '>\n';
            } else if ('!' === tag[1]) {
                out = this.placeTag(tag + '>', out);
            } else if ('?' === tag[1]) {
                out += tag + '>\n';
            } else if (t === tag.match(/^<(script|style|pre)/i)) {
                t[1] = t[1].toLowerCase();
                tag = this.cleanTag(tag);
                out = this.placeTag(tag, out);
                end = String(code.substr(i + 1))
                    .toLowerCase()
                    .indexOf('</' + t[1]);
                if (end) {
                    cont = code.substr(i + 1, end);
                    i += end;
                    out += cont;
                }
            } else {
                tag = this.cleanTag(tag);
                out = this.placeTag(tag, out);
            }
        }
        return this.finish(out);
    },
    getTabs: function () {
        var s = '';
        for (var j = 0; j < this.cleanlevel; j++) {
            s += '    ';
        }
        return s;
    },
    finish: function (code) {
        code = code.replace(/\n\s*\n/g, '\n');
        code = code.replace(/^[\s\n]*/, '');
        code = code.replace(/[\s\n]*$/, '');
        code = code.replace(/<li(.*?)>[\s\n]*/gi, '<li$1>');
        code = code.replace(/<(p|h1|h2|h3|h4|h5|h6|li|td|th)(.*?)>[\s\n]*<\/\1>/gi, '<$1$2></$1>');
        code = code.replace(/[\s\n]*<\/li>/gi, '</li>');
        code = code.replace(/<script(.*?)>\n<\/script>/gi, '<script$1></script>');
        code = this.app.content.decodeAttrSings(code);
        this.cleanlevel = 0;
        return code;
    },
    cleanTag: function (tag) {
        var tagout = '';
        tag = tag.replace(/\n/g, ' ');
        tag = tag.replace(/\s{2,}/g, ' ');
        tag = tag.replace(/^\s+|\s+$/g, ' ');
        var suffix = '';
        if (tag.match(/\/$/)) {
            suffix = '/';
            tag = tag.replace(/\/+$/, '');
        }
        var m;
        while ((m = /\s*([^= ]+)(?:=((['"']).*?\3|[^ ]+))?/.exec(tag))) {
            if (m[2]) tagout += m[1].toLowerCase() + '=' + m[2];
            else if (m[1]) tagout += m[1].toLowerCase();
            tagout += ' ';
            tag = tag.substr(m[0].length);
        }
        return tagout.replace(/\s*$/, '') + suffix + '>';
    },
    placeTag: function (tag, out) {
        var nl = tag.match(this.newLevel);
        if (tag.match(this.lineBefore) || nl) {
            out = out.replace(/\s*$/, '');
            out += '\n';
        }
        if (nl && '/' === tag.charAt(1)) this.cleanlevel--;
        if ('\n' === out.charAt(out.length - 1)) out += this.getTabs();
        if (nl && '/' !== tag.charAt(1)) this.cleanlevel++;
        out += tag;
        if (tag.match(this.lineAfter) || tag.match(this.newLevel)) {
            out = out.replace(/ *$/, '');
            out += '\n';
        }
        return out;
    },
};
