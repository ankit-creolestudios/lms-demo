import { Plugin } from 'ckeditor5/src/core';
import { LabeledFieldView, createLabeledInputText } from 'ckeditor5/src/ui';

import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';

export default class ResizeFormUI extends Plugin {
    static get requires() {
        return [ImageResize];
    }

    static get pluginName() {
        return 'ResizeFormUI';
    }

    init() {
        const editor = this.editor,
            viewDocument = editor.editing.view.document;

        this.listenTo(
            viewDocument,
            'click',
            (e, data) => {
                if (this._isSelectedImage(editor.model.document.selection)) {
                    data.preventDefault();

                    e.stop();
                }
            },
            {
                priority: 'high',
            }
        );

        this._createToolbarElement();
    }

    _createToolbarElement() {
        const editor = this.editor,
            t = editor.t;

        editor.ui.componentFactory.add('resizeFormImage', (locale) => {
            const labeledInput = new LabeledFieldView(locale, createLabeledInputText),
                inputField = labeledInput.fieldView;
            labeledInput.label = t('Image width');

            inputField.on('input', () => {
                const value = parseFloat(inputField.element.value.trim());

                if (Number.isNaN(value)) {
                    labeledInput.infoText = t('Enter a valid number');
                } else {
                    labeledInput.infoText = null;
                    editor.execute('resizeImage', { width: `${value}px` });
                }
            });

            return labeledInput;
        });
    }

    _isSelectedImage(selection) {
        const selectedModelElement = selection.getSelectedElement(),
            imageUtils = this.editor.plugins.get('ImageUtils');

        return imageUtils.isImage(selectedModelElement);
    }
}
