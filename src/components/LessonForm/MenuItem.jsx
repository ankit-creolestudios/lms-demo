import React, { Component } from 'react';
import { Accordion, AccordionContext } from 'react-bootstrap';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Link, withRouter } from 'react-router-dom';
import apiCall from '../../helpers/apiCall';

class MenuItem extends Component {
    static contextType = AccordionContext;

    state = {
        pageStatus: 'LOADING',
        subItems: null,
    };

    async componentDidMount() {
        if (this.context === this.props.item._id) {
            await this.loadSubItemsData();
        }
    }

    async componentDidUpdate(prevProps, prevState) {
        if (this.context === this.props.item._id && prevState.subItems === null) {
            await this.loadSubItemsData();
        }
    }

    loadSubItemsData = async () => {
        const { success, response } = await apiCall('GET', `/courses/lessons/chapter/${this.props.item._id}`);

        if (success) {
            this.setState({
                subItems: response.lessons,
                pageStatus: 'READY',
            });
        }
    };

    render() {
        const {
                item,
                match: { params },
            } = this.props,
            { subItems, pageStatus } = this.state;

        return (
            <div className='lfmenu-item'>
                <Accordion.Toggle as='header' eventKey={item._id} onClick={this.props.onClick}>
                    <div>{item.title}</div>
                    <Fa icon={this.context === item._id ? faChevronUp : faChevronDown} />
                </Accordion.Toggle>
                <Accordion.Collapse eventKey={item._id}>
                    <div>
                        {pageStatus === 'READY' &&
                            subItems.map((lesson) => (
                                <Link
                                    key={lesson._id}
                                    to={`/admin/courses/${params.courseId}/chapters/${lesson.chapterId}/ext/lessons/edit/${lesson._id}`}
                                    className={`lfmenu-subitem${
                                        params.id === lesson._id ? ' lfmenu-subitem__active' : ''
                                    }`}>
                                    {lesson.title}
                                </Link>
                            ))}
                    </div>
                </Accordion.Collapse>
            </div>
        );
    }
}

export default withRouter(MenuItem);
