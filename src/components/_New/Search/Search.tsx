import React, { Component } from 'react';
import { Api } from 'src/helpers/new';
import { Spinner } from 'src/components/Spinner';
import './Search.scss';

interface IProps {
    endpoint: string;
    searchOptions?: ISearchOptions;
    result: React.ReactNode;
    onSelect: (result: any, index: number, event: any) => void;
    auto?: boolean;
    delay?: number;
    searchOnEnter?: boolean;
    noButton?: boolean;
    placeholder?: string;
}

interface ISearchOptions {
    regex?: string;
    limit?: number;
}

interface IState {
    searchValue: string;
    results: any[];
    showResults: boolean;
    resultsLoading: boolean;
}

export default class Search extends Component<IProps, IState> {
    submitTimer: ReturnType<typeof setTimeout> | undefined;

    state: IState = {
        searchValue: '',
        results: [],
        showResults: false,
        resultsLoading: true,
    };

    componentDidMount() {}

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.handleAutoSubmit();
        const { value: searchValue } = e.currentTarget;
        this.setState({ searchValue });
    };

    search = async () => {
        if (this.submitTimer) clearTimeout(this.submitTimer);
        this.setState({ showResults: true, resultsLoading: true });
        const { endpoint, searchOptions } = this.props;
        const { searchValue } = this.state;
        const { success, response } = await Api.call('post', endpoint, {
            searchValue,
            options: searchOptions,
        });
        if (success) {
            this.setState({ results: response, resultsLoading: false });
        }
    };

    clearResults = () => {
        this.setState({ searchValue: '', results: [], showResults: false, resultsLoading: true });
    };

    handleAutoSubmit = () => {
        if (!this.props.auto) return;
        if (this.submitTimer) clearTimeout(this.submitTimer);

        this.submitTimer = setTimeout(this.search, this.props.delay ?? 1000);
    };

    handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && this.props.searchOnEnter) {
            this.search();
        }
    };

    render() {
        const { noButton, result, onSelect } = this.props;
        const { searchValue, results, showResults, resultsLoading } = this.state;
        const ResultComponent = result as React.ElementType;

        return (
            <div className='search-component'>
                <div className='search-bar'>
                    <input
                        value={searchValue}
                        className={`${showResults ? 'results-shown' : ''} ${!noButton ? 'thin' : ''}`}
                        type='text'
                        onChange={this.handleChange}
                        onKeyDown={this.handleKeyDown}
                        placeholder={this.props.placeholder ? this.props.placeholder : ''}
                    />
                    <div className={`clear-container ${!noButton ? 'thin' : ''}`} onClick={this.clearResults}>
                        <i className='fas fa-times' />
                    </div>
                    {!noButton && <button onClick={this.search}>Search</button>}
                </div>
                {showResults && (
                    <div className={`search-results ${!noButton ? 'thin' : ''}`}>
                        {resultsLoading ? (
                            <Spinner />
                        ) : results.length > 0 ? (
                            results.map((result: any, index) => {
                                return (
                                    <div
                                        key={index}
                                        onClick={(e: any) => {
                                            onSelect(result, index, e);
                                            this.clearResults();
                                        }}
                                    >
                                        <ResultComponent result={result} />
                                    </div>
                                );
                            })
                        ) : (
                            <span>No results Found</span>
                        )}
                    </div>
                )}
            </div>
        );
    }
}
