import React, { Component } from 'react';
import Hotspot from './Hotspot';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faEye, faInfo } from '@fortawesome/free-solid-svg-icons';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export default class Canvas extends Component {
    state = {
        imageWidth: 0,
        imageHeight: 0,
        isDragging: false,
    };

    canvasRef = React.createRef();

    calculateImageDimensions = async (e) => {
        const { canvasRef, fileUrl } = this.props,
            { clientWidth: canvasWidth, clientHeight: canvasHeight } = canvasRef.current;
        let { imageWidth, imageHeight } = await new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = function () {
                resolve({ imageHeight: this.height, imageWidth: this.width });
            };

            img.src = fileUrl;
        });

        if (imageWidth < canvasWidth) {
            imageHeight = imageHeight * (canvasWidth / imageWidth);
            imageWidth = canvasWidth;
        }

        if (imageHeight < canvasHeight) {
            imageWidth = imageWidth * (canvasHeight / imageHeight);
            imageHeight = canvasHeight;
        }

        this.setState({
            imageWidth,
            imageHeight,
        });
    };

    toggleHidingInfo = () =>
        this.setState({
            isDragging: !this.state.isDragging,
        });

    componentDidMount() {
        this.calculateImageDimensions();
        window.addEventListener('resize', this.calculateImageDimensions);

        if (this.canvasRef.current) {
            this.canvasRef.current.addEventListener('mousedown', this.toggleHidingInfo);
            this.canvasRef.current.addEventListener('mouseup', this.toggleHidingInfo);
            this.canvasRef.current.addEventListener('touchstart', this.toggleHidingInfo);
            this.canvasRef.current.addEventListener('touchend', this.toggleHidingInfo);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.fileUrl !== this.props.fileUrl || prevProps.canvasRef.current !== this.props.canvasRef.current) {
            this.calculateImageDimensions();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.calculateImageDimensions);

        if (this.canvasRef.current) {
            this.canvasRef.current.removeEventListener('mousedown', this.toggleHidingInfo);
            this.canvasRef.current.removeEventListener('mouseup', this.toggleHidingInfo);
            this.canvasRef.current.removeEventListener('touchstart', this.toggleHidingInfo);
            this.canvasRef.current.removeEventListener('touchend', this.toggleHidingInfo);
        }
    }

    render() {
        const { nodes, fileUrl, viewedNodes, activeNodeIndex, handleNodeClick } = this.props,
            { imageWidth, imageHeight, isDragging } = this.state;
        return (
            <div ref={this.canvasRef}>
                <span
                    className={`lesson-cards__hotspot-map-type__hiding-info${
                        isDragging ? ' lesson-cards__hotspot-map-type__hiding-info--hidden' : ''
                    }`}>
                    <Fa icon={faInfo} /> Try dragging the image around
                </span>
                <span
                    className={`lesson-cards__hotspot-map-type__hiding-info${
                        isDragging ? ' lesson-cards__hotspot-map-type__hiding-info--hidden' : ''
                    } lesson-cards__hotspot-map-type__hiding-info--right`}>
                    <Fa icon={faEye} /> {viewedNodes.length} / {nodes.length} viewed
                </span>
                <TransformWrapper>
                    <TransformComponent>
                        <img
                            className='canvas-img'
                            style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
                            draggable='false'
                            src={fileUrl}
                        />
                        {nodes.map(({ x, y }, i) => (
                            <Hotspot
                                key={i}
                                top={`${(y / 100) * imageHeight}px`}
                                left={`${(x / 100) * imageWidth}px`}
                                isViewed={viewedNodes.includes(i)}
                                isActive={activeNodeIndex === i}
                                onClick={handleNodeClick(i)}
                                index={i}
                            />
                        ))}
                    </TransformComponent>
                </TransformWrapper>
            </div>
        );
    }
}
