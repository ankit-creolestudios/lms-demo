module.exports = {
    init: function () {
        this.blurclass = this.prefix + '-in-blur';
        this.focusclass = this.prefix + '-in-focus';
    },
    start: function () {
        this._buildMain();
        this._buildContainers(this.$main, this.opts.containers.main);
        this._buildBSModal();
    },
    stop: function () {
        this.$main.remove();
    },
    get: function (name) {
        return this['$' + name];
    },
    setFocus: function () {
        this.$main.removeClass(this.blurclass).addClass(this.focusclass);
    },
    setBlur: function () {
        this.$main.removeClass(this.focusclass).addClass(this.blurclass);
    },
    isFocus: function () {
        return this.$main.hasClass(this.focusclass);
    },
    _buildMain: function () {
        this.$main = this.dom('<div>').attr(this.prefix + '-uuid', this.uuid);
        this.$main.addClass(this.prefix + '-container ' + this.prefix + '-container-' + this.uuid);
        this.app.$element.after(this.$main);
    },
    _buildContainers: function ($target, containers) {
        for (var i = 0; i < containers.length; i++) {
            var name = containers[i];
            var elName = '$' + name;
            this[elName] = this._createContainer(name);
            if (typeof this.opts.containers[name] !== 'undefined') {
                this._buildContainers(this[elName], this.opts.containers[name]);
            }
            $target.append(this[elName]);
        }
    },
    _buildBSModal: function () {
        this.opts.bsmodal = this.$main.closest('.modal-dialog').length !== 0;
    },
    _createContainer: function (name) {
        return this.dom('<div>').addClass(this.prefix + '-' + name + '-container');
    },
};
