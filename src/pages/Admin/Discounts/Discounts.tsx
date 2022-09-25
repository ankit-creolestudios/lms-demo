import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Nav } from 'react-bootstrap';
import { Link, Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom';
import CodeForm from 'src/pages/Admin/Discounts/DiscountsGroupForm/CodeForm';
import GenerationForm from 'src/pages/Admin/Discounts/DiscountsGroupForm/GenerationForm';
import DiscountsGroupForm from './DiscountsGroupForm';
import DiscountsList from './DiscountsList';
import DiscountReporting from 'src/pages/Admin/Discounts/Reporting';
import { EventBus } from 'src/helpers/new';

type IProps = RouteComponentProps & {
    pushBreadcrumbLink: any;
    removeBreadcrumbLink: any;
};

interface IState {
    navbarVisible: boolean;
}

class Discounts extends Component<IProps, IState> {
    state: IState = {
        navbarVisible: true,
    };

    componentDidMount() {
        this.props.pushBreadcrumbLink({
            text: 'Discounts',
            path: '/admin/discounts',
        });
        EventBus.on('discounts-group-form-mounted', this.discountsGroupFormMounted);
        EventBus.on('discounts-group-form-unmounted', this.discountsGroupFormUnmounted);
    }

    componentWillUnmount() {
        this.props.removeBreadcrumbLink({
            text: 'Discounts',
            path: '/admin/discounts',
        });
        EventBus.remove('discounts-group-form-mounted', this.discountsGroupFormMounted);
        EventBus.remove('discounts-group-form-unmounted', this.discountsGroupFormUnmounted);
    }

    discountsGroupFormMounted = () => {
        this.setState({ navbarVisible: false });
    };

    discountsGroupFormUnmounted = () => {
        this.setState({ navbarVisible: true });
    };

    render() {
        return (
            <>
                {this.state.navbarVisible && (
                    //this navbar visible hack is terrible but i don't have time to fix handling sub navbars or find a more suitable workaround
                    <Nav variant='tabs' activeKey={this.props.location.pathname}>
                        <Nav.Item key='history'>
                            <Nav.Link as={Link} eventKey={`/admin/discounts`} to={`/admin/discounts`}>
                                Discounts
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item key='course'>
                            <Nav.Link as={Link} eventKey={`/admin/discounts/reports`} to={`/admin/discounts/reports`}>
                                Reporting
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                )}
                <div className='tab-content pt-4'>
                    <Switch>
                        <Route exact path='/admin/discounts' component={DiscountsList} />
                        <Route exact path='/admin/discounts/reports' component={DiscountReporting} />
                        <Route exact path='/admin/discounts/:discountGroupId/codes/:codeId' component={CodeForm} />
                        <Route
                            exact
                            path='/admin/discounts/:discountGroupId/generations/:generationGroupId'
                            component={GenerationForm}
                        />
                        <Route path='/admin/discounts/:discountGroupId' component={DiscountsGroupForm} />
                    </Switch>
                </div>
            </>
        );
    }
}

export default connect(null, {
    pushBreadcrumbLink: (payload: any) => ({
        type: 'PUSH_BREADCRUMB_LINK',
        payload,
    }),
    removeBreadcrumbLink: (payload: any) => ({
        type: 'REMOVE_BREADCRUMB_LINK',
        payload,
    }),
})(withRouter(Discounts));
