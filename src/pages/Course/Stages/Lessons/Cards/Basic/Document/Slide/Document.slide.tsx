import React, { Component } from 'react';
import { DownloadLink, FileIFrame } from 'src/components/ApiFile';
import './Document.slide.scss';
import { Modal } from 'react-bootstrap';

export interface IProps {
    heading?: string;
    content?: string;
    sourceDocument?: string;
    theme?: string;
    info?: string;
}
interface IState {
    documentOpen: boolean;
}
export default class DocumentSlide extends Component<IProps, IState> {
    state: IState = {
        documentOpen: false,
    };

    toggleDocument = () => {
        this.setState({ documentOpen: !this.state.documentOpen });
    };

    render() {
        const { sourceDocument, heading, content } = this.props;

        return (
            <div className={`document-type document-type--card`}>
                <div className='card'>
                    <header>{!!heading && <h1>{heading}</h1>}</header>
                    {!!content && (
                        <div
                            dangerouslySetInnerHTML={{
                                __html: content,
                            }}
                        />
                    )}
                    <button className='bp' onClick={this.toggleDocument}>
                        View document <i className='fa-solid fa-square-arrow-up-right'></i>
                    </button>
                    <DownloadLink fileId={sourceDocument}>
                        Download document <i className='fa-solid fa-cloud-arrow-down'></i>
                    </DownloadLink>
                    <Modal
                        size='lg'
                        className='document-card-modal'
                        show={this.state.documentOpen}
                        onHide={this.toggleDocument}
                    >
                        <Modal.Header closeButton>{heading}</Modal.Header>
                        <Modal.Body>
                            <FileIFrame fileId={sourceDocument} />
                        </Modal.Body>
                    </Modal>
                </div>
            </div>
        );
    }
}
