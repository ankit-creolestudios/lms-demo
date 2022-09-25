module.exports = {
    start: function () {
        this.eventname = this.prefix + '-source-events';
        this._build();
    },
    toggle: function () {
        if (this.is()) this.close();
        else this.open();
    },
    is: function () {
        return this.app.container.get('source').css('display') !== 'none';
    },
    open: function () {
        this.app.broadcast('source.before.open');
        var html = this.app.editor.getContent();
        html = this.app.tidy.parse(html);
        var height = this.app.container.get('editor').height();
        this.$source.height(height);
        this.$source.val(html);
        this.$source.on('focus.' + this.eventname, this._handleFocus.bind(this));
        this.$source.on('input.' + this.eventname, this._handleChanges.bind(this));
        this.$source.on('keydown.' + this.eventname, this.app.input.handleTextareaTab.bind(this));
        this.app.editor.unselectAll();
        this.app.container.get('editor').hide();
        this.app.container.get('source').show();
        var codemirror = this.app.codemirror.create({
            el: this.$source,
            height: height,
            focus: true,
        });
        if (codemirror) {
            codemirror.on('change', this._handleChanges.bind(this));
            codemirror.on('focus', this._handleFocus.bind(this));
        }
        this.app.editor.disableUI();
        this.app.toolbar.setToggled('html');
        this.app.broadcast('source.open');
    },
    close: function () {
        this.app.broadcast('source.before.close');
        var html = this.getContent();
        this.app.codemirror.destroy();
        this.$source.off('.' + this.eventname);
        this.app.container.get('source').hide();
        this.app.container.get('editor').show();
        this.app.editor.setContent({
            html: html,
            caret: 'start',
        });
        this.app.editor.enableUI();
        this.app.toolbar.unsetToggled('html');
        this.app.broadcast('source.close');
    },
    update: function (html) {
        var func = this.app.editor.isTextarea() ? 'val' : 'html';
        this.app.$element[func](html);
    },
    getContent: function () {
        var html = this.$source.val();
        html = this.app.codemirror.val(html);
        return html;
    },
    _build: function () {
        if (!this.opts.source) return;
        this.$source = this.dom('<textarea>').addClass(this.prefix + '-source');
        this.$source.attr('data-gramm_editor', false);
        this.app.container.get('source').append(this.$source);
    },
    _handleFocus: function () {
        this.app.editor.setFocus();
    },
    _handleChanges: function (e) {
        var html = this.getContent();
        this.update(html);
        this.app.broadcast('source.change', {
            e: e,
        });
    },
};
