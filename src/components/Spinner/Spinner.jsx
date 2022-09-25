import React, { Component } from 'react';
import { Spinner as RBSpinner } from 'react-bootstrap';

export default class Spinner extends Component {
    render() {
        return (
            <div className='centered-block loading'>
                <RBSpinner
                    animation='border'
                    role='status'
                    style={{
                        width: '3.2rem',
                        height: '3.2rem',
                        borderWidth: '.3rem',
                    }}>
                    <span className='sr-only'>Loading...</span>
                </RBSpinner>
            </div>
        );
    }
}
