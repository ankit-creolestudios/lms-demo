module.exports = {
    init: function () {
        this.opts = this._build();
    },
    dump: function () {
        return this.opts;
    },
    has: function (name) {
        var value;
        var arr = name.split('.');
        if (arr.length === 1) value = typeof this.opts[name] !== 'undefined';
        else value = typeof this.opts[arr[0]] !== 'undefined' && typeof this.opts[arr[1]] !== 'undefined';
        return value;
    },
    set: function (section, name, value) {
        if (typeof this.opts[section] === 'undefined') this.opts[section] = {};
        if (typeof value === 'undefined') this.opts[section] = name;
        else this.opts[section][name] = value;
    },
    get: function (name) {
        var value;
        var arr = name.split('.');
        if (arr.length === 1) value = this.opts[name];
        else value = typeof this.opts[arr[0]] !== 'undefined' ? this.opts[arr[0]][arr[1]] : undefined;
        return value;
    },
    _build: function () {
        var opts = globalThis.$ARX.extend(true, {}, globalThis.$ARX.opts, this.app.initialSettings);
        opts = globalThis.$ARX.extend(true, opts, globalThis.$ARX.settings);
        return opts;
    },
};
