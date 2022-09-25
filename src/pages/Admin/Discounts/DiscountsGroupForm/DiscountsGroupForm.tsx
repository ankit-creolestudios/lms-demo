import React, { Component } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Api, EventBus } from 'src/helpers/new';
import GenerationGroupsTab from 'src/pages/Admin/Discounts/DiscountsGroupForm/GenerationGroupsTab';
import { ComponentTabs } from '../../../../components/Tabs';
import CodesTab from './CodesTab';
import DetailsTab from './DetailsTab';
import DiscountsContext, {
    DiscountsContext as IDiscountsContext,
    DiscountsDetailsContext as DiscountsDetails,
} from './DiscountsContext';
import PackagesTab from './PackagesTab';

export interface IParams {
    discountGroupId: string;
}

type IState = Pick<IDiscountsContext, 'details' | 'packages' | 'codes' | 'status'>;
type IProps = RouteComponentProps<IParams> & {
    setGlobalAlert: any;
    createFormActions: any;
    pushBreadcrumbLink: any;
    removeBreadcrumbLink: any;
};

class DiscountsGroupForm extends Component<IProps, IState> {
    state: IState = {
        status: 'LOADING',
        details: {
            name: '',
            defaultDiscountType: 'PERCENTAGE',
            defaultDiscountValue: '',
            defaultFixedCode: '',
            defaultCommissionType: 'PERCENTAGE',
            defaultCommissionValue: '',
            isEdited: false,
        },
        packages: [],
        codes: [],
    };

    async componentDidMount() {
        EventBus.dispatch('discounts-group-form-mounted');
        if (!this.isNew) {
            await this.loadDiscountGroup();
        } else {
            this.props.pushBreadcrumbLink({
                text: `New discount group`,
                path: '/admin/discounts/new',
            });
        }
    }

    async componentDidUpdate(prevProps: IProps, prevState: IState) {
        if (prevProps.match.params.discountGroupId !== this.discountGroupId && !this.isNew) {
            this.props.removeBreadcrumbLink({
                text: '',
                path: `/admin/discounts/${this.discountGroupId}`,
            });

            await this.loadDiscountGroup();
        }

        if (prevState.details.isEdited !== this.state.details.isEdited) {
            this.setButtons();
        }
    }

    componentWillUnmount() {
        EventBus.dispatch('discounts-group-form-unmounted');
        if (!this.isNew) {
            this.props.removeBreadcrumbLink({
                text: '',
                path: `/admin/discounts/${this.discountGroupId}`,
            });
        } else {
            this.props.removeBreadcrumbLink({
                text: `New discount group`,
                path: '/admin/discounts/new',
            });
        }

        this.props.createFormActions({
            customButtons: [],
        });
    }

    async setButtons() {
        this.props.createFormActions({
            customButtons: [
                {
                    label: 'Save',
                    onClick: this.handleSave,
                    className: 'bp',
                    disabled: !this.state.details.isEdited,
                },
            ],
        });
    }

    get discountGroupId() {
        return this.props.match.params.discountGroupId;
    }

    get isNew() {
        return this.discountGroupId === 'new';
    }

    loadDiscountGroupDetails = async () => {
        const { success, response } = await Api.call('get', `discounts/groups/${this.discountGroupId}`);

        if (success) {
            this.props.pushBreadcrumbLink({
                text: response.name,
                path: `/admin/discounts/${response._id}`,
            });

            return response;
        }

        return null;
    };

    loadDiscountGroupCodes = async () => {
        return null;
    };

    loadDiscountGroup = async () => {
        this.setState({
            status: 'LOADING',
        });

        const newState: Partial<IState> = { status: 'READY' },
            details = await this.loadDiscountGroupDetails();

        if (details) {
            newState.details = details;
        }

        this.setState(newState as IState);
    };

    handleSave = async () => {
        const { isEdited, ...details } = this.state.details,
            { success, response, message } = await Api.call(
                this.isNew ? 'post' : 'put',
                this.isNew ? 'discounts/groups' : `discounts/groups/${this.discountGroupId}`,
                details
            );

        if (success) {
            this.props.setGlobalAlert({ type: 'success', message });

            if (this.isNew) {
                this.props.history.push(`/admin/discounts/${response._id}`);
            }
        }
    };

    setDetails = (details: Partial<DiscountsDetails>) => {
        this.setState({
            details: {
                ...this.state.details,
                ...details,
                isEdited: true,
            },
        });
    };

    setPackages = (packages: any) => {
        this.setState({
            packages,
        });
    };

    setCodes = (codes: any) => {
        this.setState({
            codes,
        });
    };

    render() {
        const tabs: any[] = [{ tabTitle: 'Details', TabComponent: DetailsTab }];

        if (!this.isNew) {
            tabs.push(
                { tabTitle: 'Packages', TabComponent: PackagesTab },
                { tabTitle: 'Codes', TabComponent: CodesTab },
                { tabTitle: 'Generation groups', TabComponent: GenerationGroupsTab }
            );
        }

        return (
            <DiscountsContext.Provider
                value={{
                    ...this.state,
                    setDetails: this.setDetails,
                    setPackages: this.setPackages,
                    setCodes: this.setPackages,
                }}
            >
                <ComponentTabs unmountOnExit={false} mountOnEnter={false} tabs={tabs} />
            </DiscountsContext.Provider>
        );
    }
}
export default connect(
    (state: any) => {
        return {
            formActions: state.formActions,
            loggedIn: state.loggedIn,
        };
    },
    {
        setGlobalAlert: (payload: any) => ({
            type: 'SET_GLOBAL_ALERT',
            payload,
        }),
        createFormActions: (payload: any) => ({
            type: 'SET_FORM_ACTIONS',
            payload,
        }),
        pushBreadcrumbLink: (payload: any) => ({
            type: 'PUSH_BREADCRUMB_LINK',
            payload,
        }),
        removeBreadcrumbLink: (payload: any) => ({
            type: 'REMOVE_BREADCRUMB_LINK',
            payload,
        }),
    }
)(withRouter(DiscountsGroupForm));
