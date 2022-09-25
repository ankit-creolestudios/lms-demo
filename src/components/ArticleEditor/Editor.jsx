import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './article-editor.css';
import ArticleEditor from './source/article-editor';
import './source/plugins/imageresize';
import './source/plugins/imageposition';
import './source/plugins/reorder';
import apiCall from '../../helpers/apiCall';

export default class Editor extends Component {
    app = null;

    state = {
        alreadyHadNullValue: false,
        editor: null,
    };

    editorGridPatterns = {
        '1|1': 'flex-item-1|flex-item-1',
        '1|2': 'flex-item-1|flex-item-2',
        '2|1': 'flex-item-1|flex-item-2',
        '1|3': 'flex-item-1|flex-item-3',
        '3|1': 'flex-item-3|flex-item-1',
        '2|3': 'flex-item-2|flex-item-3',
        '3|2': 'flex-item-3|flex-item-2',
        '1|1|1': 'flex-item-1|flex-item-1|flex-item-1',
        '1|2|2': 'flex-item-1|flex-item-2|flex-item-2',
        '1|2|1': 'flex-item-1|flex-item-2|flex-item-1',
        '2|2|1': 'flex-item-2|flex-item-2|flex-item-1',
        '1|1|1|1': 'flex-item-1|flex-item-1|flex-item-1|flex-item-1',
        '1|1|1|2': 'flex-item-1|flex-item-1|flex-item-1|flex-item-2',
        '1|1|2|1': 'flex-item-1|flex-item-1|flex-item-2|flex-item-1',
        '1|2|1|1': 'flex-item-1|flex-item-2|flex-item-1|flex-item-1',
        '2|1|1|1': 'flex-item-2|flex-item-1|flex-item-1|flex-item-1',
        '1|1|1|1|1': 'flex-item-1|flex-item-1|flex-item-1|flex-item-1|flex-item-1',
    };

    componentDidMount() {
        // eslint-disable-next-line react/no-find-dom-node
        this.app = ArticleEditor(ReactDOM.findDOMNode(this), {
            css: '/css/',
            editor: {
                minHeight: this.props.minHeight ? `${this.props.minHeight}px` : '300px',
                add: 'bottom',
            },
            image: {
                upload: this.handleFileUpload,
                newtab: true,
                width: true,
            },
            subscribe: {
                'editor.change': this.handleContentChange,
                'editor.ready': this.handleEditorReady,
            },
            link: {
                target: '_blank',
                nofollow: true,
            },
            grid: {
                classname: 'flex-grid',
                patterns: this.editorGridPatterns,
            },
            plugins: ['imageresize', 'imageposition', 'reorder'],
        });

        if (this.props.disabled) {
            this.app.disable();
        }

        if (this.props.defaultValue) {
            this.app.editor.setContent({ html: this.props.defaultValue });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            !this.state.alreadyHadNullValue &&
            this.props.defaultValue &&
            prevProps.defaultValue !== this.props.defaultValue
        ) {
            this.app.editor.setContent({ html: this.props.defaultValue });
            this.setState({
                alreadyHadNullValue: true,
            });
        }

        if (prevProps.disabled !== this.props.disabled) {
            if (this.props.disabled) {
                this.app.disable();
            }

            if (!this.props.disabled) {
                this.app.enable();
            }
        }
    }

    componentWillUnmount() {
        if (this.app) {
            this.app.destroy();
        }
    }

    handleEditorReady = () => {
        if (this.props.onReady) {
            this.props.onReady(this.app.editor);
        }
    };

    handleContentChange = (e) => {
        this.props.onChange({ target: { name: this.props.name, value: this.app.editor.getContent() } });
    };

    handleFileUpload = async (upload, data) => {
        const files = {};

        for (const key in data.files) {
            if (typeof data.files[key] === 'object') {
                const formData = new FormData();
                formData.append('file', data.files[0], data.files[0].name);

                const { success, response } = await apiCall('POST', '/files', formData);

                if (success) {
                    files[`file-${key}`] = {
                        id: response.fileId,
                        url: response.url,
                    };
                }
            }
        }
        upload.complete(files, data.e);
    };

    render() {
        return <textarea name={this.props.name} />;
    }
}
