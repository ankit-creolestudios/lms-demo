module.exports = {
    init: function () {
        this.classname = this.prefix + '-tooltip';
        this.eventname = this.prefix + '-button-' + this.uuid;
    },
    stop: function () {
        this.close();
    },
    build: function ($btn, title) {
        title = this._cleanTitle(title);
        if (title) {
            $btn.attr('data-tooltip', title);
            $btn.on('mouseover.' + this.eventname, this.open.bind(this));
            $btn.on('mouseout.' + this.eventname, this.close.bind(this));
        }
    },
    open: function (e) {
        var $btn = this._getButton(e);
        if (this.app.popup.isOpen() || $btn.hasClass('disable')) {
            return;
        }
        this.$tooltip = this._create($btn);
        this._setPosition($btn);
        this._fixBSModal();
        this.app.$body.append(this.$tooltip);
    },
    close: function () {
        this.app.$body.find('.' + this.classname).remove();
    },
    _create: function ($btn) {
        return this.dom('<span>').addClass(this.classname).html($btn.attr('data-tooltip'));
    },
    _cleanTitle: function (title) {
        return title ? title.replace(/(<([^>]+)>)/gi, '') : false;
    },
    _setPosition: function ($btn) {
        var offset = $btn.offset();
        var height = $btn.height();
        this.$tooltip.css({
            top: offset.top + height + 'px',
            left: offset.left + 'px',
        });
    },
    _fixBSModal: function () {
        if (this.opts.bsmodal) {
            this.$tooltip.css('z-index', 1060);
        }
    },
    _getButton: function (e) {
        return this.dom(e.target).closest('.' + this.prefix + '-button-target');
    },
};
