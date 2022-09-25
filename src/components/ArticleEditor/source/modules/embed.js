module.exports = {
    popups: {
        add: {
            title: '## embed.embed ##',
            width: '100%',
            form: {
                embed: {
                    type: 'textarea',
                    label: '## embed.description ##',
                    rows: 6,
                },
                caption: {
                    type: 'input',
                    label: '## embed.caption ##',
                },
                responsive: {
                    type: 'checkbox',
                    text: '## embed.responsive-video ##',
                },
            },
            footer: {
                insert: {
                    title: '## buttons.insert ##',
                    command: 'embed.insert',
                    type: 'primary',
                },
                cancel: {
                    title: '## buttons.cancel ##',
                    command: 'popup.close',
                },
            },
        },
        edit: {
            title: '## embed.embed ##',
            width: '100%',
            form: {
                embed: {
                    type: 'textarea',
                    label: '## embed.description ##',
                    rows: 6,
                },
                caption: {
                    type: 'input',
                    label: '## embed.caption ##',
                },
                responsive: {
                    type: 'checkbox',
                    text: '## embed.responsive-video ##',
                },
            },
            footer: {
                save: {
                    title: '## buttons.save ##',
                    command: 'embed.save',
                    type: 'primary',
                },
                cancel: {
                    title: '## buttons.cancel ##',
                    command: 'popup.close',
                },
            },
        },
    },
    build: function (scripts) {
        if (scripts) {
            this._callScripts(scripts);
        } else {
            this._findScripts();
        }
    },
    observe: function (obj, name, stack) {
        if (!this.opts.embed) {
            return false;
        }
        var instance = this.app.block.get();
        if (stack && stack.getName() === 'addbar') {
            obj.command = 'embed.popup';
        } else if (instance && instance.getType() === 'embed') {
            obj.command = 'embed.edit';
        }
        return obj;
    },
    popup: function () {
        var stack = this.app.popup.add('embed', this.popups.add);
        stack.open({
            focus: 'embed',
        });
        if (this.opts.embed.checkbox) {
            stack.getInput('responsive').attr('checked', true);
        }
        this._buildCodemirror(stack);
    },
    edit: function (params, button) {
        var instance = this.app.block.get();
        var data = {
            embed: instance.getEmbedCode(),
            caption: instance.getCaption(),
            responsive: instance.isResponsive(),
        };
        var stack = this.app.popup.create('embed', this.popups.edit);
        stack.setData(data);
        this.app.popup.open({
            button: button,
            focus: 'embed',
        });
        this._buildCodemirror(stack);
    },
    insert: function (stack) {
        this.app.popup.close();
        var data = stack.getData();
        var code = this._getEmbedCode(data);
        if (code === '') {
            return;
        }
        var instance = this._createInstance(data, code);
        this.app.block.add({
            instance: instance,
        });
    },
    save: function (stack) {
        this.app.popup.close();
        var current = this.app.block.get();
        var data = stack.getData();
        var code = this._getEmbedCode(data);
        if (code === '') {
            this.app.block.remove();
            return;
        }
        var instance = this._createInstance(data, code, current);
        if (this._isNeedToChange(data, instance, current)) {
            this.app.block.change(instance);
        }
    },
    _buildCodemirror: function (stack) {
        var $input = stack.getInput('embed');
        this.app.codemirror.create({
            el: $input,
            height: '200px',
            focus: true,
        });
        this.app.popup.updatePosition();
    },
    _findScripts: function () {
        var scripts = this.app.editor
            .getLayout()
            .find('[data-' + this.prefix + '-type=embed]')
            .find('script')
            .getAll();
        this.build.call(this, scripts);
    },
    _callScripts: function (scripts) {
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].src !== '') {
                var src = scripts[i].src;
                this.app.editor
                    .getDoc()
                    .find('head script[src="' + src + '"]')
                    .remove();
                var $script = this.dom('<script>').attr({
                    src: src,
                    async: true,
                    defer: 'true',
                });
                $script.on(
                    'load',
                    function () {
                        if (src.search('instagram') !== -1) {
                            var win = this.app.editor.getWinNode();
                            if (win.instgrm) {
                                win.instgrm.Embeds.process();
                            }
                        }
                        this.build(scripts.slice(i + 1));
                    }.bind(this)
                );
                var head = this.app.editor.getDocNode().getElementsByTagName('head')[0];
                if (head) head.appendChild($script.get());
            }
        }
    },
    _getEmbedCode: function (data) {
        var code = data.embed.trim();
        code = this.app.codemirror.val(code);
        code = this._removeScript(code);
        code = this.app.content.sanitize(code);
        code = !this._isHtmlString(code) && code !== '' ? this._parseUrl(code) : code;
        return code;
    },
    _removeScript: function (code) {
        if (!this.opts.embed.script) {
            code = this.app.content.removeTagsWithContent(code, ['script']);
        }
        return code;
    },
    _createInstance: function (data, code, current) {
        var $figure;
        if (current) {
            var figure = current.duplicateEmpty();
            $figure = figure.getBlock();
            $figure.html(code);
        } else {
            $figure = this._isFigure(code) ? code : '<figure>' + code + '</figure>';
        }
        var instance = this.app.create('block.embed', $figure);
        instance.setCaption(data.caption);
        if (data.responsive) {
            instance.addResponsive();
        }
        return instance;
    },
    _parseUrl: function (str) {
        var iframeStart = '<iframe width="560" height="315" src="';
        var iframeEnd = '" frameborder="0" allowfullscreen></iframe>';
        var parsed;
        if (str.match(this.opts.regex.youtube)) {
            var yturl = '//www.youtube.com';
            if (str.search('youtube-nocookie.com') !== -1) {
                yturl = '//www.youtube-nocookie.com';
            }
            parsed = str.replace(this.opts.regex.youtube, yturl + '/embed/$1');
            return iframeStart + parsed + iframeEnd;
        } else if (str.match(this.opts.regex.vimeo)) {
            parsed = str.replace(this.opts.regex.vimeo, '//player.vimeo.com/video/$2');
            return iframeStart + parsed + iframeEnd;
        }
        return str;
    },
    _isNeedToChange: function (data, instance, current) {
        if (current.getEmbedCode() !== instance.getEmbedCode()) return true;
        if (data.responsive !== current.isResponsive()) return true;
        if (data.caption !== current.getCaption()) return true;
    },
    _isHtmlString: function (str) {
        return /^\s*<(\w+|!)[^>]*>/.test(str);
    },
    _isFigure: function (str) {
        return /^<figure/.test(str);
    },
};
