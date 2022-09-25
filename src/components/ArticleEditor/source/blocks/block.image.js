module.exports = {
    mixins: ['block'],
    type: 'image',
    toolbar: ['add', 'outset', 'image'],
    control: ['trash', 'duplicate'],
    create: function () {
        return this.dom('<' + this.opts.image.tag + '>');
    },
    build: function () {
        this._buildCaption();
        this._buildItems('figcaption', 'figcaption');
        this.data = {
            alt: {
                getter: 'getAlt',
                setter: 'setAlt',
            },
            width: {
                getter: 'getWidth',
                setter: 'setWidth',
            },
            link: {
                getter: 'getLinkUrl',
                setter: 'setLinkUrl',
            },
            target: {
                getter: 'getTarget',
                setter: 'setTarget',
            },
            caption: {
                getter: 'getCaption',
                setter: 'setCaption',
            },
        };
    },
    getImage: function () {
        return this.$block.find('img').eq(0);
    },
    getSrc: function () {
        var $img = this.getImage();
        return $img.attr('src');
    },
    getLink: function () {
        var $link = this.getImage().parent();
        $link = $link.get().tagName !== 'A' ? false : $link;
        return $link;
    },
    getWidth: function () {
        var $img = this.getImage();
        return $img.css('width');
    },
    getAlt: function () {
        var $img = this.getImage();
        var alt = $img.attr('alt');
        return alt ? alt : '';
    },
    getLinkUrl: function () {
        var $link = this.getLink();
        return $link ? $link.attr('href') : '';
    },
    getTarget: function () {
        var $link = this.getLink();
        return $link ? $link.attr('target') : this.opts.image.newtab;
    },
    setWidth: function (value) {
        var $img = this.getImage();
        value = value.trim();
        if (value === '') {
            $img.removeAttr('width');
        } else {
            var width = value.search(/%/) !== -1 ? value : parseInt(value);
            $img.attr('width', width);
        }
        $img.css({
            width: value,
            'max-width': value,
        });
        this.app.broadcast('image.width', {
            image: $img,
            width: value,
        });
    },
    setAlt: function (value) {
        var $img = this.getImage();
        $img.attr('alt', value);
    },
    setTarget: function (value) {
        var $link = this.getLink();
        if (!$link) return;
        if (value) $link.attr('target', '_blank');
        else $link.removeAttr('target');
    },
    setLinkUrl: function (value) {
        var $link = this.getLink();
        if ($link) {
            if (value !== '') {
                $link.attr('href', value);
            } else {
                this.removeLink();
                this.app.broadcast('image.unlink', {
                    instance: this,
                });
                return;
            }
        } else if (!$link) {
            if (value !== '') {
                var $img = this.getImage();
                $link = this.dom('<a>');
                $img.wrap($link);
                $link.attr('href', value);
            } else {
                return;
            }
        }
        this.app.broadcast('image.link', {
            instance: this,
            link: $link,
        });
    },
    setImage: function (data) {
        var $img = this.getImage();
        $img.attr('src', data.url);
        if (Object.prototype.hasOwnProperty.call(data, 'id')) $img.attr('data-image', data.id);
        if (Object.prototype.hasOwnProperty.call(data, '2x')) $img.attr('srcset', data['2x'] + ' 2x');
        $img.one('load', this.app.editor.adjustHeight.bind(this.app.editor));
    },
    removeLink: function () {
        var $link = this.getLink();
        if ($link) {
            $link.unwrap();
        }
    },
};
