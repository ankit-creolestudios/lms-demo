/**
 * @desc This component uses react-router-dom to mimic a pagination system.
        The parent component should be using the react-router-dom as well
        to watch for search params changes and update accordingly to the page URL
 */

import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faAngleRight, faAngleLeft } from '@fortawesome/free-solid-svg-icons';

class Pagination extends Component {
    render() {
        if (this.props.totalPages <= 1) {
            return null;
        }

        const path = this.props.location.pathname,
            query = new URLSearchParams(this.props.location.search);

        return (
            <div className={this.props.className}>
                {this.props.activePage !== 1 && query.set('page', 1) === undefined && (
                    <Link to={path + '?' + query} className='btn btn--small bd'>
                        1
                    </Link>
                )}
                {this.props.activePage - 1 > 1 && query.set('page', this.props.activePage - 1) === undefined && (
                    <Link to={path + '?' + query} className='btn btn--small bd'>
                        <Fa icon={faAngleLeft} />
                    </Link>
                )}
                {query.set('page', this.props.activePage) === undefined && (
                    <Link to={path + '?' + query} className='btn btn--small bp'>
                        {this.props.activePage}
                    </Link>
                )}
                {this.props.activePage + 1 < this.props.totalPages &&
                    query.set('page', this.props.activePage + 1) === undefined && (
                        <Link to={path + '?' + query} className='btn btn--small bd'>
                            {this.props.activePage + 1 === this.props.totalPages - 1 ? (
                                this.props.totalPages - 1
                            ) : (
                                <Fa icon={faAngleRight} />
                            )}
                        </Link>
                    )}
                {this.props.activePage !== this.props.totalPages &&
                    this.props.totalPages > 1 &&
                    query.set('page', this.props.totalPages) === undefined && (
                        <Link to={path + '?' + query} className='btn btn--small bd'>
                            {this.props.totalPages}
                        </Link>
                    )}
            </div>
        );
    }
}

export default withRouter(Pagination);
