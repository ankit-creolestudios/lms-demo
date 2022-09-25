module.exports = {
    init: function () {
        this.observer = false;
        this.trigger = true;
    },
    build: function () {
        if (window.MutationObserver) {
            var el = this.app.editor.getLayout().get();
            this.observer = this._build(el);
            this.observer.observe(el, {
                attributes: true,
                subtree: true,
                childList: true,
                characterData: true,
                characterDataOldValue: true,
            });
        }
    },
    stop: function () {
        if (this.observer) this.observer.disconnect();
        this.trigger = true;
    },
    _build: function (el) {
        var self = this;
        return new MutationObserver(function (mutations) {
            self._observe(mutations[mutations.length - 1], el);
        });
    },
    _observe: function (mutation, el) {
        if (mutation.type === 'attributes' && mutation.target === el) {
            return;
        }
        if (this.trigger) {
            this.app.editor.adjustHeight();
            this.app.broadcast('observer.change');
            this.app.placeholder.toggle();
            this.app.sync.trigger();
        }
    },
};
