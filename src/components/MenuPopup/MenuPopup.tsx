import React, { Component, createRef, RefObject } from 'react';
import ReactDOM from 'react-dom';
import './MenuPopup.scss';
import MenuPopupContext from './MenuPopupContext';
import MenuPopupItem from './MenuPopupItem';

interface IProps {
    isOpen?: boolean;
    parentRef?: RefObject<HTMLDivElement | HTMLSpanElement>;
    useParentWidth?: boolean;
    className?: string;
    alignment?: 'left' | 'right';
}

interface IState {
    isOpen: boolean;
    hasOpenClass: boolean;
    leftPos: number;
    topPos: number;
    width: number;
    maxWidth: number;
}

class MenuPopup extends Component<IProps, IState> {
    state = {
        isOpen: this.props.isOpen ?? false,
        hasOpenClass: false,
        leftPos: 0,
        topPos: 0,
        width: 0,
        maxWidth: 0,
    };

    popupRef: RefObject<HTMLDivElement> = createRef();

    inputEvent = 'keydown';

    get alignment() {
        return this.props.alignment ?? 'right';
    }

    componentDidMount() {
        if (this.props.isOpen) {
            if (this.props.isOpen) {
                this.openMenu();
            } else {
                this.closeMenu();
            }
        }

        document.addEventListener('mousedown', this.handleClick);
        document.addEventListener('keydown', this.inputTypeHandle);
    }

    componentDidUpdate(prevProps: any) {
        if (prevProps.isOpen !== this.props.isOpen) {
            if (this.props.isOpen) {
                this.openMenu();
            } else {
                this.closeMenu();
            }
        }
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClick);
        document.removeEventListener('keydown', this.inputTypeHandle);
    }

    inputTypeHandle = (e: any) => {
        const parentRef = this.props?.parentRef?.current;

        if (parentRef && parentRef.contains(e.target) && !this.state.isOpen) {
            this.openMenu();
        }
    };

    handleClick = (e: any) => {
        const target = e.target,
            parentRef = this.props?.parentRef?.current,
            { isOpen } = this.state,
            popupRef = this.popupRef?.current;

        if (parentRef && parentRef.contains(target) && !isOpen) {
            this.openMenu();
            return;
        }

        if (popupRef && isOpen && !popupRef.contains(target)) {
            this.closeMenu();
        }
    };

    openMenu = () => {
        this.setState(
            {
                isOpen: true,
            },
            () => {
                const { useParentWidth } = this.props,
                    parentRef = this.props?.parentRef?.current,
                    popupRef = this.popupRef?.current,
                    newState: Record<string, any> = {};
                if (popupRef && parentRef) {
                    const {
                        height: parentHeight,
                        y: parentTop,
                        left: parentLeft,
                        width: parentWidth,
                    } = parentRef.getBoundingClientRect();
                    let leftOffset = 16;

                    if (useParentWidth) {
                        newState.width = `${parentWidth}px`;
                        newState.maxWidth = `${parentWidth}px`;
                        leftOffset = 0;
                    }

                    const { width: popupWidth } = popupRef.getBoundingClientRect(),
                        leftPos =
                            this.alignment === 'right'
                                ? parentLeft - popupWidth + parentWidth + leftOffset
                                : parentLeft;

                    newState.topPos = `${parentTop + parentHeight + 10}px`;
                    newState.leftPos = `${leftPos}px`;

                    this.setState(newState as { [K in keyof IState]: IState[K] }, () => {
                        setTimeout(() => {
                            this.setState({
                                hasOpenClass: true,
                            });
                        }, 200);
                    });
                }
            }
        );
    };

    closeMenu = () => {
        this.setState(
            {
                hasOpenClass: false,
            },
            () => {
                setTimeout(() => {
                    this.setState({
                        isOpen: false,
                    });
                }, 200);
            }
        );
    };

    get className() {
        let className = 'menu-popup';

        if (this.state.hasOpenClass) {
            className += ' menu-popup--open';
        }

        if (this.props.className) {
            className += ` ${this.props.className}`;
        }

        return className;
    }

    render() {
        if (!this.state.isOpen) {
            return null;
        }

        const { leftPos, topPos, width, maxWidth } = this.state;

        return ReactDOM.createPortal(
            <div
                ref={this.popupRef}
                className={this.className}
                style={{
                    left: leftPos,
                    top: topPos,
                    width: width || '300px',
                    maxWidth: maxWidth || '300px',
                }}
            >
                <MenuPopupContext.Provider value={{ closeMenu: this.closeMenu }}>
                    {this.props.children}
                </MenuPopupContext.Provider>
            </div>,
            document.body
        );
    }
}

export default Object.assign(MenuPopup, {
    Item: MenuPopupItem,
});
