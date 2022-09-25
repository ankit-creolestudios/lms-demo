module.exports = {
    isMobile: function () {
        return /(iPhone|iPad|iPod|Android)/.test(navigator.userAgent);
    },
    createInvisibleChar: function () {
        return document.createTextNode(this.opts.markerChar);
    },
    searchInvisibleChars: function (str) {
        return str.search(/^\uFEFF$/g);
    },
    removeInvisibleChars: function (str) {
        return str.replace(/\uFEFF/g, '');
    },
    wrap: function (html, func) {
        var $w = this.dom('<div>').html(html);
        func($w);
        html = $w.html();
        $w.remove();
        return html;
    },
    extendArray: function (arr, extend) {
        arr = arr.concat(arr);
        if (extend) {
            for (var i = 0; i < extend.length; i++) {
                arr.push(extend[i]);
            }
        }
        return arr;
    },
    removeFromArrayByValue: function (arr, val) {
        val = Array.isArray(val) ? val : [val];
        var index;
        for (var i = 0; i < val.length; i++) {
            index = arr.indexOf(val[i]);
            if (index > -1) arr.splice(index, 1);
        }
        return arr;
    },
    sumOfArray: function (arr) {
        return arr.reduce(function (a, b) {
            return parseInt(a) + parseInt(b);
        }, 0);
    },
    getObjectIndex: function (obj, key) {
        return Object.keys(obj).indexOf(key);
    },
    insertToObject: function (key, value, obj, pos) {
        return Object.keys(obj).reduce(function (ac, a, i) {
            if (i === pos) ac[key] = value;
            ac[a] = obj[a];
            return ac;
        }, {});
    },
    getRandomId: function () {
        var id = '';
        var possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
        for (var i = 0; i < 12; i++) {
            id += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return id;
    },
    escapeRegExp: function (s) {
        return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    },
    capitalize: function (str) {
        str = str.toLowerCase();
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    extendData: function (data, obj) {
        for (var key in obj) {
            if (key === 'elements') {
                data = this._extendDataElements(data, obj[key]);
            } else {
                data = this._setData(data, key, obj[key]);
            }
        }
        return data;
    },
    _extendDataElements: function (data, value) {
        this.dom(value).each(
            function ($node) {
                if ($node.get().tagName === 'FORM') {
                    var serializedData = $node.serialize(true);
                    for (var z in serializedData) {
                        data = this._setData(data, z, serializedData[z]);
                    }
                } else {
                    var name = $node.attr('name') ? $node.attr('name') : $node.attr('id');
                    data = this._setData(data, name, $node.val());
                }
            }.bind(this)
        );
        return data;
    },
    _setData: function (data, name, value) {
        if (data instanceof FormData) data.append(name, value);
        else data[name] = value;
        return data;
    },
};
