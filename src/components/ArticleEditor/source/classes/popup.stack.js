module.exports = {
    defaults: {
        active: false,
        title: false,
        type: false,
        width: false,
        setter: false,
        getter: false,
        builder: false,
        observer: false,
        instance: false,
        collapse: false,
        form: false,
        items: false,
        focus: false,
        footer: false,
    },
    init: function (name, params, collapse, popup) {
        this.defaultWidth = '240px';
        this.popup = popup;
        this.name = name;
        this.tools = {};
        this.data = false;
        this.items = false;
        this.formitems = false;
        this.params = globalThis.$ARX.extend({}, true, this.defaults, params);
        if (collapse) {
            this.params.collapse = true;
        }
        this._build();
        this._observe();
    },
    set: function (name, value) {
        this.params[name] = value;
    },
    setData: function (data) {
        this.data = data;
    },
    setFocus: function (name) {
        if (typeof this.tools[name] !== 'undefined') {
            this.tools[name].setFocus();
        }
    },
    setWidth: function (width) {
        var $popup = this.app.popup.getElement();
        $popup.attr('data-width', width);
        if (width === '100%') {
            width = this.app.editor.getWidth() + 'px';
        }
        $popup.css('width', width);
        this.app.$win.on('resize.' + this.prefix + '-popup-' + this.uuid, this.popup.resize.bind(this.popup));
        this.popup.resize();
    },
    setItemsData: function (items) {
        this.items = items;
    },
    get: function (name) {
        return this.params[name];
    },
    getElement: function () {
        return this.$stack;
    },
    getName: function () {
        return this.name;
    },
    getBody: function () {
        return this.$body;
    },
    getInstance: function () {
        return this.get('instance');
    },
    getItemsData: function () {
        return this.items;
    },
    getItems: function () {
        return this.$items;
    },
    getFooter: function () {
        return this.$footer;
    },
    getFooterPrimary: function () {
        return this.$footer.find('.' + this.prefix + '-form-button-primary');
    },
    getTool: function (name) {
        return typeof this.tools[name] !== 'undefined' ? this.tools[name] : false;
    },
    getInput: function (name) {
        var tool = this.getTool(name);
        return tool ? tool.getInput() : this.dom();
    },
    getFormItem: function (name) {
        var tool = this.getTool(name);
        return tool ? tool.getInput().closest('.' + this.prefix + '-form-item') : this.dom();
    },
    getData: function (name) {
        var data;
        if (name) {
            if (typeof this.tools[name] !== 'undefined') {
                data = this.tools[name].getValue();
            }
        } else {
            data = {};
            for (var key in this.tools) {
                data[key] = this.tools[key].getValue();
            }
        }
        return data;
    },
    hasForm: function () {
        return this.formitems;
    },
    hasFooter: function () {
        return this.footerbuttons !== 0;
    },
    hasItems: function () {
        return this.items !== false;
    },
    isCollapsed: function () {
        return this.get('collapse');
    },
    isActive: function () {
        return this.get('active');
    },
    open: function (params, focus, direct) {
        if (params && params.focus) {
            this.set('focus', params.focus);
        }
        this.popup.closeStacks();
        this.app.popup.setStack(this);
        if (direct !== false) {
            var event = this.app.broadcast('popup.before.open');
            if (event.isStopped()) {
                this.popup.stopStack();
                return;
            }
        }
        if (params && params.collapse) {
            this._buildItems();
            this._renderItems();
        } else {
            this.render();
        }
        this.popup.header.render(this.popup.stacks);
        this.popup.header.setActive(this);
        this.$stack.show();
        this._renderWidth();
        if (focus !== false) {
            this.renderFocus();
        }
        if (direct !== false) {
            this.app.broadcast('popup.open');
        }
    },
    close: function () {
        this.$stack.hide();
    },
    collapse: function () {
        var prev = this._getPrev();
        if (this.isCollapsed()) {
            this.popup.removeStack(this);
        }
        prev.open({
            collapse: true,
        });
    },
    render: function () {
        this._renderType();
        this._renderItems();
        this._renderForm();
        this._renderFooter();
        this._renderEnv();
    },
    renderFocus: function () {
        if (this.get('focus')) {
            this.setFocus(this.get('focus'));
        }
    },
    _observe: function () {
        if (this.params.observer) {
            this.app.api(this.params.observer, this);
        }
    },
    _getPrev: function () {
        var prev;
        for (var key in this.popup.stacks) {
            if (key === this.name) {
                return prev;
            }
            prev = this.popup.stacks[key];
        }
    },
    _build: function () {
        this._buildElement();
        this._buildBody();
        this._buildFooter();
        this._buildParams();
    },
    _buildElement: function () {
        this.$stack = this.dom('<div>').addClass(
            this.prefix + '-popup-stack ' + this.prefix + '-popup-stack-' + this.name
        );
        this.$stack.hide();
        this.$stack.attr('data-' + this.prefix + '-stack-name', this.name);
        this.popup.getElement().append(this.$stack);
    },
    _buildBody: function () {
        this.$body = this.dom('<div>').addClass(this.prefix + '-popup-body');
        this.$stack.append(this.$body);
    },
    _buildFooter: function () {
        this.$footer = this.dom('<div>').addClass(this.prefix + '-popup-footer');
        this.$stack.append(this.$footer);
    },
    _buildParams: function () {
        this.params.width = this.params.width ? this.params.width : this.defaultWidth;
        this.params.setter = this.params.setter ? this.params.setter : false;
        this.params.getter = this.params.getter ? this.params.getter : false;
        this.data = this.params.getter ? this.app.api(this.params.getter, this) : false;
        this._buildItems();
    },
    _buildItems: function () {
        if (this.params.builder) {
            this.items = this.app.api(this.params.builder, this);
        } else if (this.params.items) {
            this.items = this.params.items;
        }
    },
    _renderWidth: function () {
        this.setWidth(this.get('width'));
    },
    _renderType: function () {
        this.$stack.removeClass(this.prefix + '-popup-type-grid');
        var type = this.get('type');
        if (type) {
            this.$stack.addClass(this.prefix + '-popup-type-' + type);
        }
    },
    _renderItems: function () {
        if (!this.items) return;
        if (this.$items) {
            this.$items.html('');
        } else {
            this.$items = this.dom('<div>').addClass(this.prefix + '-popup-items');
            this.$body.append(this.$items);
        }
        for (var name in this.items) {
            if (Object.prototype.hasOwnProperty.call(this.items[name], 'observer') && this.items[name].observer) {
                var res = this.app.api(this.items[name].observer, this.items[name], name, this);
                if (typeof res !== 'undefined') {
                    this.items[name] = res;
                }
            }
            if (this.items[name] === false) continue;
            var item = this.app.create('popup.item', this, name, this.items[name]);
            var $item = item.getElement();
            this._renderItemPosition(this.$items, $item, this.items[name]);
        }
    },
    _renderItemPosition: function ($container, $item, params) {
        if (params.position) {
            var pos = params.position;
            if (pos === 'first') {
                $container.prepend($item);
            } else if (typeof pos === 'object') {
                var type = Object.prototype.hasOwnProperty.call(pos, 'after') ? 'after' : 'before';
                var name = pos[type];
                var $el = this._findPositionElement(name, $container);
                if ($el) {
                    $el[type]($item);
                } else {
                    $container.append($item);
                }
            }
        } else {
            $container.append($item);
        }
    },
    _renderEnv: function () {
        var $popup = this.popup.getElement();
        $popup.removeClass('has-footer has-items has-form');
        if (this.hasForm()) $popup.addClass('has-form');
        if (this.hasFooter()) $popup.addClass('has-footer');
        if (this.hasItems()) $popup.addClass('has-items');
    },
    _renderForm: function () {
        this.formitems = this.get('form');
        if (!this.formitems) return;
        if (this.$form) {
            this.$form.html('');
        } else {
            this.$form = this.dom('<form>').addClass(this.prefix + '-popup-form');
            this.$body.append(this.$form);
        }
        this._renderTools();
        this._renderData();
    },
    _renderTools: function () {
        for (var name in this.formitems) {
            this._renderTool(name, this.formitems[name]);
        }
    },
    _renderTool: function (name, obj) {
        var tool = this.app.create('tool.' + obj.type, name, obj, this, this.data);
        var $tool = tool.getElement();
        if ($tool) {
            this.tools[name] = tool;
            this.$form.append($tool);
        }
    },
    _renderData: function () {
        if (!this.data) return;
        for (var name in this.data) {
            if (typeof this.tools[name] !== 'undefined') {
                this.tools[name].setValue(this.data[name]);
            }
        }
    },
    _renderFooter: function () {
        this.footerbuttons = 0;
        var buttons = this.get('footer');
        if (!buttons) return;
        this.$footer.html('');
        for (var key in buttons) {
            if (buttons[key] === false) continue;
            var button = this.app.create('popup.button', key, this, buttons[key]);
            this.$footer.append(button.getElement());
            this.footerbuttons++;
        }
    },
    _findPositionElement: function (name, $container) {
        var $el;
        if (Array.isArray(name)) {
            for (var i = 0; i < name.length; i++) {
                $el = $container.find('[data-name=' + name[i] + ']');
                if ($el.length !== 0) break;
            }
        } else {
            $el = $container.find('[data-name=' + name + ']');
        }
        return $el.length !== 0 ? $el : 0;
    },
};
