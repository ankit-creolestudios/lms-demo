module.exports = {
    defaults: {
        container: false,
        title: false,
        html: false,
        toggle: true,
        active: false,
        divider: false,
        remover: false,
        classname: false,
        params: false,
        instance: false,
        observer: false,
        command: false,
    },
    init: function (popup, name, params) {
        this.popup = popup;
        this.name = name;
        this.params = this._buildParams(params);
        this._build();
        this._buildContainer();
        this._buildIcon();
        this._buildTitle();
        this._buildImage();
        this._buildShortcut();
        this._buildActive();
        this._buildHidden();
        this._buildDivider();
        this._buildCommand();
        this._buildRemover();
    },
    getPopup: function () {
        return this.popup;
    },
    getName: function () {
        return this.name;
    },
    getParams: function () {
        return this.params.params;
    },
    getElement: function () {
        return this.$item;
    },
    getInstance: function () {
        return this.params.instance;
    },
    isControl: function () {
        return this.params.control;
    },
    _build: function () {
        this.$item = this.params.html ? this.dom(this.params.html) : this.dom('<div>');
        this.$item.addClass(this.prefix + '-popup-item ' + this.prefix + '-popup-stack-item');
        this.$item.attr({
            'data-name': this.name,
        });
    },
    _buildContainer: function () {
        if (this.params.container) {
            this.$item.addClass(this.prefix + '-popup-item-container');
        }
    },
    _buildTitle: function () {
        if (this.params.title) {
            this.$title = this.dom('<span>').addClass(this.prefix + '-popup-item-title');
            this.$title.html(this.lang.parse(this.params.title));
            this.$item.append(this.$title);
        }
    },
    _buildImage: function () {
        if (this.params.image) {
            this.$image = this.dom('<span>').addClass(this.prefix + '-popup-item-image');
            this.$image.html(this.params.image);
            this.$item.append(this.$image);
        }
    },
    _buildIcon: function () {
        if (this.params.icon) {
            this.$icon = this.dom('<span>').addClass(this.prefix + '-popup-item-icon');
            if (this.opts.buttons.icons && typeof this.opts.buttons.icons[this.name] !== 'undefined') {
                this.$icon.html(this.opts.buttons.icons[this.name]);
            } else if (this.params.icon === true) {
                this.$icon.addClass(this.prefix + '-icon-' + this.name);
            } else if (this.params.icon.search(/</) !== -1) {
                this.$icon.html(this.params.icon);
            } else {
                this.$icon.addClass(this.prefix + '-icon-' + this.params.icon);
            }
            this.$item.append(this.$icon);
        }
    },
    _buildShortcut: function () {
        if (this.params.shortcut) {
            var meta = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform) ? '<b>&#8984;</b>' : 'ctrl';
            meta = this.params.shortcut.replace('Ctrl', meta);
            this.$shortcut = this.dom('<span>').addClass(this.prefix + '-popup-item-shortcut');
            this.$shortcut.html(meta);
            this.$item.append(this.$shortcut);
        }
    },
    _buildParams: function (params) {
        return globalThis.$ARX.extend({}, true, this.defaults, params);
    },
    _buildActive: function () {
        if (this.params.active) {
            this.$item.addClass('active');
        }
    },
    _buildHidden: function () {
        if (this.params.hidden) {
            this.$item.addClass(this.prefix + '-popup-item-hidden');
        }
    },
    _buildDivider: function () {
        if (this.params.divider) {
            this.$item.addClass(this.prefix + '-popup-item-divider-' + this.params.divider);
        }
    },
    _buildCommand: function () {
        if (this.params.command) {
            this.$item.on('click.' + this.prefix + '-popup-item-' + this.uuid, this._catch.bind(this));
            this.$item.attr('data-command', this.params.command);
        }
    },
    _buildRemover: function () {
        if (!this.params.title) return;
        if (this.params.remover) {
            var $trash = this.dom('<span>').addClass(this.prefix + '-popup-item-trash ' + this.prefix + '-icon-trash');
            $trash.attr('data-command', this.params.remover);
            $trash.on('click.' + this.prefix + '-popup-item-' + this.uuid, this._catchRemover.bind(this));
            this.$item.append($trash);
        }
    },
    _catchRemover: function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $item = this.dom(e.target).closest('.' + this.prefix + '-popup-stack-item');
        var $trash = this.dom(e.target).closest('.' + this.prefix + '-popup-item-trash');
        var command = $trash.attr('data-command');
        var name = $item.attr('data-name');
        this.app.api(command, this, name);
        $item.fadeOut(200, function ($node) {
            $node.remove();
        });
    },
    _catch: function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $item = this.dom(e.target).closest('.' + this.prefix + '-popup-stack-item');
        var name = $item.attr('data-name');
        var command = $item.attr('data-command');
        this.popup.$items.find('.' + this.prefix + '-popup-stack-item').removeClass('active');
        if (this.params.toggle) {
            $item.addClass('active');
        }
        this.app.api(command, this.getParams(), this, name, e);
    },
};
