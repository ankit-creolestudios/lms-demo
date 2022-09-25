import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import fromEntries from '@ungap/from-entries';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import apiCall from '../../helpers/apiCall';
import Pagination from '../Pagination';
import StatePagination from '../Pagination/StatePagination';
import { Table } from '../Table';
import './ApiTable.scss';

class ApiTable extends Component {
    constructor(props) {
        super(props);
        this.searchParams = props.location.search ? new URLSearchParams(props.location.search) : new URLSearchParams();
        let sort = this.searchParams.get('sort');

        if (sort) {
            sort = fromEntries(
                sort.split(',').reduce((array, item) => {
                    let [key, value] = item.split('=');
                    value = parseInt(value);
                    if (key.indexOf('-')) {
                        for (const k of key.split('-')) {
                            if (!Number.isNaN(value)) {
                                array.push([k, value]);
                            }
                        }
                    } else {
                        if (!Number.isNaN(value)) {
                            array.push([key, value]);
                        }
                    }
                    return array;
                }, [])
            );
        }

        this.timeOutFunction = null;
        this.state = {
            tableData: null,
            search: this.searchParams.get('search') ? decodeURI(this.searchParams.get('search')) : '',
            loading: true,
            sort: sort ?? {},
        };
    }

    async componentDidMount() {
        await this.loadTableData();
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        if (
            prevProps.location.search !== this.props.location.search ||
            prevProps.reload !== this.props.reload ||
            this.props.apiCall.params !== prevProps.apiCall.params
        ) {
            await this.loadTableData();
        }
    }

    loadTableData = async () => {
        if (!this.state.loading) {
            this.setState({
                loading: true,
            });
        }
        let query = new URLSearchParams(this.props.apiCall.params || this.props.location.search);

        const { response, message, success } = await apiCall(
            this.props.apiCall.method,
            this.props.apiCall.path + (query.toString() ? `?${query.toString()}` : ''),
            this.props.apiCall.payload !== undefined ? this.props.apiCall.payload : null,
            this.props.apiCall.auth !== undefined ? this.props.apiCall.auth : true
        );

        if (success) {
            this.setState({
                tableData: response,
                loading: false,
            });
        } else {
            this.props.setGlobalAlert({ type: 'error', message });
        }
    };

    updateURLParams = () => {
        let query = new URLSearchParams(this.props.location.search);
        if (Object.keys(this.state.sort).length) {
            let sort = '';
            for (const key of Object.keys(this.state.sort)) {
                sort += `${key}=${this.state.sort[key]},`;
            }
            sort = sort.substring(0, sort.length - 1);
            query.set('sort', sort);
        } else {
            let sort = query.get('sort');
            if (sort) {
                query.delete('sort');
            }
        }

        this.props.history.replace(`${this.props.match.url}?${query.toString()}`);
    };

    handleSort = async (e, columnKey) => {
        e.preventDefault();
        if (!this.state.sort[columnKey]) {
            // sort asc on first click
            this.setState(
                {
                    sort: {
                        ...this.state.sort,
                        [columnKey]: 1,
                    },
                },
                this.updateURLParams
            );
        } else {
            // or just toggle between asc / desc on click
            this.setState(
                {
                    sort: {
                        ...this.state.sort,
                        [columnKey]: this.state.sort[columnKey] === 1 ? -1 : 1,
                    },
                },
                this.updateURLParams
            );
        }
    };

    handleSortReset = async (e, columnKey) => {
        e.preventDefault();
        let { sort } = this.state;
        delete sort[columnKey];
        this.setState(
            {
                sort,
            },
            this.loadTableData
        );
        return false;
    };

    handleSearchSubmit = (e) => {
        e.preventDefault();
    };

    handleSearchChange = async (e) => {
        const input = e.target;
        this.setState(
            {
                search: input.value,
            },
            () => {
                if (this.timeOutFunction) {
                    clearTimeout(this.timeOutFunction);
                }
                this.timeOutFunction = setTimeout(() => {
                    if (input.value) {
                        this.searchParams.set('search', encodeURI(this.state.search));
                    } else {
                        this.searchParams.delete('search');
                    }
                    this.searchParams.delete('page');
                    this.props.history.push(this.props.location.pathname + '?' + this.searchParams.toString());
                }, 1000);
            }
        );
    };

    render() {
        if (this.state.tableData) {
            const {
                state: { tableData, sort, loading },
                props: { hideControls, columns, rowButtons, noSearch, addNew },
                handleSort,
                handleSortReset,
                loadTableData,
            } = this;

            return (
                <div className='table-wrapper'>
                    {!hideControls && (
                        <div className='table-controls'>
                            <Pagination
                                className='table-pagination'
                                activePage={tableData.page}
                                totalPages={tableData.totalPages}
                            />
                            {addNew && (
                                <button
                                    onClick={() => {
                                        addNew.action(this.loadTableData);
                                    }}
                                    className=' add-new btn'
                                >
                                    {addNew.label}
                                </button>
                            )}
                            {!noSearch && (
                                <div className='table-search'>
                                    <form
                                        action='/'
                                        className='form'
                                        onSubmit={this.props.handleSearch ?? this.handleSearchSubmit}
                                    >
                                        <div className='form__field form__field--inside-icon'>
                                            <input
                                                type='text'
                                                name='search'
                                                defaultValue={this.state.search}
                                                placeholder='Search...'
                                                onChange={this.props.handleSearchInputChange ?? this.handleSearchChange}
                                            />
                                            <button className='btn bp btn--small' type='submit'>
                                                <Fa icon={faSearch} />
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                    <Table
                        rows={tableData.docs}
                        rowButtons={rowButtons}
                        columns={columns}
                        onSort={handleSort}
                        onSortReset={handleSortReset}
                        sortData={sort}
                        loading={loading}
                        reloadRows={loadTableData}
                    />
                    {!hideControls && (
                        <div className='table-controls table-controls--bottom'>
                            {this.props.onPageChange ? (
                                <StatePagination
                                    onPageChange={this.props.onPageChange}
                                    className='table-pagination'
                                    activePage={tableData.page}
                                    totalPages={tableData.totalPages}
                                />
                            ) : (
                                <Pagination
                                    className='table-pagination'
                                    activePage={tableData.page}
                                    totalPages={tableData.totalPages}
                                />
                            )}
                        </div>
                    )}
                </div>
            );
        }
        return <div />;
    }
}

export default connect(null, {
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(withRouter(ApiTable));
