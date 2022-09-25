module.exports = {
    init: function () {
        this.scrolltop = false;
    },
    save: function () {
        this.scrolltop = this.getTarget().scrollTop();
    },
    restore: function () {
        if (this.scrolltop !== false) {
            this.getTarget().scrollTop(this.scrolltop);
            this.scrolltop = false;
        }
    },
    isTarget: function () {
        return this.opts.editor.scrollTarget !== window;
    },
    getTarget: function () {
        return this.dom(this.opts.editor.scrollTarget);
    },
};
