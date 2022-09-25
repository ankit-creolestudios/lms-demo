module.exports = {
    popups: {
        base: {
            title: '## popup.snippets ##',
            width: '100%',
        },
    },
    init: function () {
        this.json = {};
    },
    observe: function () {
        if (!this.opts.snippets) return false;
    },
    popup: function () {
        var stack = this.app.popup.add('snippets', this.popups.base);
        var $body = stack.getBody();
        if (typeof this.opts.snippets === 'string') {
            var getdata = this.opts.editor.reloadmarker
                ? {
                      d: new Date().getTime(),
                  }
                : {};
            this.ajax.get({
                url: this.opts.snippets,
                data: getdata,
                success: function (data) {
                    this._buildPopup(data, $body);
                }.bind(this),
            });
        } else {
            this._buildPopup(this.opts.snippets, $body);
        }
        stack.open();
    },
    insert: function (e) {
        var $trigger = this.dom(e.target).closest('.' + this.prefix + '-snippet-container');
        var key = $trigger.attr('data-snippet-key');
        if (Object.prototype.hasOwnProperty.call(this.json, key)) {
            this.app.popup.close();
            var html = this.json[key].html;
            this.app.editor.insertContent({
                html: html,
                caret: 'start',
            });
        }
    },
    _buildPopup: function (data, $body) {
        this.json = data;
        if (typeof data === 'string') {
            this.json = JSON.parse(data);
        }
        for (var key in this.json) {
            var $container = this._buildPreviewContainer($body, key);
            this._buildPreview($container, key);
            this._buildPreviewName($container, key);
        }
    },
    _buildPreviewContainer: function ($body, key) {
        var $div = this.dom('<div>').addClass(this.prefix + '-snippet-container');
        $div.attr('data-snippet-key', key);
        $div.one('click', this.insert.bind(this));
        $body.append($div);
        return $div;
    },
    _buildPreview: function ($container, key) {
        var $div = this.dom('<div>');
        if (Object.prototype.hasOwnProperty.call(this.json[key], 'image')) {
            $div.addClass(this.prefix + '-snippet-image');
            var $img = this.dom('<img>').attr('src', this.json[key].image);
            $div.html($img);
        } else {
            $div.addClass(this.prefix + '-snippet-preview');
            $div.html(this.json[key].html);
        }
        $container.append($div);
    },
    _buildPreviewName: function ($container, key) {
        if (!Object.prototype.hasOwnProperty.call(this.json[key], 'name')) return;
        var $span = this.dom('<div>').addClass(this.prefix + '-snippet-name');
        $span.text(this.json[key].name);
        $container.append($span);
    },
};
