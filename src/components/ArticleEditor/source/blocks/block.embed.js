module.exports = {
    mixins: ['block'],
    type: 'embed',
    parser: {
        unparse: function ($node) {
            var code = decodeURI($node.attr('data-embed-code'));
            var $responsive = $node.find('.' + this.opts.embed.responsive);
            var $el = $node.find('figcaption');
            var $figcaption;
            if ($el.length !== 0) {
                $figcaption = $el.clone();
                $el.remove();
            }
            if ($responsive.length === 0) {
                $node.html(code);
            } else {
                $responsive.html(code);
            }
            if ($figcaption) {
                $node.append($figcaption);
            }
            $node.removeAttr('data-embed-code');
        },
    },
    toolbar: ['add', 'outset', 'embed'],
    control: ['trash', 'duplicate'],
    create: function () {
        return this.dom('<figure>');
    },
    build: function () {
        this._buildCaption();
        this._buildItems('figcaption', 'figcaption');
        this._buildEmbedCode();
    },
    addResponsive: function () {
        var $responsive = this.dom('<div>').addClass(this.opts.embed.responsive);
        var $figcaption = this.$block.find('figcaption');
        var $cloneFigcaption = $figcaption.clone();
        var html = this.getEmbedCode();
        $figcaption.remove();
        $responsive.html(html);
        this.$block.html('').append($responsive);
        if ($cloneFigcaption.length !== 0) {
            this.app.create('block.figcaption', $cloneFigcaption);
            this.$block.append($cloneFigcaption);
        }
        this._buildEmbedCode();
    },
    removeResponsive: function () {
        this.$block.find(this._getEmbedClass()).unwrap();
    },
    getEmbedCode: function () {
        return decodeURI(this.$block.attr('data-embed-code'));
    },
    isResponsive: function () {
        return this.$block.find(this._getEmbedClass()).length !== 0;
    },
    _buildEmbedCode: function () {
        var $clone = this.$block.clone();
        $clone.find(this._getEmbedClass()).unwrap();
        $clone.find('figcaption').remove();
        var code = $clone.html().trim();
        this.$block.attr('data-embed-code', encodeURI(code));
    },
    _getEmbedClass: function () {
        return '.' + this.opts.embed.responsive.replace(/ +/g, '.');
    },
};
