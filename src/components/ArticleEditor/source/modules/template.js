module.exports = {
    popups: {
        base: {
            title: '## templates.templates ##',
            width: '100%',
        },
    },
    init: function () {
        this.json = {};
    },
    observe: function () {
        if (!this.opts.templates) return false;
    },
    popup: function (params, button) {
        if (typeof this.opts.templates === 'string') {
            var getdata = this.opts.editor.reloadmarker
                ? {
                      d: new Date().getTime(),
                  }
                : {};
            this.ajax.get({
                url: this.opts.templates,
                data: getdata,
                success: function (data) {
                    this._buildPopup(button, data);
                }.bind(this),
            });
        } else {
            this._buildPopup(button, this.opts.templates);
        }
    },
    insert: function (e) {
        var $trigger = this.dom(e.target).closest('.' + this.prefix + '-template-container');
        var key = $trigger.attr('data-template-key');
        if (Object.prototype.hasOwnProperty.call(this.json, key)) {
            this.app.popup.close();
            var html = this.json[key].html;
            this.app.editor.setContent({
                html: html,
                caret: false,
            });
        }
    },
    _buildPopup: function (button, data) {
        var popup = this.app.popup.create('templates', this.popups.base);
        var $body = popup.getBody();
        this.json = typeof data === 'string' ? JSON.parse(data) : data;
        for (var key in this.json) {
            var $container = this._buildPreviewContainer($body, key);
            this._buildPreview($container, key);
            this._buildPreviewName($container, key);
        }
        this.app.popup.open({
            button: button,
        });
    },
    _buildPreviewContainer: function ($body, key) {
        var $div = this.dom('<div>').addClass(this.prefix + '-template-container');
        $div.attr('data-template-key', key);
        $div.one('click', this.insert.bind(this));
        $body.append($div);
        return $div;
    },
    _buildPreview: function ($container, key) {
        var $div = this.dom('<div>');
        if (Object.prototype.hasOwnProperty.call(this.json[key], 'image')) {
            $div.addClass(this.prefix + '-template-image');
            var $img = this.dom('<img>').attr('src', this.json[key].image);
            $div.html($img);
        } else {
            $div.addClass(this.prefix + '-template-preview');
            $div.html(this.json[key].html);
        }
        $container.append($div);
    },
    _buildPreviewName: function ($container, key) {
        if (!Object.prototype.hasOwnProperty.call(this.json[key], 'name')) return;
        var $span = this.dom('<div>').addClass(this.prefix + '-template-name');
        $span.text(this.json[key].name);
        $container.append($span);
    },
};
