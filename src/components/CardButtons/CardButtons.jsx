import React, { Component } from 'react';
import './CardButtons.scss';
import { FileImage } from '../ApiFile';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faTimes, faInfo, faExpandAlt } from '@fortawesome/free-solid-svg-icons';

// Component to add in the info and image model to the ImageCard and TextCard components.

export default class CardButtons extends Component {
    render() {
        const { info, toggleInfo, infoOpen, imgBtn, imgOpen, toggleImg, imgPosition, imgId } = this.props;

        let imgPos;

        switch (imgPosition) {
            case 'TOP':
                imgPos = 'top';
                break;
            case 'LEFT':
                imgPos = 'left';
                break;
            case 'BG':
                imgPos = 'bg';
        }

        if (info) {
            return (
                <>
                    <div
                        className={`cardInfo__icon ${imgPos ? `cardInfo__icon--${imgPos}` : ''}`}
                        id='infoBtn'
                        onClick={toggleInfo}>
                        <Fa icon={infoOpen ? faTimes : faInfo} />
                    </div>
                    <div
                        className={`cardInfo__overlay ${infoOpen ? 'cardInfo__overlay--active' : ''}`}
                        onClick={toggleInfo}>
                        <div
                            id='infoModal'
                            className={`cardInfo__modal ${infoOpen ? 'cardInfo__modal--active' : ''}`}
                            dangerouslySetInnerHTML={{ __html: info }}></div>
                    </div>
                </>
            );
        }

        if (imgBtn) {
            return (
                <>
                    <div className={`cardImg__icon cardImg__icon--${imgPos}`} id='infoBtn' onClick={toggleImg}>
                        <Fa icon={imgOpen ? faTimes : faExpandAlt} />
                    </div>
                    <div
                        className={`cardInfo__overlay ${imgOpen ? 'cardInfo__overlay--active' : ''}`}
                        onClick={toggleImg}>
                        <div id='infoModal' className={`cardImg__modal ${imgOpen ? 'cardImg__modal--active' : ''}`}>
                            <FileImage fileId={imgId} />
                        </div>
                    </div>
                </>
            );
        }
    }
}
