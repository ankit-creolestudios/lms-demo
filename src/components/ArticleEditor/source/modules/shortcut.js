module.exports = {
    init: function () {
        if (this.opts.shortcutsRemove) {
            var keys = this.opts.shortcutsRemove;
            for (var i = 0; i < keys.length; i++) {
                this.remove(keys[i]);
            }
        }
        this.shortcuts = this.opts.shortcuts;
        this.hotkeys = {
            8: 'backspace',
            9: 'tab',
            10: 'return',
            13: 'return',
            16: 'shift',
            17: 'ctrl',
            18: 'alt',
            19: 'pause',
            20: 'capslock',
            27: 'esc',
            32: 'space',
            33: 'pageup',
            34: 'pagedown',
            35: 'end',
            36: 'home',
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down',
            45: 'insert',
            46: 'del',
            59: ';',
            61: '=',
            96: '0',
            97: '1',
            98: '2',
            99: '3',
            100: '4',
            101: '5',
            102: '6',
            103: '7',
            104: '8',
            105: '9',
            106: '*',
            107: '+',
            109: '-',
            110: '.',
            111: '/',
            112: 'f1',
            113: 'f2',
            114: 'f3',
            115: 'f4',
            116: 'f5',
            117: 'f6',
            118: 'f7',
            119: 'f8',
            120: 'f9',
            121: 'f10',
            122: 'f11',
            123: 'f12',
            144: 'numlock',
            145: 'scroll',
            173: '-',
            186: ';',
            187: '=',
            188: ',',
            189: '-',
            190: '.',
            191: '/',
            192: '`',
            219: '[',
            220: '\\',
            221: ']',
            222: "'",
        };
        this.hotkeysShiftNums = {
            '`': '~',
            1: '!',
            2: '@',
            3: '#',
            4: '$',
            5: '%',
            6: '^',
            7: '&',
            8: '*',
            9: '(',
            0: ')',
            '-': '_',
            '=': '+',
            ';': ': ',
            "'": '"',
            ',': '<',
            '.': '>',
            '/': '?',
            '\\': '|',
        };
    },
    add: function (keys, obj) {
        this.shortcuts[keys] = obj;
    },
    remove: function (keys) {
        this.opts.shortcutsBase = this._remove(keys, this.opts.shortcutsBase);
        this.opts.shortcuts = this._remove(keys, this.opts.shortcuts);
    },
    popup: function (params, button) {
        var meta = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform) ? '<b>&#8984;</b>' : 'ctrl';
        var items = {};
        var z = 0;
        z = this._buildPopupItems(items, z, this.opts.shortcutsBase, meta, 'base');
        this._buildPopupItems(items, z, this.opts.shortcuts, meta);
        this.app.popup.create('shortcuts', {
            width: '360px',
            items: items,
        });
        this.app.popup.open({
            button: button,
        });
    },
    handle: function (e) {
        this.triggered = false;
        if (this.shortcuts === false) {
            if ((e.ctrlKey || e.metaKey) && (e.which === 66 || e.which === 73)) {
                e.preventDefault();
            }
            return true;
        }
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
            for (var key in this.shortcuts) {
                this._build(e, key, this.shortcuts[key]);
            }
        }
        return this.triggered;
    },
    _buildPopupItems: function (items, z, shortcuts, meta, type) {
        for (var key in shortcuts) {
            var $item = this.dom('<div>').addClass(this.prefix + '-popup-shortcut-item');
            var title = type === 'base' ? shortcuts[key] : shortcuts[key].title;
            var $title = this.dom('<span>')
                .addClass(this.prefix + '-popup-shortcut-title')
                .html(this.lang.parse(title));
            var $kbd = this.dom('<span>').addClass(this.prefix + '-popup-shortcut-kbd');
            var name = type === 'base' ? key.replace('meta', meta) : shortcuts[key].name.replace('meta', meta);
            var arr = name.split('+');
            for (var i = 0; i < arr.length; i++) {
                arr[i] = '<span>' + arr[i] + '</span>';
            }
            $kbd.html(arr.join('+'));
            $item.append($title);
            $item.append($kbd);
            items[z] = {
                html: $item,
            };
            z++;
        }
        return z;
    },
    _build: function (e, str, obj) {
        var keys = str.split(',');
        var len = keys.length;
        for (var i = 0; i < len; i++) {
            if (typeof keys[i] === 'string' && !Object.prototype.hasOwnProperty.call(obj, 'trigger')) {
                this._handler(e, keys[i].trim(), obj);
            }
        }
    },
    _handler: function (e, keys, obj) {
        keys = keys.toLowerCase().split(' ');
        var special = this.hotkeys[e.keyCode];
        var character = e.which !== 91 ? String.fromCharCode(e.which).toLowerCase() : false;
        var modif = '',
            possible = {};
        var cmdKeys = ['meta', 'ctrl', 'alt', 'shift'];
        for (var i = 0; i < cmdKeys.length; i++) {
            var specialKey = cmdKeys[i];
            if (e[specialKey + 'Key'] && special !== specialKey) {
                modif += specialKey + '+';
            }
        }
        if (e.keyCode === 93) {
            modif += 'meta+';
        }
        if (special) possible[modif + special] = true;
        if (character) {
            possible[modif + character] = true;
            possible[modif + this.hotkeysShiftNums[character]] = true;
            if (modif === 'shift+') {
                possible[this.hotkeysShiftNums[character]] = true;
            }
        }
        var len = keys.length;
        for (var z = 0; z < len; z++) {
            if (possible[keys[z]]) {
                e.preventDefault();
                this.triggered = true;
                this.app.api(obj.command, obj.params, e);
                return;
            }
        }
    },
    _remove: function (keys, obj) {
        return Object.keys(obj).reduce(function (object, key) {
            if (key !== keys) {
                object[key] = obj[key];
            }
            return object;
        }, {});
    },
};
