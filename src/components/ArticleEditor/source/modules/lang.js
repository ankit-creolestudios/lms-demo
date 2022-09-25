module.exports = {
    init: function () {
        this.langKey = this.app.setting.get('editor.lang');
        this.vars = this._build();
    },
    get: function (name) {
        var value = this._get(name, this.vars);
        if (typeof value === 'undefined' && this.langKey !== 'en') {
            value = this._get(name, globalThis.$ARX.lang['en']);
        }
        return typeof value === 'undefined' ? '' : value;
    },
    parse: function (str) {
        if (typeof str !== 'string') return str;
        var matches = str.match(/## (.*?) ##/g);
        if (matches) {
            for (var i = 0; i < matches.length; i++) {
                var key = matches[i].replace(/^##\s/g, '').replace(/\s##$/g, '');
                str = str.replace(matches[i], this.get(key));
            }
        }
        return str;
    },
    _get: function (name, vars) {
        var value;
        var arr = name.split('.');
        if (arr.length === 1) value = vars[name];
        else value = typeof vars[arr[0]] !== 'undefined' ? vars[arr[0]][arr[1]] : undefined;
        return value;
    },
    _build: function () {
        var vars = globalThis.$ARX.lang['en'];
        if (this.langKey !== 'en') {
            vars = globalThis.$ARX.lang[this.langKey] !== 'undefined' ? globalThis.$ARX.lang[this.langKey] : vars;
        }
        return vars;
    },
};
