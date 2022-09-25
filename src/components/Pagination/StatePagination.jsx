import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faAngleRight, faAngleLeft } from '@fortawesome/free-solid-svg-icons';

export default class StatePagination extends Component {
    render() {
        if (this.props.totalPages <= 1) {
            return null;
        }

        const { totalPages, page } = this.props;

        return (
            <div className={this.props.className}>
                {page !== 1 && (
                    <button onClick={this.props.onPageChange(1)} className='btn btn--small bd'>
                        1
                    </button>
                )}
                {page - 1 >
                    1(
                        <button onClick={this.props.onPageChange(page - 1)} className='btn btn--small bd'>
                            <Fa icon={faAngleLeft} />
                        </button>
                    )}
                <button onClick={this.props.onPageChange(page)} className='btn btn--small bp'>
                    {page}
                </button>
                {page + 1 < totalPages && (
                    <button onClick={this.props.onPageChange(activePage + 1)} className='btn btn--small bd'>
                        {page + 1 === totalPages - 1 ? totalPages - 1 : <Fa icon={faAngleRight} />}
                    </button>
                )}
                {page !== totalPages && totalPages > 1 && (
                    <button onClick={this.props.onPageChange(totalPages)} className='btn btn--small bd'>
                        <Fa icon={totalPages} />
                    </button>
                )}
            </div>
        );
    }
}
