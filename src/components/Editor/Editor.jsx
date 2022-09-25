import React, { Component } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import CustomEditor from 'ckeditor5-custom-build/build/ckeditor';
import throttle from 'lodash/throttle';
import './Editor.scss';

export default class Editor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            toolbarFixed: false,
            charCount: this.getCharCount(props.defaultValue || ''),
        };
    }

    toolbarObserver = null;

    editorConfig = {
        uploadAdapter: {
            uploadUrl: `${process.env.REACT_APP_API_URL}/files`,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        },
        link: {
            decorators: {
                openInNewTab: {
                    mode: 'manual',
                    label: 'Open in a new tab?',
                    defaultValue: true,
                    attributes: {
                        target: '_blank',
                        rel: 'noopener noreferrer',
                    },
                },
            },
        },
        toolbar: {
            viewportTopOffset: 54,
            items: [
                'sourceEditing',
                '|',
                'removeFormat',
                '|',
                'heading',
                'alignment',
                '|',
                'bold',
                'italic',
                'underline',
                'link',
                'bulletedList',
                'numberedList',
                '|',
                'fontSize',
                'fontColor',
                'fontBackgroundColor',
                '|',
                'outdent',
                'indent',
                '|',
                'horizontalLine',
                !this.props?.disableInsertImage && 'uploadImage',
                !this.props?.disableInsertTable && 'insertTable',
                'undo',
                'redo',
            ],
        },
    };

    editor = null;

    toolbarRef = React.createRef();
    editorRef = React.createRef();

    scrollingParent = (node) => {
        if (node == null) {
            return null;
        }
        if (
            node.scrollHeight - 1 > node.clientHeight ||
            getComputedStyle(node).getPropertyValue('overflow-y') === 'scroll'
        ) {
            return node;
        } else {
            return this.scrollingParent(node.parentNode);
        }
    };

    getCharCount = (html) => {
        let doc = new DOMParser().parseFromString(html, 'text/html');
        return doc?.body?.textContent?.length || 0;
    };

    handleChange = (event, editor) => {
        this.setState({ charCount: this.getCharCount(editor.getData()) });
        this.props.onChange({
            target: {
                name: this.props.name,
                value: editor.getData(),
            },
        });
    };

    handleFixedToolbar = ({ width, height, y }) => {
        if (this.toolbarRef.current) {
            if (y <= 47) {
                this.setFixedToolbar({ width, height });
            } else {
                this.unsetFixedToolbar();
            }
        }
    };

    setFixedToolbar = ({ width, height, top }) => {
        if (this.toolbarRef.current) {
            this.toolbarRef.current.style.height = `${height}px`;
            this.toolbarRef.current.firstChild.style.position = 'fixed';
            this.toolbarRef.current.firstChild.style.top = `${top}px`;
            this.toolbarRef.current.firstChild.style.width = `${width}px`;
            this.toolbarRef.current.firstChild.style.border = `1px solid #000`;
            this.toolbarRef.current.firstChild.style.borderRadius = '0px';
            this.toolbarRef.current.firstChild.style.zIndex = '99991';
        }
    };

    unsetFixedToolbar = () => {
        if (this.toolbarRef.current) {
            this.toolbarRef.current.firstChild.setAttribute('style', '');
        }
    };

    fixedToolbarHandler = (scrollingParent) => {
        const toolbarRef = this.toolbarRef.current,
            editorRef = this.editorRef.current;

        if (toolbarRef) {
            const { y: toolbarY, width, height } = toolbarRef.getBoundingClientRect(),
                { y: editorY, height: editorHeight } = editorRef.getBoundingClientRect(),
                { y: parentY } = scrollingParent.getBoundingClientRect();
            if (toolbarY < parentY && !this.state.toolbarFixed && this.state.editorInFocus) {
                this.setFixedToolbar({ width, height, top: parentY });
                this.setState({ toolbarFixed: true });
            }
            if ((toolbarY > parentY || parentY > editorY + editorHeight - height) && this.state.toolbarFixed) {
                this.unsetFixedToolbar();
                this.setState({ toolbarFixed: false });
            }
        }
    };

    onReady = (editor) => {
        this.editor = editor;

        if (this.toolbarRef.current) {
            this.toolbarRef.current.appendChild(editor.ui.view.toolbar.element);
        }

        if (this.editorRef.current) {
            const scrollingParent = this.scrollingParent(this.editorRef.current);

            if (scrollingParent !== null) {
                scrollingParent.addEventListener(
                    'scroll',
                    throttle(() => {
                        this.fixedToolbarHandler(scrollingParent);
                    }, 100)
                );
            }
        }
    };

    onError = ({ willEditorRestart }) => {
        if (willEditorRestart) {
            this.editor.ui.view.toolbar.element.remove();
        }
    };

    onFocus = () => {
        this.setState({ editorInFocus: true });

        if (this.editorRef.current) {
            const scrollingParent = this.scrollingParent(this.editorRef.current);
            this.fixedToolbarHandler(scrollingParent);
        }
    };

    onBlur = () => {
        this.setState({ editorInFocus: false });
    };

    render() {
        return (
            <div className='editor-wrapper' ref={this.editorRef}>
                <div className='editor-wrapper__toolbar' ref={this.toolbarRef}></div>
                <CKEditor
                    config={this.editorConfig}
                    editor={CustomEditor}
                    data={this.props.defaultValue}
                    onReady={this.onReady}
                    onError={this.onError}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    onChange={this.handleChange}
                />
                {!this.props.noCharCount && <span className='ckeditor-char-counter'>{this.state.charCount}</span>}
            </div>
        );
    }
}
