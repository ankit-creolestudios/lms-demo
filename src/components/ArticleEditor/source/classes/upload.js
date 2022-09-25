module.exports = {
    defaults: {
        type: 'image',
        box: false,
        url: false,
        cover: true,
        name: 'file',
        data: false,
        multiple: true,
        placeholder: false,
        hidden: true,
        target: false,
        success: false,
        error: false,
        remove: false,
        trigger: false,
        input: false,
    },
    init: function ($el, params, trigger) {
        this.eventname = this.prefix + '-upload';
        if ($el) {
            this._build($el, params, trigger);
        }
    },
    send: function (e, files, params, trigger) {
        this.p = this._buildParams(params, trigger);
        this._send(e, files);
    },
    complete: function (response, e) {
        this._complete(response, e);
    },
    setImage: function (url) {
        if (this.p.input) return;
        if (this.$image) this.$image.remove();
        if (this.$remove) this.$remove.remove();
        if (url === '') {
            this.$placeholder.show();
        } else {
            this.$placeholder.hide();
            this._buildImage(url);
            if (this.p.remove) {
                this._buildRemove();
            }
        }
    },
    _build: function ($el, params, trigger) {
        this.p = this._buildParams(params, trigger);
        this.$element = this.dom($el);
        var tag = this.$element.get().tagName;
        if (tag === 'INPUT') {
            this._buildByInput();
        } else {
            this._buildByBox();
        }
    },
    _buildImage: function (url) {
        this.$image = this.dom('<img>');
        this.$image.attr('src', url);
        this.$box.append(this.$image);
        if (this.p.input === false) {
            this.$box.off('click.' + this.eventname);
            this.$image.on('click.' + this.eventname, this._click.bind(this));
        }
    },
    _buildRemove: function () {
        this.$remove = this.dom('<span>');
        this.$remove.addClass(this.prefix + '-upload-remove');
        this.$remove.on('click', this._removeImage.bind(this));
        this.$box.append(this.$remove);
    },
    _buildParams: function (params, trigger) {
        params = globalThis.$ARX.extend(true, this.defaults, params);
        if (trigger) params.trigger = trigger;
        return params;
    },
    _buildByInput: function () {
        this.$input = this.$element;
        if (this.p.box) {
            this._buildBox();
            this._buildPlaceholder();
        } else {
            this.p.input = true;
        }
        this._buildAccept();
        this._buildMultiple();
        this._buildEvents();
    },
    _buildByBox: function () {
        this._buildInput();
        this._buildAccept();
        this._buildMultiple();
        this._buildBox();
        this._buildPlaceholder();
        this._buildEvents();
    },
    _buildBox: function () {
        this.$box = this.dom('<div>').addClass(this.prefix + '-form-upload-box');
        this.$element.before(this.$box);
        if (this.p.cover === false) {
            this.$box.addClass(this.prefix + '-form-upload-cover-off');
        }
        if (this.p.hidden) {
            this.$element.hide();
        }
    },
    _buildPlaceholder: function () {
        if (!this.p.placeholder) return;
        this.$placeholder = this.dom('<span>').addClass(this.prefix + '-form-upload-placeholder');
        this.$placeholder.html(this.p.placeholder);
        this.$box.append(this.$placeholder);
    },
    _buildInput: function () {
        this.$input = this.dom('<input>');
        this.$input.attr('type', 'file');
        this.$input.attr('name', this._getUploadParam());
        this.$input.hide();
        this.$element.before(this.$input);
    },
    _buildAccept: function () {
        if (this.p.type !== 'image') return;
        var types = this.opts.image.types.join(',');
        this.$input.attr('accept', types);
    },
    _buildMultiple: function () {
        if (this.p.type !== 'image') return;
        if (this.p.multiple) {
            this.$input.attr('multiple', 'multiple');
        } else {
            this.$input.removeAttr('multiple');
        }
    },
    _buildEvents: function () {
        this.$input.on('change.' + this.eventname + '-' + this.uuid, this._change.bind(this));
        if (this.p.input === false) {
            this.$box.on('click.' + this.eventname, this._click.bind(this));
            this.$box.on('drop.' + this.eventname, this._drop.bind(this));
            this.$box.on('dragover.' + this.eventname, this._dragover.bind(this));
            this.$box.on('dragleave.' + this.eventname, this._dragleave.bind(this));
        }
    },
    _buildData: function (name, files, data) {
        if (this.p.multiple === 'single') {
            data.append(name, files[0]);
        } else if (this.p.multiple) {
            for (var i = 0; i < files.length; i++) {
                data.append(name + '[]', files[i]);
            }
        } else {
            data.append(name + '[]', files[0]);
        }
        return data;
    },
    _removeImage: function (e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (this.$image) this.$image.remove();
        if (this.$remove) this.$remove.remove();
        this.$placeholder.show();
        if (this.p.input === false) {
            this.$box.on('click.' + this.eventname, this._click.bind(this));
        }
        if (e) {
            this.app.api(this.p.remove, e);
        }
    },
    _getUploadParam: function () {
        return this.p.name;
    },
    _click: function (e) {
        e.preventDefault();
        this.$input.click();
    },
    _change: function (e) {
        this._send(e, this.$input.get().files);
    },
    _drop: function (e) {
        e.preventDefault();
        this._send(e);
    },
    _dragover: function (e) {
        e.preventDefault();
        this._setStatus('hover');
        return false;
    },
    _dragleave: function (e) {
        e.preventDefault();
        this._removeStatus();
        return false;
    },
    _setStatus: function (status) {
        if (this.p.input || !this.p.box) return;
        this._removeStatus();
        this.$box.addClass(this.prefix + '-form-upload-' + status);
    },
    _removeStatus: function () {
        if (this.p.input || !this.p.box) return;
        var status = ['hover', 'error'];
        for (var i = 0; i < status.length; i++) {
            this.$box.removeClass(this.prefix + '-form-upload-' + status[i]);
        }
    },
    _send: function (e, files) {
        files = files || e.dataTransfer.files;
        var data = new FormData();
        var name = this._getUploadParam();
        data = this._buildData(name, files, data);
        data = this.app.utils.extendData(data, this.p.data);
        this._sendData(e, files, data);
    },
    _sendData: function (e, files, data) {
        if (typeof this.p.url === 'function') {
            this.p.url.call(this.app, this, {
                data: data,
                files: files,
                e: e,
            });
        } else {
            this.app.progress.show();
            this.ajax.post({
                url: this.p.url,
                data: data,
                before: function (xhr) {
                    var event = this.app.broadcast('upload.before.send', {
                        xhr: xhr,
                        data: data,
                        files: files,
                        e: e,
                    });
                    if (event.isStopped()) {
                        this.app.progress.hide();
                        return false;
                    }
                }.bind(this),
                success: function (response) {
                    this._complete(response, e);
                }.bind(this),
                error: function (response) {
                    this._complete(response, e);
                }.bind(this),
            });
        }
    },
    _complete: function (response, e) {
        if (response && response.error) {
            this._setStatus('error');
            if (this.p.error) {
                this.app.broadcast('upload.error', {
                    response: response,
                });
                this.app.api(this.p.error, response, e);
            }
        } else {
            this._removeStatus();
            this._trigger(response);
            if (this.p.success) {
                this.app.broadcast('upload.complete', {
                    response: response,
                });
                this.app.api(this.p.success, response, e);
            }
        }
        setTimeout(
            function () {
                this.app.progress.hide();
            }.bind(this),
            500
        );
    },
    _trigger: function (response) {
        if (this.p.trigger) {
            if (response && response.url) {
                var instance = this.p.trigger.instance;
                var method = this.p.trigger.method;
                instance[method].call(instance, response.url);
            }
        }
    },
};
