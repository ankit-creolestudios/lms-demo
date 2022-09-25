module.exports = {
    send: function () {
        if (this.opts.autosave.url) {
            this._sending();
        }
    },
    _getName: function () {
        var name;
        if (this.opts.autosave.name) {
            name = this.opts.autosave.name;
        } else {
            name = this.app.$element.attr('name');
            name = !name ? 'content' + this.uuid : name;
        }
        return name;
    },
    _sending: function () {
        var name = this._getName();
        var data = {};
        data[name] = this.app.$element.val();
        data = this.app.utils.extendData(data, this.opts.autosave.data);
        this.ajax.request(this.opts.autosave.method, {
            url: this.opts.autosave.url,
            data: data,
            before: function (xhr) {
                var event = this.app.broadcast('autosave.before.send', {
                    xhr: xhr,
                    name: name,
                    data: data,
                });
                if (event.isStopped()) {
                    return false;
                }
            }.bind(this),
            success: function (response) {
                this._complete(response, name, data);
            }.bind(this),
        });
    },
    _complete: function (response, name, data) {
        var callback = response && response.error ? 'autosave.error' : 'autosave.send';
        this.app.broadcast(callback, {
            name: name,
            data: data,
            response: response,
        });
    },
};
