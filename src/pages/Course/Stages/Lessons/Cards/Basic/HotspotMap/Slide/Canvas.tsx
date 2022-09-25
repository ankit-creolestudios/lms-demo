import React, { Component, ImgHTMLAttributes, MouseEventHandler } from 'react';
import Hotspot from './Hotspot';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface IProps {
    canvasRef: any;
    fileUrl?: string;
    nodes: any[];
    viewedNodes?: any[];
    activeNodeIndex?: number | null;
    handleNodeClick: (i: any) => (e: any) => Promise<void>;
}
export default class Canvas extends Component<IProps> {
    state = {
        imageWidth: 0,
        imageHeight: 0,
        isDragging: false,
    };

    canvasRef: React.RefObject<HTMLInputElement> = React.createRef();

    calculateImageDimensions = async () => {
        const { canvasRef, fileUrl } = this.props,
            { clientWidth: canvasWidth, clientHeight: canvasHeight } = canvasRef.current;
        let { imageWidth, imageHeight } = await new Promise((resolve, reject) => {
            const img: any = new Image();

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

    componentDidUpdate(prevProps: IProps) {
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
                <span className={`hiding-info${isDragging ? ' hiding-info--hidden' : ''}`}>
                    <i className='fa-solid fa-info'></i> Try dragging the image around
                </span>
                <span className={`hiding-info${isDragging ? ' hiding-info--hidden' : ''} hiding-info--right`}>
                    <i className='fa-solid fa-eye'></i> {viewedNodes && viewedNodes.length} / {nodes.length} viewed
                </span>
                <TransformWrapper>
                    <TransformComponent>
                        <img
                            className='canvas-img'
                            style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
                            draggable='false'
                            src={fileUrl}
                        />
                        {nodes.map(({ x, y }, i: any) => (
                            <Hotspot
                                key={i}
                                top={`${(y / 100) * imageHeight}px`}
                                left={`${(x / 100) * imageWidth}px`}
                                isViewed={(viewedNodes && viewedNodes.includes(i)) ?? false}
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
