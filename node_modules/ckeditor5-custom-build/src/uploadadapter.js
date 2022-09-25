class MyUploadAdapter {
    constructor(loader, settings) {
        this.loader = loader;
        this.url = settings.uploadUrl;
        this.headers = settings.headers;
    }

    upload() {
        return this.loader.file.then(
            (file) =>
                new Promise((resolve, reject) => {
                    this._initRequest(file);
                    this._sendRequest(resolve, reject, file);
                })
        );
    }

    abort() {
        if (this.request) {
            this.controller.abort();
            this.request = null;
        }
    }

    _initRequest(file) {
        const controller = (this.controller = new AbortController()),
            { signal } = controller.signal,
            body = new FormData();

        body.append('file', file);

        this.request = fetch(this.url, {
            method: 'POST',
            signal,
            headers: this.headers,
            body,
        });
    }

    async _sendRequest(resolve, reject, file) {
        try {
            const response = await this.request,
                { success, message, data } = await response.json();

            if (success) {
                resolve({
                    default: data.url[1],
                    id: data.fileId,
                });
            } else {
                reject(message);
            }
        } catch (e) {
            if (e.name === 'AbortError') {
                reject();
            }

            reject(`Couldn't upload file: ${file.name}.`);
        }
    }
}

export default function UploadAdapter(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new MyUploadAdapter(loader, editor.config.get('uploadAdapter'));
    };
}
