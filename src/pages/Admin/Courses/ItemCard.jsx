import React, { Component } from 'react';
import {
    Row,
    Col,
    Accordion,
    Card,
    Button,
    Form,
    FormGroup,
    OverlayTrigger,
    Tooltip,
    InputGroup,
    FormControl,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrash, faTimes, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { ConfirmationModal } from '../../../components/ConfirmationModal';
import apiFile from '../../../helpers/apiFile';
import Select from 'react-select';
import ImageCard from './CardTypes/ImageCard';
import DocumentCard from './CardTypes/DocumentCard';
import TextCard from './CardTypes/TextCard';
import DatePicker from 'src/components/DatePicker/DatePicker';
import moment from 'moment';

export default class ItemCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputTitle: props.item.inputType[0].toUpperCase() + props.item.inputType.substr(1),
            modalShow: false,
            modalAction: null,
            modalType: '',
            fileUrl: '',
        };
    }

    async componentDidMount() {
        if (this.props.item?.extra?.fileId) {
            this.setState({
                fileUrl: await apiFile(this.props.item.extra.fileId),
            });
        }
    }

    handleFileChange = (name, file, value) => {
        this.props.handleFileChange(this.props.item, name, file);
    };

    render() {
        const allowedFileTypes = [
            { value: '.pdf', label: 'pdf' },
            { value: '.doc', label: 'doc' },
            { value: '.docx', label: 'docx' },
            { value: '.odt', label: 'odt' },
            { value: '.jpg', label: 'jpg' },
            { value: '.jpeg', label: 'jpeg' },
            { value: '.gif', label: 'gif' },
            { value: '.png', label: 'png' },
            { value: '.webp', label: 'webp' },
        ];

        let allowedFileTypesList = [];
        if (this.props.item.inputType === 'file' && this.props.item.extra?.allowedFileTypes?.length) {
            allowedFileTypesList = this.props.item.extra.allowedFileTypes.split(', ').map((type) => {
                return {
                    value: type,
                    label: type.replace('.', ''),
                };
            });
        }

        return (
            <div>
                <ConfirmationModal
                    show={this.state.modalShow}
                    hideModal={() => {
                        this.setState({
                            modalShow: false,
                        });
                    }}
                    confirmAction={this.state.modalAction}
                    titleText={'Are you sure?'}
                    bodyText={[
                        'You are about to ',
                        <strong key='modal-type'>{this.state.modalType}</strong>,
                        ' this Form Input.',
                    ]}
                />
                <Accordion defaultActiveKey='1'>
                    <Card style={{ overflow: 'initial' }}>
                        <Accordion.Toggle as={Card.Header} eventKey='0'>
                            <Row>
                                <Col xs={12} md={6}>
                                    <span
                                        {...this.props.dragHandleProps}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faEllipsisV} style={{ marginRight: '20px' }} />
                                    </span>
                                    <Form.Label htmlFor='blockTitle' className='pt-2' style={{ fontWeight: 'normal' }}>
                                        {this.state.inputTitle}
                                    </Form.Label>
                                </Col>
                                <Col xs={12} md={6} className='my-2 my-md-0'>
                                    <OverlayTrigger
                                        key={`tooltip-delete-${this.props.idx}`}
                                        placement='top'
                                        overlay={<Tooltip id={`tooltip-delete-${this.props.idx}`}>Delete</Tooltip>}
                                    >
                                        <Button
                                            variant='link'
                                            type='button'
                                            className='float-right ml-1'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                this.setState({
                                                    modalShow: true,
                                                    modalAction: () => {
                                                        this.props.deleteItem(this.props.idx);
                                                    },
                                                    modalType: 'delete',
                                                });
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                    </OverlayTrigger>
                                    <OverlayTrigger
                                        key={`tooltip-edit-${this.props.idx}`}
                                        placement='top'
                                        overlay={<Tooltip id={`tooltip-edit-${this.props.idx}`}>Edit</Tooltip>}
                                    >
                                        <Accordion.Toggle
                                            as={Button}
                                            variant='link'
                                            className='float-right mx-1'
                                            eventKey='0'
                                        >
                                            <FontAwesomeIcon icon={faPencilAlt} />
                                        </Accordion.Toggle>
                                    </OverlayTrigger>
                                </Col>
                            </Row>
                        </Accordion.Toggle>

                        <Accordion.Collapse eventKey='0'>
                            <Card.Body>
                                {this.props.item.inputType === 'textBlock' && (
                                    <Row>
                                        <Col>
                                            <div className='card-types__item'>
                                                <TextCard
                                                    idx={this.props.idx}
                                                    heading={this.props.item.heading}
                                                    subHeading={this.props.item.subHeading}
                                                    sourceImage={this.props.item.sourceImage}
                                                    content={this.props.item.content}
                                                    info={this.props.item.info}
                                                    theme={this.props.item.theme}
                                                    handleContentBlockChange={this.props.handleChange}
                                                    handleFileChange={this.handleFileChange}
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                )}
                                {this.props.item.inputType === 'document' && (
                                    <Row>
                                        <Col>
                                            <div className='card-types__item'>
                                                <DocumentCard
                                                    idx={this.props.idx}
                                                    heading={this.props.item.heading}
                                                    content={this.props.item.content}
                                                    info={this.props.item.info}
                                                    theme={this.props.item.theme}
                                                    sourceDocument={this.props.item.sourceDocument}
                                                    handleContentBlockChange={this.props.handleChange}
                                                    handleFileChange={this.handleFileChange}
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                )}
                                {this.props.item.inputType === 'image' && (
                                    <Row>
                                        <Col>
                                            <div className='card-types__item'>
                                                <ImageCard
                                                    idx={this.props.idx}
                                                    heading={this.props.item.heading}
                                                    subHeading={this.props.item.subHeading}
                                                    sourceImage={this.props.item.sourceImage}
                                                    content={this.props.item.content}
                                                    info={this.props.item.info}
                                                    theme={this.props.item.theme}
                                                    handleContentBlockChange={this.props.handleChange}
                                                    handleFileChange={this.handleFileChange}
                                                    imageUrl={this.props.item.imageUrl}
                                                    imagePosition={this.props.item.imagePosition}
                                                    imageImportance={this.props.item.imageImportance}
                                                    allowEnlargeImage={this.props.item.allowEnlargeImage}
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                )}
                                {this.props.item.inputType !== 'textBlock' &&
                                    this.props.item.inputType !== 'document' &&
                                    this.props.item.inputType !== 'image' && (
                                        <div>
                                            <Row>
                                                <Col xs={12} md={6}>
                                                    <FormGroup>
                                                        <Form.Label htmlFor='label'>Label</Form.Label>
                                                        <Form.Control
                                                            type='text'
                                                            required
                                                            minLength='3'
                                                            maxLength='512'
                                                            id='label'
                                                            name='label'
                                                            value={this.props.item.label}
                                                            onChange={(event) => {
                                                                this.props.handleChange(
                                                                    this.props.idx,
                                                                    'label',
                                                                    event.target.value
                                                                );
                                                            }}
                                                        />
                                                    </FormGroup>
                                                    {this.props.item.inputType === 'file' && (
                                                        <FormGroup>
                                                            <Form.Label htmlFor='allowedFileTypes'>
                                                                Allowed File Types
                                                            </Form.Label>
                                                            <Select
                                                                required
                                                                defaultValue={allowedFileTypesList}
                                                                isMulti
                                                                id='allowedFileTypes'
                                                                name='allowedFileTypes'
                                                                options={allowedFileTypes}
                                                                className='basic-multi-select'
                                                                classNamePrefix='select'
                                                                menuPortalTarget={document.body}
                                                                menuPosition={'fixed'}
                                                                styles={{
                                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                                }}
                                                                closeMenuOnScroll={(event) => {
                                                                    return event.target.id === 'mainContainerId';
                                                                }}
                                                                onChange={(opt) => {
                                                                    this.props.handleChange(
                                                                        this.props.idx,
                                                                        'extra.allowedFileTypes',
                                                                        opt
                                                                            ?.map((obj) => {
                                                                                return obj.value;
                                                                            })
                                                                            .join(', ')
                                                                    );
                                                                }}
                                                            />
                                                        </FormGroup>
                                                    )}
                                                    <FormGroup>
                                                        <Row>
                                                            {!this.props.item.extra?.multiple && (
                                                                <Col>
                                                                    <Form.Label htmlFor='requiredField'>
                                                                        Required Field
                                                                    </Form.Label>
                                                                    <Form.Control
                                                                        as='select'
                                                                        id='requiredField'
                                                                        name='requiredField'
                                                                        required
                                                                        value={this.props.item.required}
                                                                        onChange={(event) => {
                                                                            this.props.handleChange(
                                                                                this.props.idx,
                                                                                'required',
                                                                                event.target.value
                                                                            );
                                                                        }}
                                                                    >
                                                                        <option disabled value=''></option>
                                                                        <option value='true'>Yes</option>
                                                                        <option value='false'>No</option>
                                                                    </Form.Control>
                                                                </Col>
                                                            )}
                                                            {this.props.item.inputType === 'social security number' && (
                                                                <Col>
                                                                    <Form.Label htmlFor='numberOfDigits'>
                                                                        Number Of Digits
                                                                    </Form.Label>
                                                                    <Form.Control
                                                                        type='number'
                                                                        required
                                                                        min={0}
                                                                        max={9}
                                                                        id='numberOfDigits'
                                                                        name='numberOfdigits'
                                                                        value={this.props.item.extra.numberOfDigits}
                                                                        onChange={(event) => {
                                                                            this.props.handleExtraChange(
                                                                                this.props.idx,
                                                                                'numberOfDigits',
                                                                                event.target.value
                                                                            );
                                                                        }}
                                                                    />
                                                                </Col>
                                                            )}

                                                            <Col>
                                                                <Form.Label htmlFor='key'>Key</Form.Label>
                                                                <Form.Control
                                                                    readOnly={
                                                                        this.props.item.inputType ===
                                                                            'social security number' ||
                                                                        this.props.item.inputType === 'date of birth'
                                                                    }
                                                                    type='text'
                                                                    required
                                                                    minLength='3'
                                                                    maxLength='512'
                                                                    id='key'
                                                                    name='key'
                                                                    value={
                                                                        this.props.item.inputType ===
                                                                        'social security number'
                                                                            ? 'ssnKey'
                                                                            : this.props.item.inputType ===
                                                                              'date of birth'
                                                                            ? 'dobKey'
                                                                            : this.props.item.key
                                                                    }
                                                                    onChange={(event) => {
                                                                        this.props.handleChange(
                                                                            this.props.idx,
                                                                            'key',
                                                                            event.target.value
                                                                        );
                                                                    }}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    </FormGroup>
                                                </Col>
                                                <Col xs={12} md={6}>
                                                    <FormGroup>
                                                        <Form.Label htmlFor='description'>Description</Form.Label>
                                                        <Form.Control
                                                            as='textarea'
                                                            type='text'
                                                            rows='5'
                                                            id='description'
                                                            name='description'
                                                            value={this.props.item.description}
                                                            onChange={(event) => {
                                                                this.props.handleChange(
                                                                    this.props.idx,
                                                                    'description',
                                                                    event.target.value
                                                                );
                                                            }}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            {this.props.item.inputType === 'dropdown' ||
                                            this.props.item.inputType === 'options' ||
                                            this.props.item.inputType === 'radio' ? (
                                                <Row>
                                                    <Col xs={12} md={6}>
                                                        <FormGroup>
                                                            <Form.Label className='mb-0'>Options</Form.Label>
                                                        </FormGroup>

                                                        {this.props.item.extra?.options?.map((opt, i) => {
                                                            return (
                                                                <InputGroup className='mb-3' key={i}>
                                                                    <FormControl
                                                                        value={opt}
                                                                        onChange={(event) => {
                                                                            this.props.handleOptionChange(
                                                                                this.props.item,
                                                                                i,
                                                                                event.target.value
                                                                            );
                                                                        }}
                                                                    />
                                                                    <InputGroup.Append>
                                                                        <Button
                                                                            type='button'
                                                                            variant='link'
                                                                            onClick={() => {
                                                                                this.props.removeItemOption(
                                                                                    this.props.item,
                                                                                    i
                                                                                );
                                                                            }}
                                                                        >
                                                                            <FontAwesomeIcon icon={faTimes} />
                                                                        </Button>
                                                                    </InputGroup.Append>
                                                                </InputGroup>
                                                            );
                                                        })}
                                                        <Button
                                                            variant='btn bd'
                                                            type='button'
                                                            className='mt-3'
                                                            onClick={() => {
                                                                this.props.addItemOption(this.props.item);
                                                            }}
                                                        >
                                                            Add an option
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            ) : (
                                                <></>
                                            )}
                                            {this.props.item.inputType === 'checkbox' ? (
                                                <>
                                                    <Row>
                                                        <Col xs={12} md={6}>
                                                            <Form.Label htmlFor='multiple'>
                                                                Multiple Checkboxes
                                                            </Form.Label>
                                                            <Form.Control
                                                                as='select'
                                                                id='multiple'
                                                                name='multiple'
                                                                required
                                                                value={this.props.item.extra.multiple}
                                                                onChange={(event) => {
                                                                    this.props.handleMultipleChange(
                                                                        this.props.item,
                                                                        event.target.value
                                                                    );
                                                                }}
                                                            >
                                                                <option disabled value=''></option>
                                                                <option value={true}>Yes</option>
                                                                <option value={false}>No</option>
                                                            </Form.Control>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        {this.props.item.extra?.multiple && (
                                                            <Col xs={12} md={6}>
                                                                <FormGroup>
                                                                    <Form.Label className='mb-0'>Options</Form.Label>
                                                                </FormGroup>

                                                                {this.props.item.extra.options.map((opt, i) => {
                                                                    return (
                                                                        <InputGroup className='mb-3' key={i}>
                                                                            <Form.Check
                                                                                className='mr-2'
                                                                                type='checkbox'
                                                                                id={`default-checkbox`}
                                                                                checked={opt.required}
                                                                                value={opt?.required}
                                                                                onChange={(event) => {
                                                                                    this.props.handleCheckboxValueChange(
                                                                                        this.props.item,
                                                                                        i,
                                                                                        event.target.checked,
                                                                                        'required'
                                                                                    );
                                                                                }}
                                                                            />
                                                                            <FormControl
                                                                                value={opt?.value}
                                                                                onChange={(event) => {
                                                                                    this.props.handleCheckboxValueChange(
                                                                                        this.props.item,
                                                                                        i,
                                                                                        event.target.value,
                                                                                        'value'
                                                                                    );
                                                                                }}
                                                                            />
                                                                            <InputGroup.Append>
                                                                                <Button
                                                                                    type='button'
                                                                                    variant='link'
                                                                                    onClick={() => {
                                                                                        this.props.removeItemOption(
                                                                                            this.props.item,
                                                                                            i
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    <FontAwesomeIcon icon={faTimes} />
                                                                                </Button>
                                                                            </InputGroup.Append>
                                                                        </InputGroup>
                                                                    );
                                                                })}
                                                                <Button
                                                                    variant='btn bd'
                                                                    type='button'
                                                                    className='mt-3'
                                                                    onClick={() => {
                                                                        this.props.addItemOption(this.props.item, true);
                                                                    }}
                                                                >
                                                                    Add an option
                                                                </Button>
                                                            </Col>
                                                        )}
                                                    </Row>
                                                </>
                                            ) : (
                                                <></>
                                            )}
                                        </div>
                                    )}
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                </Accordion>
            </div>
        );
    }
}
