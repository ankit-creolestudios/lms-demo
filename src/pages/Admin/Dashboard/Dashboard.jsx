import './Dashboard.scss';
import React, { Component } from 'react';
import apiCall from '../../../helpers/apiCall';
import { connect } from 'react-redux';
import { Col, Row } from 'react-bootstrap';
import CountUp from 'react-countup';

class Dashboard extends Component {
    state = {
        students: 0,
        courses: 0,
        activeSessions: 0,
    };

    async componentDidMount() {
        const { response, success, message } = await apiCall('GET', '/stats/basic');

        if (success) {
            this.setState(response);
        } else {
            this.props.setGlobalAlert({ type: 'error', message });
        }
    }

    render() {
        return (
            <div id='dashboard'>
                <Row className='basic-stats'>
                    <Col>
                        <dl>
                            <dt>
                                <CountUp start={0} duration={2} end={this.state.students} />
                            </dt>
                            <dd>Student accounts</dd>
                        </dl>
                    </Col>
                    <Col>
                        <dl>
                            <dt>
                                <CountUp start={0} duration={2} end={this.state.courses} />
                            </dt>
                            <dd>Published courses</dd>
                        </dl>
                    </Col>
                    <Col>
                        <dl>
                            <dt>
                                <CountUp start={0} duration={2} end={this.state.activeSessions} />
                            </dt>
                            <dd>Active sessions</dd>
                        </dl>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default connect(null, {
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(Dashboard);
