module.exports = {
    popups: {
        add: {
            title: '## popup.add-image ##',
            width: '100%',
        },
        edit: {
            title: '## popup.image ##',
            width: '100%',
            getter: 'block.getData',
            form: {
                width: {
                    type: 'input',
                    width: '100px',
                    label: '## image.width ##',
                    observer: 'image.observeImageWidth',
                },
                alt: {
                    type: 'input',
                    label: '## image.alt-text ##',
                },
                caption: {
                    type: 'input',
                    label: '## image.caption ##',
                    observer: 'image.observeImageCaption',
                },
                link: {
                    type: 'input',
                    label: '## image.link ##',
                    observer: 'image.observeImageLink',
                },
                target: {
                    type: 'checkbox',
                    text: '## image.link-in-new-tab ##',
                    observer: 'image.observeImageLink',
                },
            },
            footer: {
                save: {
                    title: '## image.save ##',
                    command: 'image.save',
                    type: 'primary',
                },
                cancel: {
                    title: '## image.cancel ##',
                    command: 'popup.close',
                },
            },
        },
        editcard: {
            title: '## popup.image ##',
            width: '100%',
            getter: 'block.getData',
            setter: 'block.setData',
            form: {
                alt: {
                    type: 'input',
                    label: '## image.alt-text ##',
                },
            },
            footer: {
                save: {
                    title: '## image.save ##',
                    command: 'image.save',
                    type: 'primary',
                },
                cancel: {
                    title: '## image.cancel ##',
                    command: 'popup.close',
                },
            },
        },
    },
    init: function () {
        this.dataStates = [];
    },
    popup: function () {
        var stack = this.app.popup.add('image', this.popups.add);
        var $body = stack.getBody();
        this._createImageByUrl($body);
        this._createUploadBox($body);
        this._createSelectBox($body);
        stack.open();
    },
    edit: function (params, button) {
        this._edit('edit', button);
    },
    editCard: function (params, button) {
        this._edit('editcard', button);
    },
    observe: function (obj, name, stack) {
        if (!this.opts.image) {
            return false;
        }
        var instance = this.app.block.get();
        if (stack && stack.getName() === 'addbar') {
            obj.command = 'image.popup';
        } else if (instance && instance.getType() === 'image') {
            obj.command = 'image.edit';
        }
        return obj;
    },
    observeStates: function () {
        this._findImages().each(this._addImageState.bind(this));
    },
    observeImageLink: function (obj) {
        return this.opts.image.link ? obj : false;
    },
    observeImageCaption: function (obj) {
        var instance = this.app.block.get();
        if (instance && instance.getTag() === 'figure') {
            return obj;
        } else {
            return false;
        }
    },
    observeImageWidth: function (obj) {
        return this.opts.image.width ? obj : false;
    },
    parseInserted: function (inserted) {
        var files = [];
        var params = {
            url: this.opts.image.upload,
            name: this.opts.image.name,
            data: this.opts.image.data,
            multiple: true,
            success: 'image.insertFromInserted',
            error: 'image.error',
        };
        this.pasteInsertedImages = [];
        this.resolved = [];
        var fetchImages = 0;
        for (var i = 0; i < inserted.instances.length; i++) {
            var instance = inserted.instances[i];
            var type = instance.getType();
            if (type === 'image') {
                var src = instance.getSrc();
                if (src.search(/^data:/i) !== -1) {
                    var blob = this._dataURLtoFile(src, 'image' + i);
                    files.push(blob);
                    this.pasteInsertedImages.push(instance);
                } else if (src.search(/^blob:/i) !== -1) {
                    fetchImages++;
                    this.pasteInsertedImages.push(instance);
                    var self = this;
                    function sendFile(src, i) {
                        var xhr = new XMLHttpRequest();
                        xhr.open('GET', src, true);
                        xhr.responseType = 'blob';
                        xhr.onload = function (e) {
                            if (xhr.status == 200) {
                                var blob = xhr.response;
                                var file = new File([blob], 'image' + i, {
                                    type: 'image/png',
                                });
                                self.resolved.push(file);
                            }
                        };
                        xhr.send();
                    }
                    sendFile(src, i);
                }
            }
        }
        if (fetchImages !== 0) {
            var interval = setInterval(
                function () {
                    if (this.resolved.length === fetchImages) {
                        clearInterval(interval);
                        var upload = this.app.create('upload');
                        upload.send(false, this.resolved, params);
                    }
                }.bind(this),
                100
            );
        }
        if (files.length !== 0) {
            var upload = this.app.create('upload');
            upload.send(false, files, params);
        }
    },
    paste: function (blob, e) {
        var params = {
            url: this.opts.image.upload,
            name: this.opts.image.name,
            data: this.opts.image.data,
            multiple: false,
            success: 'image.insertFromBlob',
            error: 'image.error',
        };
        var upload = this.app.create('upload');
        upload.send(e, [blob], params);
    },
    drop: function (e, dt) {
        var files = [];
        for (var i = 0; i < dt.files.length; i++) {
            var file = dt.files[i] || dt.items[i].getAsFile();
            if (file) {
                files.push(file);
            }
        }
        var params = {
            url: this.opts.image.upload,
            name: this.opts.image.name,
            data: this.opts.image.data,
            multiple: this.opts.image.multiple,
            success: 'image.insertByDrop',
            error: 'image.error',
        };
        if (files.length > 0) {
            var $block = this.dom(e.target).closest('[data-' + this.prefix + '-type]');
            if ($block.length !== 0) {
                this.app.block.set($block);
            }
            var upload = this.app.create('upload');
            upload.send(e, files, params);
        }
    },
    insertFromClipboard: function (clipboard) {
        var text = clipboard.getData('text/plain') || clipboard.getData('text/html');
        text = text.trim();
        if (text !== '') {
            return;
        }
        var items = clipboard.items;
        var blob = null;
        for (var i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') === 0) {
                blob = items[i].getAsFile();
            }
        }
        if (blob !== null) {
            this.paste(blob);
            return true;
        }
    },
    insertFromBlob: function (response) {
        this.insert(response);
    },
    insertByDrop: function (response, e) {
        if (this.app.block.is()) {
            var instance = this.app.block.get();
            var target = e.target;
            var type = instance.getType();
            var isChange =
                (type === 'card' && target && target.tagName === 'IMG' && instance.hasImage()) || type === 'image';
            if (isChange) {
                this.change(response);
                return;
            } else if (e && type !== 'card' && instance.isEditable()) {
                this.app.insertion.insertPoint(e);
            }
        }
        this.insert(response);
    },
    insertByUpload: function (response) {
        this.insert(response);
    },
    insertByUrl: function (e) {
        e.preventDefault();
        var str = this.$urlinput.val();
        if (str.trim() === '') {
            return;
        }
        var response = {
            file: {
                url: str,
                id: this.app.utils.getRandomId(),
            },
        };
        this.insert(response);
    },
    insertFromSelect: function (e) {
        e.preventDefault();
        var $target = this.dom(e.target);
        var obj = {
            url: $target.attr('data-url'),
        };
        var attrs = ['id', 'alt', 'caption', 'link', 'width', 'height'];
        for (var i = 0; i < attrs.length; i++) {
            var val = $target.attr('data-' + attrs[i]);
            if (val !== null) {
                obj[attrs[i]] = val;
            }
        }
        this.insert(
            {
                file: obj,
            },
            true
        );
    },
    insertFromInserted: function (response) {
        var z = 0;
        for (var key in response) {
            this.pasteInsertedImages[z].setImage(response[key]);
            z++;
        }
    },
    changeClone: function (response) {
        for (var key in response) {
            this.$imageclone.attr('src', response[key].url);
            break;
        }
        this.change(response, false);
    },
    change: function (response, closepopup) {
        if (closepopup !== false) {
            this.app.popup.close();
        }
        var instance = this.app.block.get();
        for (var key in response) {
            instance.setImage(response[key]);
            this.app.broadcast('image.change', response[key]);
            this.app.broadcast('image.upload', {
                instance: instance,
                data: response[key],
            });
            return;
        }
    },
    save: function (stack) {
        this.app.popup.close();
        this.app.block.setData(stack);
    },
    insert: function (response, select) {
        this.app.popup.close();
        this.imageslen = 0;
        this.imagescount = 0;
        var tag = this.opts.image.tag;
        for (var key in response) {
            var $source = this.dom('<' + tag + '>');
            var $image = this._createImageFromResponseItem(response[key]);
            $source.append($image);
            var instance = this.app.create('block.image', $source);
            this.app.block.add({
                instance: instance,
                type: 'image',
            });
            if (Object.prototype.hasOwnProperty.call(response[key], 'caption')) {
                var $caption = this.dom('<figcaption>').html(response[key].caption);
                instance.$block.append($caption);
                this.app.create('block.figcaption', $caption);
            }
            var eventType = select ? 'select' : 'upload';
            this.app.broadcast('image.' + eventType, {
                instance: instance,
                data: response[key],
            });
            this.$last = instance.getBlock();
            this.imageslen++;
        }
    },
    error: function (response) {
        this.app.broadcast('image.upload.error', {
            response: response,
        });
    },
    getStates: function () {
        var $images = this._findImages();
        for (var key in this.dataStates) {
            var data = this.dataStates[key];
            var status = $images.is('[data-image="' + data.id + '"]');
            this._setImageState(data.id, status);
        }
        return this.dataStates;
    },
    createUploadBox: function (upload, $body) {
        if (!upload) return;
        var $upload = this.dom('<div>');
        $body.append($upload);
        return $upload;
    },
    createSelectBox: function (select, $body, callback) {
        if (!select) return;
        this.$selectbox = this._createImagesBox($body);
        if (typeof select === 'object') {
            this._parseList(select, callback);
        } else {
            var getdata = this.opts.editor.reloadmarker
                ? {
                      d: new Date().getTime(),
                  }
                : {};
            this.ajax.get({
                url: select,
                data: getdata,
                success: function (data) {
                    this._parseList(data, callback);
                }.bind(this),
            });
        }
    },
    _edit: function (type, button) {
        this.app.popup.create('image-edit', this.popups[type]);
        this._buildEditUpload();
        this.app.popup.open({
            button: button,
        });
    },
    _findImages: function () {
        return this.app.editor.getLayout().find('[data-image]');
    },
    _addImageState: function ($node) {
        var id = $node.attr('data-image');
        this.dataStates[id] = {
            type: 'image',
            status: true,
            url: $node.attr('src'),
            $img: $node,
            $el: $node,
            id: id,
        };
    },
    _setImageState: function (url, status) {
        this.dataStates[url].status = status;
    },
    _checkImageLoad: function () {
        this.imagescount++;
        if (this.imagescount === this.imageslen) {
            this.app.block.unset();
            this.app.block.set(this.$last);
            this.app.editor.adjustHeight();
        }
    },
    _buildEditUpload: function () {
        if (!this.opts.image.upload) return;
        var instance = this.app.block.get();
        var stack = this.app.popup.getStack();
        var $body = stack.getBody();
        var $item = this._createFormItem();
        $item.addClass(this.prefix + '-form-item-edit-image-box');
        this.$imageclone = instance.getImage().clone();
        var $imageitem = this.dom('<div>').addClass(this.prefix + '-form-item-image');
        $imageitem.append(this.$imageclone);
        $item.append($imageitem);
        this.$upload = this.dom('<div>');
        $item.append(this.$upload);
        $body.prepend($item);
        this._buildUpload(this.$upload, 'image.changeClone');
    },
    _buildUpload: function ($item, callback) {
        if (!this.opts.image.upload) return;
        var params = {
            box: true,
            placeholder: this.lang.get('image.upload-new-placeholder'),
            url: this.opts.image.upload,
            name: this.opts.image.name,
            data: this.opts.image.data,
            multiple: this.opts.image.multiple,
            success: callback,
            error: 'image.error',
        };
        this.app.create('upload', $item, params);
    },
    _createSelectBox: function ($body) {
        this.createSelectBox(this.opts.image.select, $body, 'image.insertFromSelect');
    },
    _createUploadBox: function ($body) {
        this.$upload = this.createUploadBox(this.opts.image.upload, $body);
        this._buildUpload(this.$upload, 'image.insertByUpload');
    },
    _createImageFromResponseItem: function (item) {
        var $image = this.dom('<img>').attr('src', item.url).one('load', this._checkImageLoad.bind(this));
        var $item = $image;
        var attrs = ['id', 'alt', 'width', 'height'];
        for (var i = 0; i < attrs.length; i++) {
            if (Object.prototype.hasOwnProperty.call(item, attrs[i])) {
                $item.attr(attrs[i], item[attrs[i]]);
            }
        }
        if (Object.prototype.hasOwnProperty.call(item, '2x')) $item.attr('srcset', item['2x'] + ' 2x');
        if (Object.prototype.hasOwnProperty.call(item, 'link')) {
            var $link = this.dom('<a>');
            $link.attr('href', item.link);
            $image.wrap($link);
            $item = $link;
        }
        return $item;
    },
    _createImagesBox: function ($body) {
        var $box = this.dom('<div>').addClass(this.prefix + '-popup-images-box');
        $body.append($box);
        return $box;
    },
    _createOrSection: function ($body) {
        if (this.opts.image.url && (this.opts.image.upload || this.opts.image.select)) {
            var $section = this.dom('<div>').addClass(this.prefix + '-popup-image-section-or');
            $section.html(this.lang.get('image.or'));
            $body.append($section);
        }
    },
    _createImageByUrl: function ($body) {
        if (!this.opts.image.url) return;
        var $item = this._createFormItem();
        this.$urlbutton = this._createUrlButton();
        $item.append(this.$urlinput);
        $item.append(this.$urlbutton);
        $body.append($item);
    },
    _createFormItem: function () {
        return this.dom('<div>').addClass(this.prefix + '-form-container-flex');
    },
    _createUrlInput: function () {
        var $input = this.dom('<input>').addClass(this.prefix + '-form-input');
        $input.attr('placeholder', this.lang.get('image.url-placeholder'));
        return $input;
    },
    _createUrlButton: function () {
        var $button = this.dom('<button>').addClass(
            this.prefix + '-form-button ' + this.prefix + '-form-button-primary'
        );
        $button.html(this.lang.get('image.insert'));
        $button.one('click', this.insertByUrl.bind(this));
        return $button;
    },
    _parseList: function (data, callback) {
        for (var key in data) {
            var obj = data[key];
            if (typeof obj !== 'object') continue;
            var $img = this.dom('<img>');
            var url = obj.thumb ? obj.thumb : obj.url;
            $img.addClass(this.prefix + '-popup-event');
            $img.attr('src', url);
            $img.attr('data-url', obj.url);
            $img.attr('data-callback', callback);
            var attrs = ['id', 'alt', 'caption', 'link', 'width', 'height'];
            for (var i = 0; i < attrs.length; i++) {
                if (Object.prototype.hasOwnProperty.call(obj, attrs[i])) {
                    $img.attr('data-' + attrs[i], obj[attrs[i]]);
                }
            }
            $img.on(
                'click.' + this.prefix + '-popup-event-' + this.uuid,
                function (e) {
                    var $target = this.dom(e.target);
                    var callback = $target.attr('data-callback');
                    this.app.api(callback, e);
                }.bind(this)
            );
            this.$selectbox.append($img);
        }
    },
    _dataURLtoFile: function (dataurl, filename) {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {
            type: mime,
        });
    },
};
