import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import React, { Component } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { ApiTable } from 'src/components/ApiTable';
import CodesListCodeSearch from 'src/pages/Admin/Discounts/DiscountsGroupForm/CodesTab/CodesListCodeSearch';
import CodesListDescSearch from 'src/pages/Admin/Discounts/DiscountsGroupForm/CodesTab/CodesListDescSearch';
import CodesListPackageFilter from 'src/pages/Admin/Discounts/DiscountsGroupForm/CodesTab/CodesListPackageFilter';
import CodesListUsageFilter from 'src/pages/Admin/Discounts/DiscountsGroupForm/CodesTab/CodesListUsageFilter';
import CodesListValidInValidFilter from 'src/pages/Admin/Discounts/DiscountsGroupForm/CodesTab/CodesListValidInValidFilter';
import GenerationGroupListCodeSearch from 'src/pages/Admin/Discounts/DiscountsGroupForm/CodesTab/GenerationGroupListCodeSearch';
import { IParams } from 'src/pages/Admin/Discounts/DiscountsGroupForm/DiscountsGroupForm';
import CodesListContext, { ICodesListContext } from './CodesListContext';

type IProps = RouteComponentProps<IParams>;

type IFilters = Omit<ICodesListContext, 'setFilter'>;

interface IState {
    filters: IFilters;
    query: string;
}

class CodesTab extends Component<IProps, IState> {
    filtersDefaultValues = {
        codeSearch: '',
        generationGroupId: '',
        descriptionSearch: '',
        packageIds: [],
        validAtFrom: '',
        validAtUntil: '',
        invalidAtFrom: '',
        invalidAtUntil: '',
        usage: '',
        validInvalid: '',
    };

    filtersTextMap: Record<string, string> = {
        codeSearch: 'Code',
        generationGroupId: 'Generation ID',
        descriptionSearch: 'Description',
        packageIds: 'Packages',
        validAtFrom: 'Valid at from',
        validAtUntil: 'Valid at until',
        invalidAtFrom: 'Invalid at from',
        invalidAtUntil: 'Valid at until',
        usage: 'Usage',
        validInvalid: 'Valid',
    };

    state: IState = {
        filters: {
            codeSearch: '',
            generationGroupId: '',
            descriptionSearch: '',
            packageIds: [],
            validAtFrom: '',
            validAtUntil: '',
            invalidAtFrom: '',
            invalidAtUntil: '',
            usage: '',
            validInvalid: '',
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
            <CodesListContext.Provider
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
                        path: `/discounts/groups/${this.discountGroupId}/codes`,
                        params: query ? `?${query}` : '',
                    }}
                    columns={[
                        {
                            text: 'Code',
                            field: ({ code, _id }: { code: string; _id: string }) => (
                                <Link to={`/admin/discounts/${this.discountGroupId}/codes/${_id}`}>{code}</Link>
                            ),
                            maxWidth: '180px',
                            filter: CodesListCodeSearch,
                        },
                        {
                            text: 'Usage',
                            field: ({ usedCount, useLimit }: { usedCount: number; useLimit: number }) =>
                                `${usedCount} / ${useLimit === 0 ? 'Unlimited' : useLimit}`,
                            maxWidth: '180px',
                            filter: CodesListUsageFilter,
                        },
                        {
                            text: 'Generation group ID',
                            field: ({ generationGroupId }: { generationGroupId: string }) => (
                                <Link to={`/admin/discounts/${this.discountGroupId}/generations/${generationGroupId}`}>
                                    {generationGroupId}
                                </Link>
                            ),
                            maxWidth: '235px',
                            filter: GenerationGroupListCodeSearch,
                        },
                        {
                            text: 'Description',
                            field: ({ description }: { description: string }) => (
                                <span className='oneline-text' title={description}>
                                    {description}
                                </span>
                            ),
                            maxWidth: '450px',
                            filter: CodesListDescSearch,
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
                            filter: CodesListPackageFilter,
                        },
                        {
                            text: 'Valid',
                            field: ({ validAt, invalidAt }: { validAt: string; invalidAt: string }) => {
                                const isTodayAfterValidAt = validAt ? new Date(validAt) <= new Date() : true;
                                const isTodayAfterInvalidAt = invalidAt ? new Date(invalidAt) <= new Date() : false;

                                if (isTodayAfterValidAt && !isTodayAfterInvalidAt) {
                                    return 'Valid';
                                } else {
                                    return 'Invalid';
                                }
                            },
                            maxWidth: '140px',
                            filter: CodesListValidInValidFilter,
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
                            url: `/admin/discounts/${this.discountGroupId}/codes/:_id`,
                            icon: faPencilAlt,
                        },
                    ]}
                    noSearch
                />
            </CodesListContext.Provider>
        );
    }
}

export default withRouter(CodesTab);
