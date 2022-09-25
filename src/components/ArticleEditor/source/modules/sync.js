module.exports = {
    build: function () {
        this.syncedHtml = this.app.$element.val();
    },
    trigger: function () {
        if (!this.opts.editor.sync) return;
        if (this.typingTimer) {
            clearTimeout(this.typingTimer);
        }
        this.typingTimer = setTimeout(
            function () {
                var html = this._getHtml();
                if (this.is(html)) {
                    this._sync(html);
                }
            }.bind(this),
            500
        );
    },
    invoke: function () {
        var html = this._getHtml();
        this.syncedHtml = html;
        this._sync(html);
    },
    is: function (html) {
        var sync = false;
        if (this.syncedHtml !== html) {
            this.syncedHtml = html;
            sync = true;
        }
        return sync;
    },
    _getHtml: function () {
        var html = this.app.editor.getLayout().html();
        return this.app.parser.unparse(html);
    },
    _sync: function (html) {
        var event = this.app.broadcast('editor.before.change', {
            html: html,
        });
        if (!event.isStopped()) {
            this.app.$element.val(event.get('html'));
            this.app.autosave.send();
            this.app.state.trigger();
            this.app.broadcast('editor.change', event);
        }
    },
};
