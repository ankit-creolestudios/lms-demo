module.exports = {
    init: function () {
        this.started = false;
        this.storage = false;
        this.state = false;
        this.passed = true;
        this.undoStorage = [];
        this.redoStorage = [];
    },
    load: function () {
        this.clear();
        this.trigger(true);
    },
    stop: function () {
        this.clear();
    },
    clear: function () {
        this.storage = false;
        this.state = false;
        this.passed = true;
        this.undoStorage = [];
        this.redoStorage = [];
    },
    get: function () {
        return this.undoStorage;
    },
    add: function (e) {
        if ((e && (e.ctrlKey || e.metaKey || this._isUndo(e) || this._isRedo(e))) || !this.app.observer.trigger) {
            return;
        }
        this.state = this._createState();
        if (this.started === false) {
            this._setState(this.state, 0);
            this.started = true;
        }
    },
    trigger: function (start) {
        if (!this.passed) {
            return;
        }
        var storage = this._createState();
        if (this.state) {
            storage = this.state;
        } else if (!this.state && !start) {
            storage = this.storage;
            this.started = true;
        }
        this._addState(storage);
        this.storage = this._createState();
        this.state = false;
    },
    listen: function (e) {
        if (this._isUndo(e)) {
            e.preventDefault();
            this.undo();
            return true;
        } else if (this._isRedo(e)) {
            e.preventDefault();
            this.redo();
            return true;
        }
        this.passed = true;
    },
    undo: function () {
        if (!this._hasUndo()) return;
        this.passed = false;
        var state = this._getUndo();
        this._setRedo();
        var $parsed = this.app.parser.parse(state[0]);
        this.app.editor.getLayout().html($parsed.children());
        this._rebuild(state, 'undo');
        var instance = this.app.block.get();
        var el = instance && instance.isEditable() ? instance.getBlock() : false;
        this.app.offset.set(el, state[1]);
    },
    redo: function () {
        if (!this._hasRedo()) return;
        this.passed = false;
        var state = this.redoStorage.pop();
        this._addState(state);
        var $parsed = this.app.parser.parse(state[0]);
        this.app.editor.getLayout().html($parsed.children());
        this._rebuild(state, 'redo');
        var instance = this.app.block.get();
        var el = instance && instance.isEditable() ? instance.getBlock() : false;
        this.app.offset.set(el, state[1]);
    },
    _rebuild: function (state, type) {
        this.app.editor.build();
        this.app.editor
            .getLayout()
            .find('.' + this.prefix + '-block-state')
            .each(
                function ($node) {
                    this.app.block.set($node);
                }.bind(this)
            );
        this.app.broadcast('state.' + type, {
            html: state[0],
            offset: state[1],
        });
    },
    _isUndo: function (e) {
        var key = e.which;
        var ctrl = e.ctrlKey || e.metaKey;
        return ctrl && key === 90 && !e.shiftKey && !e.altKey;
    },
    _isRedo: function (e) {
        var key = e.which;
        var ctrl = e.ctrlKey || e.metaKey;
        return ctrl && ((key === 90 && e.shiftKey) || (key === 89 && !e.shiftKey)) && !e.altKey;
    },
    _hasUndo: function () {
        return this.undoStorage.length !== 0;
    },
    _hasRedo: function () {
        return this.redoStorage.length !== 0;
    },
    _getUndo: function () {
        return this.undoStorage.length === 1 ? this.undoStorage[0] : this.undoStorage.pop();
    },
    _createState: function () {
        var html = this.app.editor.getLayout().html();
        html = this.app.utils.wrap(
            html,
            function ($w) {
                $w.find('.' + this.prefix + '-block-focus').addClass(this.prefix + '-block-state');
            }.bind(this)
        );
        var instance = this.app.block.get();
        var el = instance && instance.isEditable() ? instance.getBlock() : false;
        var unparsed = this.app.parser.unparse(html, true);
        var offset = this.app.offset.get(el);
        return {
            html: unparsed,
            offset: offset,
        };
    },
    _setState: function (state, pos) {
        this.undoStorage[pos] = [state.html, state.offset];
    },
    _addState: function (state) {
        var last = this.undoStorage[this.undoStorage.length - 1];
        if (typeof last === 'undefined' || last[0] !== state.html) {
            this.undoStorage.push([state.html, state.offset]);
            this._removeOverStorage();
        } else {
            last[1] = state.offset;
        }
    },
    _setRedo: function () {
        var state = this._createState();
        this.redoStorage.push([state.html, state.offset]);
        this.redoStorage = this.redoStorage.slice(0, this.opts.state.limit);
    },
    _removeOverStorage: function () {
        if (this.undoStorage.length > this.opts.state.limit) {
            this.undoStorage = this.undoStorage.slice(0, this.undoStorage.length - this.opts.state.limit);
        }
    },
};
