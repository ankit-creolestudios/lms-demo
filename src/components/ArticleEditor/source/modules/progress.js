module.exports = {
    stop: function () {
        this.hide();
    },
    show: function () {
        this.hide();
        this.$progress = this.dom('<div>').addClass(this.prefix + '-editor-progress');
        this.$progress.attr('id', this.prefix + '-progress');
        this.$progressBar = this.dom('<span>');
        this.$progress.append(this.$progressBar);
        this.app.$body.append(this.$progress);
    },
    hide: function () {
        this.app.$body.find('#' + this.prefix + '-progress').remove();
    },
};
