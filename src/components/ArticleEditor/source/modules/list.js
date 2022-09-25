module.exports = {
    indent: function () {
        var sel = this.app.selection.get();
        var item = this.app.selection.getBlock();
        var $item = this.dom(item);
        var $prev = $item.prevElement();
        var prev = $prev.get();
        var isIndent = sel.collapsed && item && prev && prev.tagName === 'LI';
        this.app.selection.save(item);
        if (isIndent) {
            $prev = this.dom(prev);
            var $prevChild = $prev.children('ul, ol');
            var $list = $item.closest('ul, ol');
            if ($prevChild.length !== 0) {
                $prevChild.append($item);
            } else {
                var listTag = $list.get().tagName.toLowerCase();
                var $newList = this.dom('<' + listTag + '>');
                $newList.append($item);
                $prev.append($newList);
            }
        }
        this.app.selection.restore();
        return isIndent;
    },
    outdent: function () {
        var sel = this.app.selection.get();
        var item = this.app.selection.getBlock();
        var $item = this.dom(item);
        var isOutdent = false;
        if (sel.collapsed && item) {
            var $listItem = $item.parent();
            var $liItem = $listItem.closest('li');
            var $prev = $item.prevElement();
            var $next = $item.nextElement();
            var prev = $prev.get();
            var next = $next.get();
            var nextItems, $newList;
            var isTop = prev === false;
            var isMiddle = prev !== false && next !== false;
            this.app.selection.save(item);
            if ($liItem.length !== 0) {
                if (isMiddle) {
                    nextItems = this._getAllNext($item.get());
                    $newList = this.dom('<' + $listItem.get().tagName.toLowerCase() + '>');
                    for (var i = 0; i < nextItems.length; i++) {
                        $newList.append(nextItems[i]);
                    }
                    $liItem.after($item);
                    $item.append($newList);
                } else {
                    $liItem.after($item);
                    if ($listItem.children().length === 0) {
                        $listItem.remove();
                    } else {
                        if (isTop) $item.append($listItem);
                    }
                }
                isOutdent = true;
            }
            this.app.selection.restore();
        }
        return isOutdent;
    },
    _getAllNext: function (next) {
        var nodes = [];
        while (next) {
            var $next = this.dom(next).nextElement();
            next = $next.get();
            if (next) nodes.push(next);
            else return nodes;
        }
        return nodes;
    },
};
