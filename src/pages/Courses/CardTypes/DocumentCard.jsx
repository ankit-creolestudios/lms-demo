import React, { Component } from 'react';
import { DownloadLink, FileIFrame } from '../../../components/ApiFile';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExternalLinkSquareAlt, faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons';
import CardButtons from '../../../components/CardButtons';
import './DocumentCard.scss';
import { Modal } from 'react-bootstrap';

export default class DocumentCard extends Component {
    state = {
        documentOpen: false,
        infoOpen: false,
    };

    toggleInfo = () => {
        this.setState({ infoOpen: !this.state.infoOpen });
    };

    toggleDocument = () => {
        this.setState({ documentOpen: !this.state.documentOpen });
    };

    render() {
        const { fileId, lessonLayout, heading, content, info } = this.props;

        return (
            <div
                className={`lesson-cards__document-type ${
                    lessonLayout !== 'page' ? 'lesson-cards__document-type--card' : 'lesson-cards__document-type--page'
                }`}>
                {lessonLayout === 'page' && (
                    <>
                        <header>{!!heading && <h1>{heading}</h1>}</header>
                        {!!content && (
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: content,
                                }}></div>
                        )}
                        <FileIFrame fileId={fileId} />
                    </>
                )}
                {lessonLayout !== 'page' && (
                    <div className='lesson-cards__document-type__card'>
                        {info && (
                            <CardButtons info={info} toggleInfo={this.toggleInfo} infoOpen={this.state.infoOpen} />
                        )}
                        <header>{!!heading && <h1>{heading}</h1>}</header>
                        {!!content && (
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: content,
                                }}
                            />
                        )}
                        <button className='bp' onClick={this.toggleDocument}>
                            View document <FontAwesomeIcon icon={faExternalLinkSquareAlt} />
                        </button>
                        <DownloadLink fileId={fileId}>
                            Download document <FontAwesomeIcon icon={faCloudDownloadAlt} />
                        </DownloadLink>
                        <Modal
                            size='lg'
                            className='document-card-modal'
                            show={this.state.documentOpen}
                            onHide={this.toggleDocument}>
                            <Modal.Header closeButton>{heading}</Modal.Header>
                            <Modal.Body>
                                <FileIFrame fileId={fileId} />
                            </Modal.Body>
                        </Modal>
                    </div>
                )}
            </div>
        );
    }
}
