module.exports = {
    mixins: ['tool'],
    type: 'segment',
    input: {
        tag: 'input',
        type: 'hidden',
        classname: '-form-input',
    },
    setValue: function (value) {
        this.$segment.find('.' + this.prefix + '-form-segment-item').removeClass('active');
        this.$segment.find('[data-segment=' + value + ']').addClass('active');
        this.$input.val(value);
    },
    _buildInput: function () {
        this.$segment = this.dom('<div>').addClass(this.prefix + '-form-segment');
        var segments = this.obj.segments;
        for (var name in segments) {
            var $segment = this.dom('<span>').addClass(this.prefix + '-form-segment-item');
            $segment.attr('data-segment', name).on('click', this._catchSegment.bind(this));
            if (Object.prototype.hasOwnProperty.call(segments[name], 'icon')) {
                $segment.html(segments[name].icon);
            } else {
                $segment.addClass(this.prefix + '-icon-' + segments[name].prefix + '-' + name);
            }
            this.$segment.append($segment);
        }
        this.$segment.append(this.$input);
        this.$tool.append(this.$segment);
    },
    _catchSegment: function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $item = this.dom(e.target).closest('.' + this.prefix + '-form-segment-item');
        var value = $item.attr('data-segment');
        this.$segment.find('.' + this.prefix + '-form-segment-item').removeClass('active');
        $item.addClass('active');
        this.$input.val(value);
        this.app.api(this.setter, this.popup);
    },
};
