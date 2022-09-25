module.exports = {
    build: function () {
        this._buildFirstLevel();
    },
    is: function () {
        return this.getSelected().length > 1;
    },
    set: function ($block) {
        $block = $block.closest('[data-' + this.prefix + '-first-level]');
        this.unsetNotFirstLevel();
        this._setFocus($block);
        setTimeout(
            function () {
                this.app.selection.removeAllRanges();
            }.bind(this),
            0
        );
        this.app.path.build();
        this.app.toolbar.build();
        this.app.control.close();
        this._checkSelected();
    },
    setFirstLevel: function () {
        this.app.blocks.getFirstLevel().addClass(this.prefix + '-block-focus');
    },
    unset: function () {
        this.getBlocks().removeClass(this.prefix + '-block-focus ' + this.prefix + '-block-multiple-hover');
    },
    unsetNotFirstLevel: function () {
        this.getBlocks()
            .not('[data-' + this.prefix + '-first-level]')
            .removeClass(this.prefix + '-block-focus');
    },
    unsetHover: function () {
        this.getBlocks().removeClass(this.prefix + '-block-multiple-hover');
    },
    getBlocks: function () {
        return this.app.editor.getLayout().find('[data-' + this.prefix + '-type]');
    },
    getFirstLevel: function () {
        return this.app.editor.getLayout().find('[data-' + this.prefix + '-first-level]');
    },
    getEditableBlocks: function () {
        return this.app.editor.getLayout().find('[contenteditable=true]');
    },
    getSelected: function () {
        return this.app.editor.getLayout().find('.' + this.prefix + '-block-focus');
    },
    getFirst: function () {
        return this.getBlocks().first().dataget('instance');
    },
    getFirstSelected: function () {
        return this.getSelected().first().dataget('instance');
    },
    getLast: function () {
        return this.getBlocks().last().dataget('instance');
    },
    getLastSelected: function () {
        return this.getSelected().last().dataget('instance');
    },
    pauseEditableBlocks: function () {
        this.getEditableBlocks()
            .attr('contenteditable', false)
            .addClass(this.prefix + '-editable-pause');
    },
    runEditableBlocks: function () {
        var $blocks = this.app.editor.getLayout().find('.' + this.prefix + '-editable-pause');
        $blocks.attr('contenteditable', true).removeClass(this.prefix + '-editable-pause');
    },
    removeSelected: function (traverse) {
        var last = this.getLastSelected();
        var next;
        if (traverse !== false && last) {
            next = last.getNext();
        }
        this.getSelected().each(this._removeSelectedBlock.bind(this));
        if (next) {
            this.app.block.set(next, 'start');
        }
    },
    _buildFirstLevel: function () {
        var name = 'data-' + this.prefix + '-first-level';
        var $layout = this.app.editor.getLayout();
        $layout.find('[' + name + ']').removeAttr(name);
        $layout.children('[data-' + this.prefix + '-type]').attr(name, true);
    },
    _checkSelected: function () {
        var $all = this.getFirstLevel();
        var $selected = this.getSelected();
        if ($selected.length === 0) {
            this.unsetHover();
            this.app.block.unset();
        } else if ($selected.length === 1) {
            this.unsetHover();
            this.app.block.set($selected.eq(0), false, true);
        } else if ($all.length === $selected.length) {
            this.unsetHover();
            this.app.editor.selectAll();
        } else {
            this.app.editor.unsetSelectAllClass();
        }
    },
    _setFocus: function ($block) {
        var func = $block.hasClass(this.prefix + '-block-focus') ? 'removeClass' : 'addClass';
        $block[func](this.prefix + '-block-focus');
        $block.removeClass(this.prefix + '-block-multiple-hover');
    },
    _removeSelectedBlock: function ($node) {
        var instance = $node.dataget('instance');
        instance.remove({
            traverse: false,
        });
    },
};
