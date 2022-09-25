module.exports = {
    mixins: ['tool'],
    type: 'upload',
    input: {
        tag: 'input',
        type: 'hidden',
        classname: '-form-input',
    },
    setValue: function (value) {
        value = value ? value : '';
        if (this.upload) {
            this.upload.setImage(value);
        }
        this.$input.val(value);
    },
    _buildInput: function () {
        this.$tool.append(this.$input);
        this._buildUpload();
    },
    _buildUpload: function () {
        this.$upload = this.dom('<input>').attr('type', 'file');
        this.$tool.append(this.$upload);
        var trigger = {};
        if (this._has('trigger') && this._get('trigger')) {
            trigger = {
                instance: this,
                method: 'trigger',
            };
        }
        this.upload = this.app.create('upload', this.$upload, this.obj.upload, trigger);
    },
};
