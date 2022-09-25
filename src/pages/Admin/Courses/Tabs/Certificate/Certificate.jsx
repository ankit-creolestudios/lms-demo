import React, { Component } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Rnd } from 'react-rnd';
import { withRouter } from 'react-router-dom';
import uuid from 'react-uuid';
import { FileUpload } from 'src/components/FileUpload';
import { Spinner } from 'src/components/Spinner';
import './Certificate.scss';
import { ReportingFields } from '../Reporting/ReportingFields';
import { Api } from 'src/helpers/new';
import moment from 'moment';
import { pdfjs } from 'react-pdf';
import DatePicker from 'src/components/DatePicker/DatePicker';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;

class Certificate extends Component {
    state = {
        fieldValuesArray: {
            '': '',
            custom: '',
            lastName: '{{Lastname}}',
            firstName: '{{Firstname}}',
            email: 'name@email.com',
            phoneNumber: 1234567890,
            addressLineOne: '{{Address Line 1}}',
            addressLineTwo: '{{Address Line 2}}',
            townCity: '{{Address City}}',
            state: '{{Address State}}',
            zipCode: 123456,
            title: '{{Course Title}}',
            startDate: '06/25/2023',
            completedAt: '07/25/2023',
            creationDate: '01/31/2021',
            ssnKey: '{{AAA-GG-SSSS}}',
            dobKey: '01/31/2000',
            certificateExpiryDate: '10/10/2022',
            status: 'PASS',
            score: 30,
            creationDate: '06/20/2022',
            examTitle: 'Unit Test',
        },
        title: '',
        backgroundUrl: null,
        certificateFile: null,
        scale: 1,
        backgroundWidth: 0,
        backgroundHeight: 0,
        backgroundCenter: false,
        originalWidth: 0,
        originalHeight: 0,
        editorContent: '',
        blockCounter: 1,
        blocks: [],
        loading: true,
        preview: false,
        course: {},
        currentImageUrl: '',
        generatePdfLoading: false,
        fontFaces: [],
        fontFamily: 'Arial',
        fontSize: 12,
        certificateExpiryDays: 0,
        availableVariables: {
            user: ['user.firstName', 'user.lastName', 'user.email'],
            website: ['website.title', 'website.url'],
        },
        availableDataTargets: [],
        fields: [],
        newBlockAdded: false,
        certificateFileId: null,
        fileLoading: false,
    };

    worktableRef = React.createRef();

    handleCKEditorChange = (id, value) => {
        this.setState({
            [`block_${id}_content`]: value,
        });
    };

    async componentDidMount() {
        const { response } = await Api.call('GET', `/courses/${this.props.match.params.courseId}`);
        const res = await Api.call('GET', 'courses/certificate/font-faces');
        if (res.success) {
            this.setState({
                fontFaces: res.response,
            });
        }
        this.setState({
            course: response,
        });

        this.props.pushBreadcrumbLink({
            text: 'Courses',
            path: '/admin/courses',
        });
        this.props.pushBreadcrumbLink({
            text: `Course: ${this.state.course.title}`,
            path: `/admin/courses/${this.props.match.params.courseId}`,
        });

        this.getCourseCertificate();
        this.fetchavAilableDataTargets();
    }

    fetchavAilableDataTargets = async () => {
        const { success, response } = await Api.call('GET', `/courses/certificate/targets`);
        if (success) {
            this.setState({ availableDataTargets: response });
        }
    };

    readFileData = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            reader.onerror = (err) => {
                reject(err);
            };
            reader.readAsDataURL(file);
        });
    };

    convertPdfToImages = async (file) => {
        let image = null;
        const data = await this.readFileData(file);
        const pdf = await pdfjs.getDocument(data).promise;
        const canvas = document.createElement('canvas');
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        image = canvas.toDataURL();
        canvas.remove();
        return image;
    };

    getCourseCertificate = async () => {
        const {
            response: {
                title,
                image,
                blocks,
                fontFace,
                fontSize,
                certificateExpiryDate,
                certificateFileId,
                certificateExpiryDays,
            },
            success,
            message,
        } = await Api.call('GET', `/courses/${this.props.match.params.courseId}/certificate`);
        if (success) {
            this.setState({
                title: title,
                currentImageUrl: Array.isArray(image) ? image[0] : image,
                fontFamily: fontFace ?? 'Arial',
                fontSize: fontSize ?? 12,
                certificateExpiryDate: moment(certificateExpiryDate).format('MM/DD/YYYY'),
                certificateExpiryDays:
                    certificateExpiryDays ??
                    Math.ceil(moment.duration(moment(certificateExpiryDate).diff(moment())).asDays()),
                certificateFileId: certificateFileId ? certificateFileId : null,
            });
            this.calculateWorkTableData(image, title, blocks);
        } else {
            const { success } = await Api.call('PUT', `/courses/${this.props.match.params.courseId}/certificate`, {
                title: 'default certificate',
                fontFace: 'Arial',
            });
            if (success) {
                this.getCourseCertificate();
            } else {
                this.props.setGlobalAlert({
                    type: 'error',
                    message,
                });
            }
        }
    };

    componentWillUnmount = () => {
        this.props.removeBreadcrumbLink({
            text: 'Courses',
            path: '/admin/courses',
        });
        this.props.removeBreadcrumbLink({
            text: `Course: ${this.state.course.title}`,
            path: `/admin/courses/${this.props.match.params.courseId}`,
        });
    };

    handleFileChangeApi = async (file) => {
        this.setState({
            fileLoading: true,
        });
        const fileData = new FormData();
        fileData.append('file', file);
        const { success, response, message } = await Api.call('POST', '/files', fileData);
        if (success) {
            const mainUrl = Array.isArray(response.url) ? response.url[1] : response.url;
            this.calculateWorkTableData(mainUrl);
            this.setState({
                currentImageUrl: mainUrl,
                certificateFileId: response.fileId,
            });
            this.state.blocks.map((id, index) => {
                this.setState({
                    [`block_${id}_x`]: 0,
                    [`block_${id}_y`]: 50 * index,
                });
            });
        }
        this.setState({
            fileLoading: false,
        });
    };

    getPage = (num) => {
        return new Promise((resolve, reject) => {
            this.pdf.getPage(num).then((page) => {
                const scale = '1.5';
                const viewport = page.getViewport({
                    scale: scale,
                });
                const canvas = document.createElement('canvas');
                const canvasContext = canvas.getContext('2d');
                canvas.height = viewport.height || viewport.viewBox[3];
                canvas.width = viewport.width || viewport.viewBox[2];
                page.render({
                    canvasContext,
                    viewport,
                }).promise.then((res) => {
                    resolve(canvas.toDataURL());
                });
            });
        });
    };

    handleFileChange = async (type, url, file) => {
        if (file.type === 'application/pdf') {
            pdfjs.getDocument(url).promise.then((pdf) => {
                const pages = [];
                this.pdf = pdf;
                this.getPage(1).then((result) => {
                    let arr = result.split(','),
                        mime = arr[0].match(/:(.*?);/)[1],
                        bstr = atob(arr[1]),
                        n = bstr.length,
                        u8arr = new Uint8Array(n);
                    while (n--) {
                        u8arr[n] = bstr.charCodeAt(n);
                    }
                    const ObjData = new File([u8arr], file.name.slice(0, -4), { type: mime });
                    this.handleFileChangeApi(ObjData);
                });
            });
        } else {
            this.handleFileChangeApi(file);
        }
    };

    calculateWorkTableData = (url, title = null, newBlocks = null) => {
        const img = new Image(),
            self = this;
        let backgroundHeight, backgroundWidth;
        img.onload = function () {
            let vScale,
                hScale,
                backgroundCenter = false;

            backgroundWidth = this.width;
            backgroundHeight = this.height;
            backgroundCenter = true;

            const newState = {
                backgroundWidth,
                backgroundHeight,
                backgroundCenter,
                backgroundUrl: url,
                originalWidth: this.width,
                originalHeight: this.height,
                scale: vScale ? Math.min(hScale, vScale) : 1,
            };
            if (title) {
                newState.title = title;
            }
            if (newBlocks) {
                const blocks = [];
                const fields = [];
                for (const block of newBlocks) {
                    const id = uuid();
                    fields.push({
                        id,
                        title: block?.key,
                        data:
                            block?.data?.length > 0 ? block?.data : [{ target: 'custom', options: { type: 'string' } }],
                    });
                    blocks.push(id);

                    for (const key of Object.keys(block)) {
                        newState[`block_${id}_${key}`] = block[key];
                    }
                }
                newState.blocks = blocks;
                newState.fields = fields;
            }
            self.setState(newState);
        };
        img.src = url;
        this.setState({ loading: false });
    };

    addCustomBlock = () => {
        const { blocks, blockCounter } = this.state,
            id = uuid();
        blocks.unshift(id);
        this.setState({
            blocks,
            [`block_${id}_key`]: `unique_${blockCounter}`,
            [`block_${id}_content`]: '',
            [`block_${id}_x`]: 0,
            [`block_${id}_y`]: 0,
            [`block_${id}_width`]: 0,
            [`block_${id}_height`]: 0,
            blockCounter: blockCounter + 1,
        });
    };

    removeCustomBlock = (id) => {
        const { blocks } = this.state;
        blocks.splice(id, 1);
        this.setState({
            blocks,
            [`block_${id}_key`]: undefined,
            [`block_${id}_content`]: undefined,
            [`block_${id}_x`]: undefined,
            [`block_${id}_y`]: undefined,
            [`block_${id}_width`]: undefined,
            [`block_${id}_height`]: undefined,
        });
    };

    setCustomBlockPosition = (id, { x, y }) => {
        const { scale } = this.state;
        this.setState({
            [`block_${id}_x`]: (x * scale).cleanRound(2),
            [`block_${id}_y`]: (y * scale).cleanRound(2),
        });
    };

    setCustomBlockSize = (id, ref, { x, y }) => {
        const { scale } = this.state,
            computedStyles = window.getComputedStyle(ref);

        this.setState({
            [`block_${id}_x`]: (x * scale).cleanRound(2),
            [`block_${id}_y`]: (y * scale).cleanRound(2),
            [`block_${id}_width`]: (parseInt(computedStyles.getPropertyValue('width').slice(0, -2)) * scale).cleanRound(
                2
            ),
            [`block_${id}_height`]: (
                parseInt(computedStyles.getPropertyValue('height').slice(0, -2)) * scale
            ).cleanRound(2),
        });
    };

    submitCertificateChanges = async (e) => {
        if (this.state.currentImageUrl !== '') {
            e.preventDefault();
            const blocks = this.state.blocks.map((id) => ({
                    key: this.state[`block_${id}_key`],
                    content: this.state[`block_${id}_content`],
                    x: this.state[`block_${id}_x`],
                    y: this.state[`block_${id}_y`],
                    width: this.state[`block_${id}_width`],
                    height: this.state[`block_${id}_height`],
                    data: this.state[`block_${id}_data`],
                })),
                { success, message } = await Api.call(
                    'PATCH',
                    `/courses/${this.props.match.params.courseId}/certificate`,
                    {
                        fontFace: this.state.fontFamily,
                        fontSize: this.state.fontSize,
                        title: this.state.title,
                        certificateExpiryDays: this.state.certificateExpiryDays,
                        blocks,
                        certificateFileId: this.state.certificateFileId,
                    }
                );

            this.props.setGlobalAlert({
                type: success ? 'success' : 'error',
                message,
            });
        } else {
            this.props.setGlobalAlert({
                type: 'error',
                message: 'Please select a background image',
            });
        }
    };

    handleInputChange = (e) => {
        const input = e.target;
        this.setState({
            [input.name]: input.value,
        });
    };

    toggleCertificatePreview = () => {
        this.setState({
            preview: !this.state.preview,
        });
    };

    generateCertificate = async () => {
        this.setState({
            generatePdfLoading: true,
        });
        const { raw } = await Api.call(
            'GET',
            `/courses/${this.props.match.params.courseId}/certificate/admin-generate`
        );
        const blob = await (await fetch(raw)).blob();
        const certificateUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = certificateUrl;
        link.download = 'certificate' + '.pdf';
        link.click();
        // window.open(certificateUrl, '_blank');
        this.setState({
            generatePdfLoading: false,
        });
    };

    handleFieldChange = (fields) => {
        this.setState({ fields });
    };

    addNewBlock = (fields) => {
        const newAddedField = fields[fields.length - 1];
        const { blocks, blockCounter } = this.state,
            id = newAddedField.id;
        const content = this.updateContent(newAddedField?.data, id);
        blocks.push(id);

        this.setState({
            blocks,
            [`block_${id}_key`]: newAddedField?.title,
            [`block_${id}_content`]: content,
            [`block_${id}_x`]: 0,
            [`block_${id}_y`]: 50 * this.state.fields.length ?? 0,
            [`block_${id}_width`]: 200,
            [`block_${id}_height`]: 50,
            [`block_${id}_data`]: newAddedField?.data,
            blockCounter: blockCounter + 1,
        });
    };

    updateBlock = (field, value) => {
        const { blocks } = this.state;
        const id = field.id;
        const content = this.updateContent(field?.data, id, value);
        this.setState({
            blocks,
            [`block_${id}_key`]: field?.title,
            [`block_${id}_data`]: field?.data,
            [`block_${id}_content`]: content,
        });
    };

    removeBlock = (fieldIndex) => {
        const { blocks } = this.state;
        let field = this.state.fields[fieldIndex];
        let id = field.id;
        let newBlocks = blocks.filter((block) => block !== id);
        this.setState({
            blocks: newBlocks,
            [`block_${id}_key`]: undefined,
            [`block_${id}_content`]: undefined,
            [`block_${id}_x`]: undefined,
            [`block_${id}_y`]: undefined,
            [`block_${id}_width`]: undefined,
            [`block_${id}_height`]: undefined,
            [`block_${id}_data`]: undefined,
        });
    };

    dragAndDrop = (fields) => {
        let blockIds = [];
        fields.map((field) => {
            blockIds.push(field.id.toString());
        });
        this.setState({ blocks: blockIds });
    };

    updateContent = (data, id, value) => {
        let finalContent = '';
        data.forEach((source) => {
            let sourceVal = this.state.fieldValuesArray?.[source.target];
            const options = source.options;
            if (sourceVal !== undefined && sourceVal !== null && options) {
                if (options.type === 'string' && options.capitalisation) {
                    sourceVal = this.capitalisation(options.capitalisation, sourceVal);
                } else if (source.target === 'certificateExpiryDate') {
                    const format = options.dateFormat ?? 'MM/DD/YYYY';
                    sourceVal = moment().add(parseInt(value), 'days').format(format);
                } else if (options.type === 'date') {
                    const format = options.dateFormat ?? 'MM/DD/YYYY';
                    sourceVal = moment(sourceVal).format(format);
                }
                if (options.prependString) {
                    sourceVal = options.prependString + sourceVal;
                }
                if (options.appendString) {
                    sourceVal = sourceVal + options.appendString;
                }
            }
            finalContent = finalContent + sourceVal;
        });

        return finalContent;
    };

    capitalisation(options, sourceVal) {
        switch (options) {
            case 'none':
                break;
            case 'capitalise':
                sourceVal = sourceVal.charAt(0).toUpperCase() + sourceVal.slice(1);
                break;
            case 'uppercase':
                sourceVal = sourceVal.toUpperCase();
                break;
            case 'lowercase':
                sourceVal = sourceVal.toLowerCase();
                break;
        }
        return sourceVal;
    }

    handleFontFamilyChange = (e) => {
        this.setState({
            fontFamily: e?.target?.value,
        });
    };

    handleFontSizeChange = (e) => {
        this.setState({
            fontSize: e?.target?.value,
        });
    };

    handlecertificateExpiryDays = (e) => {
        const positiveDays = Math.abs(e?.target?.value);
        this.setState({
            certificateExpiryDays: parseInt(positiveDays),
            certificateExpiryDate: moment().add(parseInt(positiveDays), 'days').format('MM/DD/YYYY'),
            fieldValuesArray: {
                ...this.state.fieldValuesArray,
                certificateExpiryDate: moment().add(parseInt(positiveDays), 'days').format('MM/DD/YYYY'),
            },
        });
        this.state.fields.forEach((field) => this.updateBlock(field, positiveDays));
    };

    render() {
        const { scale, fields, availableDataTargets, generatePdfLoading, fileLoading } = this.state;
        return this.state.loading ? (
            <div className='cb p-4' ref={this.worktableRef}>
                <Spinner />
            </div>
        ) : (
            <form className='cb p-4' ref={this.worktableRef}>
                <div className='mb-4 certificate-button-row'>
                    <Button
                        type='submit'
                        variant='primary'
                        disabled={fileLoading}
                        onClick={this.submitCertificateChanges}
                    >
                        {fileLoading ? 'Loading...' : 'Save'}
                    </Button>
                    <Button variant='primary' disabled={generatePdfLoading} onClick={this.generateCertificate}>
                        {generatePdfLoading ? 'Loading...' : 'Generate'}
                    </Button>
                    <Button variant='secondary' onClick={this.toggleCertificatePreview}>
                        {this.state.preview ? 'Editing Mode' : 'Preview Mode'}
                    </Button>
                </div>
                <Row>
                    <Col>
                        <div className='cb__input'>
                            <label htmlFor='title'>Certificate Title</label>
                            <input
                                type='text'
                                id='title'
                                name='title'
                                value={this.state.title}
                                onChange={this.handleInputChange}
                            />
                        </div>
                    </Col>
                    <Col>
                        <div className='cb__input cb__input--image-upload'>
                            <FileUpload
                                name='background'
                                url={this.state.backgroundUrl}
                                accept={'.png,.jpg,.jpeg,.svg,.pdf'}
                                label='Certificate Background'
                                handleFileChange={this.handleFileChange}
                            />
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div className='cb__input'>
                            <label htmlFor='fontFamily'>Font Family</label>
                            <select
                                type='text'
                                name='fontFamily'
                                value={this.state.fontFamily}
                                onChange={this.handleFontFamilyChange}
                            >
                                {this.state.fontFaces.map((font, i) => (
                                    <option key={i}>{font}</option>
                                ))}
                            </select>
                        </div>
                    </Col>
                    <Col>
                        <div className='cb__input'>
                            <label htmlFor='fontSize'>Font Size</label>
                            <select
                                type='text'
                                name='fontSize'
                                value={this.state.fontSize}
                                onChange={this.handleFontSizeChange}
                            >
                                {Array(17)
                                    .fill()
                                    .map((_, idx) => 8 + idx)
                                    .map((num, i) => (
                                        <option key={i}>{num}</option>
                                    ))}
                            </select>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <div className='cb__input'>
                            <label htmlFor='title'>Certificate Expiry Days</label>
                            <input
                                min={0}
                                type='number'
                                name='certificateExpiryDays'
                                value={Number(this.state.certificateExpiryDays).toString()}
                                onChange={this.handlecertificateExpiryDays}
                            />
                        </div>
                    </Col>
                </Row>
                <div
                    className='cb__worktable my-4'
                    style={{
                        backgroundImage: `url(${JSON.stringify(this.state.backgroundUrl)})`,
                        height: this.state.backgroundHeight === 0 ? 'auto' : `${this.state.backgroundHeight}px`,
                        width: this.state.backgroundWidth === 0 ? 'auto' : `${this.state.backgroundWidth}px`,
                        backgroundSize: `${this.state.backgroundWidth}px ${this.state.backgroundHeight}px`,
                        backgroundPosition: this.state.backgroundCenter ? 'center' : 'auto',
                    }}
                >
                    {!this.state.backgroundUrl ? (
                        <div className='cb__worktable__empty'>Upload a certificate background to get started</div>
                    ) : (
                        this.state.blocks.map((id) =>
                            this.state.preview ? (
                                <div
                                    key={id}
                                    style={{
                                        position: 'absolute',
                                        left: this.state[`block_${id}_x`].cleanRound(2) / scale + 'px',
                                        top: this.state[`block_${id}_y`].cleanRound(2) / scale + 'px',
                                        width: this.state[`block_${id}_width`].cleanRound(2) / scale + 'px',
                                        height: this.state[`block_${id}_height`].cleanRound(2) / scale + 'px',
                                        fontFamily: this.state.fontFamily,
                                        fontSize: this.state.fontSize + 'px',
                                    }}
                                    dangerouslySetInnerHTML={{
                                        __html: this.state[`block_${id}_content`],
                                    }}
                                ></div>
                            ) : (
                                <Rnd
                                    position={{
                                        x: this.state[`block_${id}_x`].cleanRound(2) / scale,
                                        y: this.state[`block_${id}_y`].cleanRound(2) / scale,
                                    }}
                                    style={{
                                        fontFamily: this.state.fontFamily,
                                        fontSize: this.state.fontSize + 'px',
                                    }}
                                    key={id}
                                    default={{
                                        x: this.state[`block_${id}_x`].cleanRound(2) / scale,
                                        y: this.state[`block_${id}_y`].cleanRound(2) / scale,
                                        width: this.state[`block_${id}_width`].cleanRound(2) / scale,
                                        height: this.state[`block_${id}_height`].cleanRound(2) / scale,
                                    }}
                                    bounds='parent'
                                    className='cb__worktable__block'
                                    onDragStop={(e, d) => {
                                        this.setCustomBlockPosition(id, d);
                                    }}
                                    onResizeStop={(e, direction, ref, delta, position) => {
                                        this.setCustomBlockSize(id, ref, position);
                                    }}
                                >
                                    <span>{this.state[`block_${id}_key`]}</span>
                                </Rnd>
                            )
                        )
                    )}
                </div>
                <Row className='pt-4'>
                    <ReportingFields
                        onChange={this.handleFieldChange}
                        fields={fields}
                        availableDataTargets={availableDataTargets}
                        addNewSource={this.addNewBlock}
                        updateSource={this.updateBlock}
                        removeSource={this.removeBlock}
                        dragAndDrop={this.dragAndDrop}
                        isPdf={false}
                    />
                </Row>
            </form>
        );
    }
}

export default connect(null, {
    pushBreadcrumbLink: (payload) => ({
        type: 'PUSH_BREADCRUMB_LINK',
        payload,
    }),
    removeBreadcrumbLink: (payload) => ({
        type: 'REMOVE_BREADCRUMB_LINK',
        payload,
    }),
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(withRouter(Certificate));
