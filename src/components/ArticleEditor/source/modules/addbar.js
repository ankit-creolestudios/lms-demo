module.exports = {
    init: function () {
        this.customButtons = {};
    },
    popup: function (params, button) {
        this.app.popup.create('addbar', {
            width: '476px',
            items: this.buildItems(),
        });
        if (this.opts.editor.addbar === 'top') {
            button = false;
        }
        this.app.popup.open({
            button: button,
        });
    },
    buildItems: function () {
        var items = {};
        var obj = globalThis.$ARX.extend(true, this.opts.buttonsObj);
        var arr = this.opts.addbar.concat(this.opts.addbarAdd);
        if (this.opts.addbarAdd.length !== 0 && this.opts.addbarAdd.indexOf('text') !== -1) {
            var tin = arr.indexOf('text');
            var pin = arr.indexOf('paragraph');
            var to = pin !== -1 ? pin + 1 : 0;
            arr.splice(to, 0, arr.splice(tin, 1)[0]);
        }
        for (var i = 0; i < arr.length; i++) {
            var name = arr[i];
            if (this.opts.addbarHide.indexOf(name) !== -1) continue;
            items[name] = obj[name];
        }
        var customItems = globalThis.$ARX.extend(true, this.customButtons);
        var instance = this.app.block.get();
        for (var key in customItems) {
            items[key] = customItems[key];
        }
        for (var index in items) {
            this._buildItem(instance, items, items[index], index);
        }
        return items;
    },
    add: function (name, obj) {
        this.customButtons[name] = obj;
    },
    _buildItem: function (instance, items, item, key) {
        if ((item.blocks && !instance) || (instance && item.blocks && !instance.isAllowedButton(key, item))) {
            items[key] = false;
            return;
        }
        items[key] = {
            container: true,
            addbar: true,
            title: item.title,
            icon: item.icon || key,
            command: item.command,
            observer: item.observer || false,
            params: {
                name: key,
            },
        };
    },
};
