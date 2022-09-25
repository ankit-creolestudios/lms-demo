import React, { Component } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Col, Form, FormGroup, Row } from 'react-bootstrap';
import { FileUpload } from '../../../components/FileUpload/';
import { ContentItems } from '../../../components/FormItems';
import { Spinner } from '../../../components/Spinner';
import apiCall from '../../../helpers/apiCall';
import { RouteLeavingGuard } from '../../../components/RouteLeavingGuard';
import ReactTooltip from 'react-tooltip';
import { BsInfoCircle } from 'react-icons/bs';
import apiFile from '../../../helpers/apiFile';
import DatePicker from '../../../components/DatePicker/DatePicker';
import usStates from '../../../helpers/usStates';
import packageDivisions from '../../../helpers/packageDivisions';
import PackageContext from './PackageContext';

class PackageForm extends Component {
    static contextType = PackageContext;

    _isMounted = false;

    doRedirect = (packageId) => {
        this.context.setPackage({
            redirect: `/admin/packages/edit/${packageId}`,
        });
    };

    getPayload = () => {
        const {
            title,
            description,
            image,
            publishDate,
            unpublishDate,
            price,
            availability,
            taxType,
            taxValue,
            courses,
            upsell,
            state,
            division,
            hideProduct,
            repurchase
        } = this.context.packageData;

        return {
            title: title,
            description: description,
            image: image,
            publishDate: publishDate ?? null,
            unpublishDate: unpublishDate ?? null,
            price: price,
            availability: availability ?? 365,
            taxType: taxType ?? 'FIXED',
            taxValue: taxValue ?? 0,
            courses: courses,
            upsell: upsell,
            state: state ?? 'AL',
            division: division ?? 'AGENT',
            hideProduct: hideProduct ?? false,
            repurchase: +repurchase || null,
        };
    };

    setIsDirty = (dirty) => {
        this.context.setPackage({
            isDirty: dirty,
        });
    };

    handleChange = (event) => {
        this.context.setPackage({
            [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
            isDirty: true,
        });
    };

    handleDateChange = (prop, val) => {
        this.context.setPackage({
            [prop]: val,
            isDirty: true,
        });
    };

    handleImageChange = (type, imageUrl, imageFile) => {
        this.context.setPackage({
            imageUrl,
            imageFile,
            isDirty: true,
        });
    };

    handleSubmit = (event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (this._isMounted) {
            this.setIsDirty(false);
            this.context.setPackage({
                loading: true,
            });
        }
        this.submit();
    };

    submit = async () => {
        if (this.context.packageData.imageFile) {
            let imagePostData = new FormData();
            imagePostData.append('file', this.context.packageData.imageFile);
            const { success, response } = await apiCall('POST', '/files', imagePostData);

            if (success && this._isMounted) {
                this.context.setPackage({
                    imageUrl: await apiFile(response.fileId),
                    image: response.fileId,
                });
            }
        }

        if (!this._isMounted) {
            return;
        }

        let submitMethod = 'POST';
        let submitUrl = '/packages';

        if (this.props.docId) {
            submitMethod = 'PUT';
            submitUrl = `/packages/${this.props.docId}`;
        }

        const { success, response, message } = await apiCall(submitMethod, submitUrl, this.getPayload());

        if (this._isMounted) {
            if (success && response) {
                this.props.setGlobalAlert({
                    type: 'success',
                    message: message ?? `Package has been ${this.props.docId ? 'updated' : 'created'}`,
                });
                if (this.props.docId) {
                    this.context.setPackage({
                        loading: false,
                    });
                } else {
                    this.doRedirect(response._id);
                }
            } else {
                this.props.setGlobalAlert({
                    type: 'error',
                    message: message ?? 'There was a problem with saving this Package. Please try again',
                });
                this.context.setPackage({
                    loading: false,
                });
            }
        }
    };

    componentDidMount = async () => {
        this._isMounted = true;
        this.props.createFormActions({
            save: true,
            cancel: true,
            id: 'packageForm',
        });
    };

    componentWillUnmount() {
        this._isMounted = false;
        this.props.createFormActions({});
    }

    componentDidUpdate = (prevProps, prevState, snapshot) => {
        if (this.props.formActions.state && this.props.formActions.state.reload) {
            if (this.props.formActions.state.cancel) {
                this.props.history.push('/admin/packages');
            }
            this.props.createFormActions({
                ...this.props.formActions.state,
                reload: false,
            });
        }
    };

    setItems = (type, items) => {
        let stateUpdate = {};
        let key;
        if (type === 'package') {
            key = 'upsell';
        } else if (type === 'course') {
            key = type + 's';
        } else {
            key = type;
        }
        stateUpdate[key] = items;
        this.context.setPackage(stateUpdate);
    };

    onKeyPress = (event) => {
        if (event.charCode === 13 && event.target.nodeName !== 'TEXTAREA') {
            event.preventDefault();
            const allowedTags = ['TEXTAREA', 'INPUT', 'SELECT'];
            const form = document.getElementById('form');
            const allowedElems = Array.from(form.elements).filter((elem) => {
                return allowedTags.indexOf(elem.tagName) >= 0;
            });
            const index = allowedElems.indexOf(event.target);
            allowedElems[(index + 1) % allowedElems.length].focus();
        }
    };

    render() {
        let mainContent;

        if (this.context.packageData.redirect) {
            mainContent = <Redirect to={this.context.packageData.redirect} />;
        } else if (this.context.packageData.loading) {
            mainContent = <Spinner />;
        } else {
            mainContent = (
                <Form onSubmit={this.handleSubmit} id='packageForm' onKeyPress={this.onKeyPress}>
                    <Row className='pt-5'>
                        <Col xs={12} lg={4}>
                            <FormGroup>
                                <Form.Label htmlFor='title'>
                                    <ReactTooltip effect='solid' multiline={true} />
                                    Package title
                                    <BsInfoCircle data-tip='Package title is used in all menus <br/> and tiles linking to the package.' />
                                </Form.Label>
                                <Form.Control
                                    type='text'
                                    required
                                    minLength='3'
                                    maxLength='512'
                                    id='title'
                                    name='title'
                                    value={this.context.packageData.title}
                                    onChange={this.handleChange}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Form.Label htmlFor='state'>State</Form.Label>
                                <Form.Control
                                    as='select'
                                    required
                                    id='state'
                                    name='state'
                                    custom
                                    value={this.context.packageData.state}
                                    onChange={this.handleChange}
                                >
                                    {usStates.map(({ key, value }) => (
                                        <option value={key} key={key}>
                                            {value}
                                        </option>
                                    ))}
                                </Form.Control>
                            </FormGroup>
                            <FormGroup>
                                <Form.Label htmlFor='division'>Division</Form.Label>
                                <Form.Control
                                    as='select'
                                    required
                                    id='division'
                                    name='division'
                                    custom
                                    value={this.context.packageData.division}
                                    onChange={this.handleChange}
                                >
                                    {packageDivisions.map(({ key, value }) => (
                                        <option value={key} key={key}>
                                            {value}
                                        </option>
                                    ))}
                                </Form.Control>
                            </FormGroup>
                            <FormGroup>
                                <Form.Label htmlFor='description'>Description</Form.Label>
                                <Form.Control
                                    as='textarea'
                                    type='text'
                                    required
                                    rows='5'
                                    id='description'
                                    name='description'
                                    value={this.context.packageData.description}
                                    onChange={this.handleChange}
                                />
                            </FormGroup>
                        </Col>
                        <Col xs={12} lg={4}>
                            <DatePicker
                                id='publishDate'
                                handleDateChange={this.handleDateChange}
                                date={this.context.packageData.publishDate}
                                label='Publish Date'
                            />
                            <DatePicker
                                id='unpublishDate'
                                handleDateChange={this.handleDateChange}
                                date={this.context.packageData.unpublishDate}
                                label='Unpublish Date'
                            />
                            <FormGroup>
                                <Row>
                                    <Col>
                                        <Form.Label htmlFor='hideProduct'>Hide product</Form.Label>
                                        <Form.Control
                                            type='checkbox'
                                            id='hideProduct'
                                            name='hideProduct'
                                            checked={this.context.packageData.hideProduct}
                                            onChange={this.handleChange}
                                        ></Form.Control>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Form.Label htmlFor='availability'>Availability</Form.Label>
                                        <Form.Control
                                            type='number'
                                            id='availability'
                                            name='availability'
                                            min='0'
                                            value={this.context.packageData.availability}
                                            onChange={this.handleChange}
                                        ></Form.Control>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Form.Label htmlFor='price'>Price</Form.Label>
                                        <Form.Control
                                            type='number'
                                            id='price'
                                            name='price'
                                            required
                                            min={0}
                                            value={this.context.packageData.price}
                                            onChange={this.handleChange}
                                        ></Form.Control>
                                    </Col>
                                    <Col>
                                        <Form.Label htmlFor='taxType'>Tax</Form.Label>
                                        <Form.Control
                                            as='select'
                                            id='taxType'
                                            name='taxType'
                                            required
                                            value={this.context.packageData.taxType}
                                            onChange={this.handleChange}
                                        >
                                            <option value='FIXED'>$</option>
                                            <option value='PERCENTAGE'>%</option>
                                        </Form.Control>
                                    </Col>
                                    <Col>
                                        <Form.Label htmlFor='taxValue'>&nbsp;</Form.Label>
                                        <Form.Control
                                            type='number'
                                            id='taxValue'
                                            name='taxValue'
                                            min={1}
                                            value={this.context.packageData.taxValue}
                                            onChange={this.handleChange}
                                        ></Form.Control>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Form.Label htmlFor='repurchase'>Repurchase</Form.Label>
                                        <Form.Control
                                            type='number'
                                            id='repurchase'
                                            name='repurchase'
                                            min={0}
                                            value={this.context.packageData.repurchase}
                                            onChange={this.handleChange}
                                        ></Form.Control>
                                    </Col>
                                </Row>
                            </FormGroup>
                        </Col>
                        <Col xs={12} lg={4}>
                            <FormGroup>
                                <FileUpload
                                    id='image'
                                    name='image'
                                    url={this.context.packageData.imageUrl}
                                    handleFileChange={this.handleImageChange}
                                    type='image'
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row className='pt-4'>
                        <Col>
                            <ContentItems
                                type='course'
                                source='packages'
                                items={this.context.packageData.courses}
                                setItems={this.setItems}
                                setIsDirty={this.setIsDirty}
                            />
                        </Col>
                    </Row>
                </Form>
            );
        }
        return (
            <div>
                <RouteLeavingGuard
                    when={this.context.packageData.isDirty}
                    navigate={(path) => this.props.history.push(path)}
                    shouldBlockNavigation={() => {
                        return this.context.packageData.isDirty;
                    }}
                />
                <main>{mainContent}</main>
            </div>
        );
    }
}

export default connect(
    (state) => {
        return {
            formActions: state.formActions,
        };
    },
    {
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
        createFormActions: (payload) => ({
            type: 'SET_FORM_ACTIONS',
            payload,
        }),
    }
)(withRouter(PackageForm));
