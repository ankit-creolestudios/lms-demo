module.exports = {
    popups: {
        format: {
            items: {
                format: {
                    title: '## link.link ##',
                    command: 'link.format',
                    shortcut: 'Ctrl+k',
                },
                unlink: {
                    title: '## link.unlink ##',
                    command: 'link.unlink',
                },
            },
        },
        change: {
            items: {
                edit: {
                    title: '## link.edit-link ##',
                    command: 'link.edit',
                    shortcut: 'Ctrl+k',
                },
                unlink: {
                    title: '## link.unlink ##',
                    command: 'link.unlink',
                },
            },
        },
        create: {
            title: '## popup.link ##',
            width: '600px',
            form: {
                text: {
                    type: 'input',
                    label: '## link.text ##',
                },
                url: {
                    type: 'input',
                    label: '## link.url ##',
                },
                target: {
                    type: 'checkbox',
                    text: '## link.link-in-new-tab ##',
                },
            },
            footer: {
                insert: {
                    title: '## link.insert ##',
                    command: 'link.insert',
                    type: 'primary',
                },
                cancel: {
                    title: '## link.cancel ##',
                    command: 'popup.close',
                },
            },
        },
        edit: {
            title: '## popup.link ##',
            width: '600px',
            form: {
                text: {
                    type: 'input',
                    label: '## link.text ##',
                },
                url: {
                    type: 'input',
                    label: '## link.url ##',
                },
                target: {
                    type: 'checkbox',
                    text: '## link.link-in-new-tab ##',
                },
            },
            footer: {
                save: {
                    title: '## link.save ##',
                    command: 'link.save',
                    type: 'primary',
                },
                cancel: {
                    title: '## link.cancel ##',
                    command: 'popup.close',
                },
            },
        },
    },
    popup: function (params, button) {
        var $link = this.getLink();
        var popup = $link.length === 0 ? 'format' : 'change';
        this.app.popup.create('link', this.popups[popup]);
        this.app.popup.open({
            button: button,
        });
    },
    format: function (params) {
        var text = this.app.selection.getText();
        var stack = this.app.popup.create('link-create', this.popups.create);
        var data = {
            text: text,
            target: this.opts.link.target,
        };
        stack.setData(data);
        this.app.popup.open({
            focus: text ? 'url' : 'text',
        });
    },
    edit: function () {
        var $link = this.getLink();
        var stack = this.app.popup.create('link-edit', this.popups.edit);
        var data = {
            text: $link.text(),
            url: $link.attr('href'),
            target: $link.attr('target') || this.opts.link.target,
        };
        data = this._encodeUrl(data);
        stack.setData(data);
        this.app.popup.open({
            focus: 'url',
        });
    },
    insert: function (stack) {
        this.app.popup.close();
        var nodes = this.app.inline.set({
            tag: 'a',
            caret: 'after',
        });
        var $link = this.dom(nodes);
        this._save(stack, $link, 'add');
    },
    save: function (stack) {
        this.app.popup.close();
        var $link = this.getLink();
        this._save(stack, $link, 'change');
    },
    unlink: function () {
        this.app.popup.close();
        var links = this.app.selection.getNodes({
            tags: ['a'],
        });
        if (links.length === 0) return;
        for (var i = 0; i < links.length; i++) {
            var $link = this.dom(links[i]);
            this.app.broadcast('link.remove', {
                url: $link.attr('href'),
                text: $link.text(),
            });
            $link.unwrap();
        }
        this.app.toolbar.observe();
    },
    getLink: function () {
        var links = this.app.selection.getNodes({
            tags: ['a'],
        });
        var $link = links.length !== 0 ? this.dom(links[0]) : this.dom([]);
        return $link;
    },
    _save: function (stack, $link, type) {
        var data = stack.getData();
        data = this._cleanUrl(data);
        data = this._encodeUrl(data);
        if (data.url === '') return;
        data = this._setUrl($link, data);
        if ($link.length === 1) {
            data = this._setText($link, data);
        }
        data = this._setTarget($link, data);
        this.app.broadcast('link.' + type, data);
    },
    _cleanUrl: function (data) {
        data.url = this.app.content.escapeHtml(data.url);
        data.url = data.url.search(/^javascript:/i) !== -1 ? '' : data.url;
        return data;
    },
    _encodeUrl: function (data) {
        data.url = data.url ? data.url.replace(/&amp;/g, '&') : '';
        return data;
    },
    _setUrl: function ($link, data) {
        $link.attr('href', data.url);
        return data;
    },
    _setText: function ($link, data) {
        data.text = data.text === '' ? data.url : data.text;
        $link.text(data.text);
        return data;
    },
    _setTarget: function ($link, data) {
        if (data.target) $link.attr('target', '_blank');
        else $link.removeAttr('target');
        return data;
    },
};
