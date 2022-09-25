import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import React, { Component } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { ApiTable } from 'src/components/ApiTable';
import { IParams } from 'src/pages/Admin/Discounts/DiscountsGroupForm/DiscountsGroupForm';
import GenerationGroupsDescSearch from 'src/pages/Admin/Discounts/DiscountsGroupForm/GenerationGroupsTab/GenerationGroupsDescSearch';
import GenerationGroupsInvalidAtFilter from 'src/pages/Admin/Discounts/DiscountsGroupForm/GenerationGroupsTab/GenerationGroupsInvalidAtFilter';
import GenerationGroupsPackageFilter from 'src/pages/Admin/Discounts/DiscountsGroupForm/GenerationGroupsTab/GenerationGroupsPackageFilter';
import GenerationGroupsValidAtFilter from 'src/pages/Admin/Discounts/DiscountsGroupForm/GenerationGroupsTab/GenerationGroupsValidAtFilter';
import GenerationGroupsContext, { IGenerationGroupsContext } from './GenerationGroupsContext';

type IProps = RouteComponentProps<IParams>;

type IFilters = Omit<IGenerationGroupsContext, 'setFilter'>;

interface IState {
    filters: IFilters;
    query: string;
}

class GenerationGroupsTab extends Component<IProps, IState> {
    filtersDefaultValues = {
        _id: '',
        descriptionSearch: '',
        packageIds: [],
        validAtFrom: '',
        validAtUntil: '',
        invalidAtFrom: '',
        invalidAtUntil: '',
    };

    filtersTextMap: Record<string, string> = {
        _id: 'Generation ID',
        descriptionSearch: 'Description',
        packageIds: 'Packages',
        validAtFrom: 'Valid at from',
        validAtUntil: 'Valid at until',
        invalidAtFrom: 'Invalid at from',
        invalidAtUntil: 'Valid at until',
    };

    state: IState = {
        filters: {
            descriptionSearch: '',
            packageIds: [],
            validAtFrom: '',
            validAtUntil: '',
            invalidAtFrom: '',
            invalidAtUntil: '',
        },
        query: '',
    };

    get discountGroupId() {
        return this.props.match.params.discountGroupId;
    }

    setFilter = (filters: Partial<IFilters>) => {
        const newState = {
            filters: {
                ...this.state.filters,
                ...filters,
            },
            query: '',
        };

        newState.query = this.getQueryParams(newState.filters);

        this.setState(newState);
    };

    getQueryParams = (filters: IFilters) => {
        const query = new URLSearchParams();

        for (const key of Object.keys(filters)) {
            const value = filters[key as keyof IFilters];

            if (typeof value === 'string' && value) {
                query.set(key, value as string);
            }

            if (Array.isArray(value) && (value as string[]).length !== 0) {
                query.set(key, value.join(','));
            }
        }

        return query.toString();
    };

    handleResetFilter = (filterKey: keyof IFilters) => () => {
        const filters = {
            ...this.state.filters,
            [filterKey]: this.filtersDefaultValues[filterKey],
        };

        this.setState({
            filters,
            query: this.getQueryParams(filters),
        });
    };

    render() {
        const { query, filters } = this.state;
        const { packageIds } = this.state.filters as IFilters;

        return (
            <GenerationGroupsContext.Provider
                value={{
                    ...this.state.filters,
                    setFilter: this.setFilter,
                }}
            >
                <div className='page-header padding row'>
                    <div className='table-filters'>
                        {Object.keys(filters).map((filterKey: keyof IFilters) => {
                            if (
                                !filters[filterKey] ||
                                (Array.isArray(filters[filterKey]) && filters[filterKey].length === 0)
                            ) {
                                return null;
                            }

                            return (
                                <div
                                    key={filterKey}
                                    className='table-filter'
                                    onClick={this.handleResetFilter(filterKey)}
                                >
                                    <span>{this.filtersTextMap[filterKey]}:&nbsp;</span>
                                    {Array.isArray(filters[filterKey])
                                        ? (filters[filterKey] as string[]).join(',')
                                        : filters[filterKey]}
                                    &nbsp;
                                    <FaTimes />
                                </div>
                            );
                        })}
                    </div>
                    <div className='page-controls'>
                        <Link to={`/admin/discounts/${this.discountGroupId}/codes/new`} className='btn bp'>
                            New code
                        </Link>
                    </div>
                </div>
                <ApiTable
                    apiCall={{
                        method: 'GET',
                        path: `/discounts/groups/${this.discountGroupId}/generations`,
                        params: query ? `?${query}` : '',
                    }}
                    columns={[
                        {
                            text: 'Generation ID',
                            field: ({ _id }: { _id: string }) => (
                                <Link to={`/admin/discounts/${this.discountGroupId}/generations/${_id}`}>{_id}</Link>
                            ),
                            maxWidth: '235px',
                        },
                        {
                            text: 'Description',
                            field: ({ description }: { description: string }) => (
                                <span className='oneline-text' title={description}>
                                    {description}
                                </span>
                            ),
                            maxWidth: '450px',
                            filter: GenerationGroupsDescSearch,
                        },
                        {
                            text: 'Packages',
                            field: ({ packages }: { packages: any }) => {
                                let packagesText: string = packages.reduce(
                                    (
                                        packagesText: string,
                                        { _id, title }: { _id: string; title: string },
                                        index: number
                                    ) => {
                                        if (packageIds.length === 0 || packageIds.includes(_id)) {
                                            packagesText += title;

                                            if (index !== packages.length - 1) {
                                                packagesText += ', ';
                                            }
                                        }

                                        return packagesText;
                                    },
                                    ''
                                );

                                if (packageIds.length !== 0 && packages.length > packageIds.length) {
                                    packagesText += ` and ${packages.length - packageIds.length} more`;
                                }

                                return (
                                    <span className='oneline-text' title={packagesText}>
                                        {packagesText}
                                    </span>
                                );
                            },
                            maxWidth: '650px',
                            filter: GenerationGroupsPackageFilter,
                        },
                        {
                            text: 'Valid at',
                            field: ({ validAt }: { validAt: string }) =>
                                !validAt ? 'Always valid' : new Date(validAt).toLocaleDateString(),
                            maxWidth: '140px',
                            filter: GenerationGroupsValidAtFilter,
                        },
                        {
                            text: 'Invalid at',
                            field: ({ invalidAt }: { invalidAt: string }) =>
                                !invalidAt ? 'Always valid' : new Date(invalidAt).toLocaleDateString(),
                            maxWidth: '140px',
                            filter: GenerationGroupsInvalidAtFilter,
                        },
                        {
                            text: 'Created at',
                            field: ({ createdAt }: { createdAt: string }) => new Date(createdAt).toLocaleDateString(),
                            maxWidth: '140px',
                        },
                    ]}
                    rowButtons={[
                        {
                            text: 'Edit code',
                            url: `/admin/discounts/${this.discountGroupId}/generations/:_id`,
                            icon: faPencilAlt,
                        },
                    ]}
                    noSearch
                />
            </GenerationGroupsContext.Provider>
        );
    }
}

export default withRouter(GenerationGroupsTab);
