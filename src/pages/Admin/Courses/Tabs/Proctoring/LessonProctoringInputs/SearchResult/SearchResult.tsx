import React, { Component } from 'react';
import './SearchResult.scss';

interface IProps {
    result: IResult;
}

interface IResult {
    _id: string;
    title: string;
}

export default class SearchResult extends Component<IProps> {
    render() {
        const { title } = this.props.result;

        return <div className='proctoring-search-result'>{title}</div>;
    }
}
