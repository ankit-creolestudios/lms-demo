module.exports = {
    start: function () {
        this.placeholder = false;
        this.$layout = this.app.editor.getLayout();
        this._build();
    },
    handleClick: function (e) {
        if (this.dom(e.target).hasClass(this.prefix + '-placeholder')) {
            e.preventDefault();
            e.stopPropagation();
            this.app.editor.setFocus('start');
        }
    },
    trigger: function () {
        if (this.placeholder && this.app.editor.isEmpty(true)) {
            this.show();
        } else {
            this.hide();
        }
    },
    toggle: function () {
        if (this.observerTimer) {
            clearTimeout(this.observerTimer);
        }
        this.observerTimer = setTimeout(this.trigger.bind(this), 10);
    },
    show: function () {
        this.$layout.addClass(this.prefix + '-placeholder');
    },
    hide: function () {
        this.$layout.removeClass(this.prefix + '-placeholder');
    },
    _build: function () {
        var o = this.opts.placeholder;
        var p = this.app.$element.attr('placeholder');
        var is = o !== false || p;
        if (!is) return;
        this.$layout.attr('placeholder', o !== false ? o : p);
        this.placeholder = true;
        this.toggle();
    },
};
