module.exports = {
    init: function () {
        this.cm = false;
    },
    create: function (params) {
        if (!this.is()) return;
        var opts = typeof this.opts.codemirror === 'object' ? this.opts.codemirror : {};
        var instance = this.opts.codemirrorSrc ? this.opts.codemirrorSrc : CodeMirror;
        this.cm = instance.fromTextArea(this.dom(params.el).get(), opts);
        if (params.height) this.cm.setSize(null, params.height);
        if (params.focus) this.cm.focus();
        return this.cm;
    },
    destroy: function () {
        if (this.cm) {
            this.cm.toTextArea();
            this.cm = false;
        }
    },
    is: function () {
        return this.opts.codemirror;
    },
    val: function (html) {
        if (this.is() && this.cm) {
            html = this.cm.getValue();
        }
        return html;
    },
};
