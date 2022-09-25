import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router-dom';
import apiCall from '../../../helpers/apiCall';
import { Spinner } from '../../../components/Spinner';
import { Col, Row, Form, FormGroup } from 'react-bootstrap';
import { RouteLeavingGuard } from '../../../components/RouteLeavingGuard';
import CoreLibraryContent from './CoreLibraryContent';

class CoreLibraryForm extends Component {
    _isMounted = false;

    initialState = {
        loading: true,
        redirect: null,
        title: '',
        doSubmit: false,
        submitRegister: {},
        rerenderId: 0,
        isDirty: false,
    };

    constructor(props) {
        super(props);

        this.state = { ...this.initialState };
    }

    updateRegister = (children, action, parentDocId) => {
        if (!Array.isArray(children)) {
            children = [children];
        }

        let updatedRegister = { ...this.state.submitRegister };
        const deleteChildren = (child) => {
            Object.keys(updatedRegister).map((docId) => {
                if (updatedRegister[docId].parent === child._id) {
                    delete updatedRegister[docId];
                }
            });
        };

        let shouldRedirect = this.state.doSubmit;
        children.map((child) => {
            if (action === 'add') {
                updatedRegister[child._id] = {
                    submitted: false,
                    error: false,
                    parent: parentDocId,
                };
            } else if (action === 'delete') {
                delete updatedRegister[child._id];
                deleteChildren(child);
                shouldRedirect = false;
            } else if (action === 'delete_children') {
                deleteChildren(child);
                shouldRedirect = false;
            } else if (action === 'submitted' && updatedRegister[child._id]) {
                updatedRegister[child._id].submitted = true;
            } else if (action === 'error' && updatedRegister[child._id]) {
                updatedRegister[child._id].error = true;
            }
        });

        this.setState({
            submitRegister: updatedRegister,
        });

        const anyError = this.anyErrorInChildren(updatedRegister);
        shouldRedirect = !anyError;

        if (shouldRedirect && this.areAllChildrenSubmitted(updatedRegister)) {
            this.doRedirect(this.state.submittedDocId);
        } else if (anyError && this.state.doSubmit) {
            this.handleSubmitFailed();
        }
    };

    areAllChildrenSubmitted = (updatedRegister) => {
        const register = updatedRegister ? updatedRegister : this.state.submitRegister;
        return Object.keys(register).every((key) => {
            return register[key].submitted;
        });
    };

    anyErrorInChildren = (updatedRegister) => {
        const register = updatedRegister ? updatedRegister : this.state.submitRegister;
        return Object.keys(register).some((key) => {
            return register[key].error;
        });
    };

    doRedirect = (coreLibId, message) => {
        this.toggleSpinner(false);

        this.props.setGlobalAlert({
            type: 'success',
            message: message ?? `Core Library has been ${this.props.match.params.id ? 'updated' : 'created'}`,
        });

        if (!this.props.match.params.id) {
            this.setState({
                redirect: `/admin/core-library/edit/${coreLibId}`,
            });
        } else {
            this.setState({
                doSubmit: false,
                rerenderId: this.state.rerenderId + 1,
                submitRegister: {},
            });
            this.removeBreadcrumbs();
            this.createBreadcrumbs();
        }
    };

    getPayload = () => {
        return {
            title: this.state.title,
        };
    };

    setIsDirty = (dirty) => {
        this.setState({
            isDirty: dirty,
        });
    };

    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value,
            isDirty: true,
        });
    };

    handleSubmit = (event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        this.setIsDirty(false);
        this.toggleSpinner(true);
        this.submit();
    };

    handleSubmitFailed = (message) => {
        this.props.setGlobalAlert({
            type: 'error',
            message: message ?? 'There was a problem with saving this Core Library. Please try again',
        });
        this.setState({
            doSubmit: false,
            rerenderId: this.state.rerenderId + 1,
        });
        this.toggleSpinner(false);
    };

    toggleSpinner = (show) => {
        const form = document.getElementById('coreLibraryForm');
        const spinner = document.getElementById('spinner');
        if (form && spinner) {
            if (show) {
                form.style.display = 'none';
                spinner.removeAttribute('hidden');
            } else {
                form.style.display = 'block';
                spinner.setAttribute('hidden', true);
            }
        }
    };

    submit = async () => {
        let submitMethod = 'POST';
        let submitUrl = '/core';

        if (this.props.match.params.id) {
            submitMethod = 'PUT';
            submitUrl = `/core/${this.props.match.params.id}`;
        }

        const { success, response, message } = await apiCall(submitMethod, submitUrl, this.getPayload());

        if (this._isMounted) {
            if (success && response) {
                if (this.areAllChildrenSubmitted()) {
                    this.doRedirect(response._id, message);
                } else {
                    this.setState({
                        doSubmit: true,
                        submittedDocId: response._id,
                    });
                }
            } else {
                this.handleSubmitFailed(message);
            }
        }
    };

    async componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.formActions.state && this.props.formActions.state.reload) {
            this.props.createFormActions({
                ...this.props.formActions.state,
                reload: false,
            });
            if (this.props.formActions.state.cancel) {
                this.props.history.push('/admin/core-library');
            }
            await this.loadCoreLib();
        }
    }

    loadCoreLib = async () => {
        if (this.props.match.params.id) {
            this.setState({
                loading: true,
            });
            const { success, response } = await apiCall('GET', `/core/${this.props.match.params.id}`);
            if (success && this._isMounted) {
                this.setState({
                    ...response,
                });
            }
        } else {
            this.setState({
                ...this.initialState,
            });
        }
        if (this._isMounted) {
            this.setState({
                loading: false,
                redirect: null,
            });
        }
    };

    createBreadcrumbs = () => {
        this.props.pushBreadcrumbLink({
            text: 'Core Library',
            path: '/admin/core-library',
        });
        if (this.props.match.params.id) {
            this.props.pushBreadcrumbLink({
                text: `Core Library: ${this.state.title}`,
                path: `/admin/core-library/edit/${this.props.match.params.id}`,
            });
        }
    };

    removeBreadcrumbs = () => {
        this.props.removeBreadcrumbLink({
            text: 'Core Library',
            path: '/admin/core-library',
        });
        if (this.props.match.params.id) {
            this.props.removeBreadcrumbLink({
                text: `Core Lib: ${this.state.title}`,
                path: `/admin/core-library/edit/${this.props.match.params.id}`,
            });
        }
    };

    componentDidMount = async () => {
        this._isMounted = true;
        await this.loadCoreLib();
        this.createBreadcrumbs();
        this.props.createFormActions({
            save: true,
            cancel: true,
            id: 'coreLibraryForm',
        });
    };

    componentWillUnmount = () => {
        this._isMounted = false;
        this.removeBreadcrumbs();
        this.props.createFormActions({});
    };

    onKeyPress = (event) => {
        if (event.charCode === 13 && event.target.nodeName !== 'TEXTAREA') {
            event.preventDefault();
            const allowedTags = ['TEXTAREA', 'INPUT', 'SELECT'];
            const form = document.getElementById('form');
            if (form) {
                const allowedElems = Array.from(form?.elements)?.filter((elem) => {
                    return allowedTags.indexOf(elem.tagName) >= 0;
                });

                const index = allowedElems.indexOf(event.target);
                allowedElems[(index + 1) % allowedElems.length].focus();
            }
        }
    };

    render() {
        let mainContent;

        if (this.state.redirect) {
            mainContent = <Redirect to={this.state.redirect} />;
        } else if (this.state.loading) {
            mainContent = <Spinner />;
        } else {
            mainContent = (
                <div className='tab-content'>
                    <div id='spinner' hidden>
                        <Spinner />
                    </div>
                    <Form onSubmit={this.handleSubmit} id='coreLibraryForm' onKeyPress={this.onKeyPress}>
                        <Row className='pt-5'>
                            <Col>
                                <FormGroup>
                                    <Form.Label htmlFor='title'>Folder Name</Form.Label>
                                    <Form.Control
                                        type='text'
                                        required
                                        minLength='3'
                                        maxLength='512'
                                        id='title'
                                        name='title'
                                        value={this.state.title}
                                        onChange={this.handleChange}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        {this.props.match.params.id && (
                            <Row className='pt-4'>
                                <Col>
                                    <CoreLibraryContent
                                        parentDocId={this.state.submittedDocId || this.props.match.params.id}
                                    ></CoreLibraryContent>
                                </Col>
                            </Row>
                        )}
                    </Form>
                </div>
            );
        }
        return (
            <div>
                <RouteLeavingGuard
                    when={this.state.isDirty}
                    navigate={(path) => this.props.history.push(path)}
                    shouldBlockNavigation={() => {
                        return this.state.isDirty;
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
)(withRouter(CoreLibraryForm));
