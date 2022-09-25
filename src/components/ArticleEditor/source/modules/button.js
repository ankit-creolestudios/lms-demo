module.exports = {
    init: function (name, obj, $container, type) {
        if (typeof name === 'object') {
            this.name = name.name;
            this.obj = obj;
            this._buildFromElement(name.element);
        } else if (name) {
            this.type = type || false;
            this.name = name;
            var res = this._observe(obj);
            this.obj = typeof res === 'undefined' ? obj : res;
            if (this.obj) {
                this._build(name, $container);
            }
        }
    },
    setColor: function (stack, data) {
        var name = stack.getName();
        if (name === 'background' || name === 'text-color') {
            var key = name === 'background' ? 'background-color' : 'color';
            this.setBackground(data[key]);
        }
    },
    isButton: function () {
        return true;
    },
    isAddbar: function () {
        return this._has('addbar');
    },
    isControl: function () {
        return this._has('control');
    },
    getName: function () {
        return this.name;
    },
    getTitle: function () {
        return this.title;
    },
    getParams: function () {
        return this._has('params') ? this.obj.params : false;
    },
    getOffset: function () {
        return this.$button.offset();
    },
    getDimension: function () {
        return {
            width: this.$button.width(),
            height: this.$button.height(),
        };
    },
    getElement: function () {
        return this.$button;
    },
    setBackground: function (color) {
        this._background('add', color);
    },
    resetBackground: function () {
        this._background('remove', '');
    },
    _has: function (name) {
        return Object.prototype.hasOwnProperty.call(this.obj, name);
    },
    _observe: function (obj) {
        if (Object.prototype.hasOwnProperty.call(obj, 'observer')) {
            obj = this.app.api(obj.observer, obj, this.name);
        }
        return obj;
    },
    _background: function (type, color) {
        var func = type === 'remove' ? 'removeClass' : 'addClass';
        this.$icon[func](this.prefix + '-button-icon-color').css({
            'background-color': color,
            color: color !== '' ? this.app.color.invert(color) : '',
        });
    },
    _buildFromElement: function (element) {
        this.$button = this.dom(element);
        this.$button.addClass(this.prefix + '-button-target');
        this._buildData();
    },
    _build: function (name, $container) {
        this._buildTitle();
        this._buildElement();
        this._buildIcon();
        this._buildData($container);
    },
    _buildData: function ($container) {
        this.$button.attr({
            tabindex: '-1',
            'data-name': this.name,
            'data-command': this.obj.command || false,
        });
        this.$button.dataset('instance', this);
        var func = this._has('command') ? '_catch' : '_stop';
        this.$button.on('click.' + this.prefix + '-button', this[func].bind(this));
        this.$button.on('dragstart.' + this.prefix + '-button', function (e) {
            e.preventDefault();
            return;
        });
        if ($container) {
            this._buildTooltip();
            this._buildBackground();
            this._buildPosition($container);
        }
    },
    _buildTitle: function () {
        this.title = typeof this.obj.title !== 'undefined' ? this.lang.parse(this.obj.title) : '';
    },
    _buildElement: function () {
        this.$button = this.dom('<a href="#"></a>');
        this.$button.addClass(this.prefix + '-button ' + this.prefix + '-button-target');
        if (this.type) {
            this.$button.addClass(this.prefix + '-button-' + this.type);
        }
        if (this._has('classname')) {
            this.$button.addClass(this.obj.classname);
        }
    },
    _buildIcon: function () {
        var isIcon = this._has('icon');
        var span = '<span class="' + this.prefix + '-icon-' + this.name + '"></span>';
        this.$icon = this._buildIconElement();
        if (isIcon && this.obj.icon !== true) {
            if (this.obj.icon.search(/</) !== -1) {
                span = this.obj.icon;
            } else {
                span = '<span class="' + this.prefix + '-icon-' + this.obj.icon + '"></span>';
            }
        }
        if (this.opts.buttons.icons && typeof this.opts.buttons.icons[this.name] !== 'undefined') {
            span = this.opts.buttons.icons[this.name];
        }
        this.$icon.append(span);
        this.$button.append(this.$icon);
    },
    _buildIconElement: function () {
        return this.dom('<span>').addClass(this.prefix + '-button-icon');
    },
    _buildTooltip: function () {
        if (this.type === 'toolbar' || (this.type === 'context' && this.opts.tooltip.context)) {
            this.app.tooltip.build(this.$button, this.title);
        }
    },
    _buildBackground: function () {
        if (this._has('background')) {
            this.setBackground(this.obj.background);
        }
    },
    _buildPosition: function ($container) {
        if (this._has('position')) {
            var pos = this.obj.position;
            if (pos === 'first') {
                $container.prepend(this.$button);
            } else if (typeof pos === 'object') {
                var type = Object.prototype.hasOwnProperty.call(pos, 'after') ? 'after' : 'before';
                var name = pos[type];
                var $el = this._findPositionElement(name, $container);
                if ($el) {
                    $el[type](this.$button);
                } else {
                    $container.append(this.$button);
                }
            }
        } else {
            $container.append(this.$button);
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
    _stop: function (e) {
        e.preventDefault();
        e.stopPropagation();
    },
    _catch: function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $btn = this.dom(e.target).closest('.' + this.prefix + '-button-target');
        if ($btn.hasClass('disable')) return;
        this.app.editor.setFocus();
        var command = $btn.attr('data-command');
        var name = $btn.attr('data-name');
        var instance = $btn.dataget('instance');
        this.app.api(command, this.getParams(), instance, name, e);
        this.app.tooltip.close();
    },
};
