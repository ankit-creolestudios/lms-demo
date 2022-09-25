import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import apiCall from '../../../helpers/apiCall';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './Navigation.scss';
import { Accordion } from 'react-bootstrap';
import { NavigationContext } from './NavigationContext';
import { CourseContext } from '../CourseContext';
import { Spinner } from '../../../components/Spinner';
import humanizeDuration from 'humanize-duration';

class Navigation extends Component {
    static contextType = CourseContext;

    _isMounted = false;

    state = {
        chapters: null,
        pageStatus: 'LOADING',
        activeAccordion: null,
        fixedProgress: false,
    };

    menuRef = React.createRef();

    async componentDidMount() {
        this._isMounted = true;

        const { success, response } = await apiCall('GET', this.props.itemsEndpoint);

        if (success && this._isMounted) {
            this.setState({
                chapters: Array.isArray(response) ? response : response.chapters,
                pageStatus: 'READY',
                activeAccordion: this.props.match.params.chapterId,
            });
        }

        if (this.menuRef.current) {
            this.initMenuScrollEvent();
        }
    }

    initMenuScrollEvent = () => {
        this.menuRef.current.addEventListener('scroll', (e) => {
            const target = e.target,
                h3 = target.querySelector('header > h3'),
                { fixedProgress } = this.state;

            if (h3 && target.scrollTop >= h3.clientHeight) {
                if (fixedProgress) {
                    return;
                }

                this.setState({
                    fixedProgress: true,
                });
            } else {
                if (!fixedProgress) {
                    return;
                }

                this.setState({
                    fixedProgress: false,
                });
            }
        });
    };

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.match.params.chapterId !== prevProps.match.params.chapterId) {
            this.setState({
                activeAccordion: this.props.match.params.chapterId,
            });
        }
    }

    toggleOpenAccordion = (chapterId) => {
        if (this.state.activeAccordion === chapterId) {
            this.setState({
                activeAccordion: null,
            });
        } else {
            this.setState({
                activeAccordion: chapterId,
            });
        }
    };

    render() {
        const {
            state: { pageStatus },
            props: { children },
            context: { lessonLayout, isMenuOpen, animateMenu },
        } = this;

        if (pageStatus === 'READY' && lessonLayout !== null) {
            const {
                    state: { chapters, fixedProgress },
                    props: { itemsComponent: MenuItem, showHeader = false },
                } = this,
                { title, percentageProgress, lessons, courseProgress, expiresAt, availability } =
                    this.context.data || {},
                totalHours = humanizeDuration(lessons?.totalRequiredTime * 60_000, {
                    units: ['h'],
                    round: true,
                }),
                hoursProgress = humanizeDuration(courseProgress * 60_000, {
                    units: ['h'],
                    round: true,
                }),
                daysLeftInt = Math.floor(new Date(expiresAt).getTime() - Date.now()),
                availabilityMillisecs = availability * 24 * 3_600_000,
                daysLeft = humanizeDuration(daysLeftInt > availabilityMillisecs ? availabilityMillisecs : daysLeftInt, {
                    units: ['d'],
                    round: true,
                });

            return (
                <menu
                    ref={this.menuRef}
                    className={`cmenu${fixedProgress ? ' cmenu__progress--fixed' : ''}${
                        lessonLayout ? ` cmenu--${lessonLayout.toLowerCase()}` : ''
                    }${isMenuOpen ? ` cmenu--${lessonLayout.toLowerCase()}--open` : ''}${
                        animateMenu ? ` cmenu--${lessonLayout.toLowerCase()}--animate` : ''
                    }`}
                >
                    {showHeader && (
                        <>
                            <header>
                                <h3>{title}</h3>
                            </header>
                            <div className='cmenu__progress'>
                                <CircularProgressbar
                                    value={percentageProgress}
                                    text={`${Math.floor(percentageProgress)}%`}
                                    strokeWidth={14}
                                />
                                <span>
                                    {hoursProgress.slice(0, -6)} of {totalHours} completed
                                </span>
                                <b>Expires in {daysLeft}</b>
                            </div>
                        </>
                    )}
                    <NavigationContext.Provider value={this.menuRef}>
                        <Accordion activeKey={this.state.activeAccordion}>
                            {chapters.map((chapter) => (
                                <MenuItem
                                    item={chapter}
                                    key={chapter._id}
                                    onClick={() => {
                                        this.toggleOpenAccordion(chapter._id);
                                    }}
                                />
                            ))}
                        </Accordion>
                    </NavigationContext.Provider>
                    {children}
                </menu>
            );
        } else if (pageStatus === 'READY') {
            return <></>;
        } else {
            return (
                <menu ref={this.menuRef} className={`cmenu`}>
                    <Spinner />
                </menu>
            );
        }
    }
}

export default withRouter(Navigation);
