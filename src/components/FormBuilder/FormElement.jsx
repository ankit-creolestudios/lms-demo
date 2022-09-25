import React, { Component } from 'react';
import { FileIFrame, FileImage } from '../ApiFile';
import DatePicker from '../DatePicker/DatePicker';
import { FileUpload } from '../FileUpload';
import { TextCard, ImageCard, DocumentCard } from '../../pages/Course/Stages/Lessons/Cards/index';

export default class FormElement extends Component {
    handleInputChange = (e) => {
        this.props.onChange(e.target.name, e.target.value);
    };

    handleCheckboxChange = (e) => {
        this.props.onChange(e.target.name, e.target.checked);
    };

    handleFileChange = (type, url, File) => {
        this.props.onChange(this.props.fieldKey, File);
    };

    handleSelectChange = (e) => {
        this.props.onChange(e.target.name, e.target.value);
    };

    render() {
        const {
            props: {
                fieldKey,
                inputType,
                extra,
                label,
                required,
                onChange,
                value,
                description,
                heading,
                subHeading,
                content,
                sourceImage,
                theme,
                imagePosition,
                imageUrl,
                sourceDocument,
                imageImportance,
            },
        } = this;

        switch (inputType) {
            case 'social security number': {
                return (
                    <div className={`form-builder__textInput${required ? ' required' : ''}`}>
                        <label htmlFor={fieldKey}>
                            {label}
                            {!!description && <small>{description}</small>}
                            <input
                                type={'text'}
                                name={fieldKey}
                                id={fieldKey}
                                required={required}
                                defaultValue={value}
                                onChange={this.handleInputChange}
                                minLength={extra?.numberOfDigits}
                                maxLength={extra?.numberOfDigits}
                            />
                        </label>
                    </div>
                );
            }
            case 'date of birth': {
                return (
                    <div className={`form-builder__optionsInput${required ? ' required' : ''}`}>
                        <DatePicker
                            id={fieldKey}
                            handleDateChange={onChange}
                            date={value}
                            label={label}
                            required={required}
                            description={description}
                            isFormElement={true}
                        />
                    </div>
                );
            }
            case 'textBlock': {
                return (
                    <TextCard
                        heading={heading}
                        subHeading={subHeading}
                        content={content}
                        sourceImage={sourceImage}
                        theme={theme}
                    />
                );
            }
            case 'checkbox': {
                return extra?.multiple && extra?.options?.length > 0 ? (
                    <div className={`form-builder__optionsInput${required ? ' required' : ''}`}>
                        <label>{label}</label>
                        {!!description && <small>{description}</small>}
                        {extra.options.map((option) => (
                            <label htmlFor={`${fieldKey}-${option}`} key={option?.value}>
                                <input
                                    type='checkbox'
                                    name={fieldKey}
                                    id={`${fieldKey}-${option?.value}`}
                                    required={option?.required}
                                    data-fieldkey={fieldKey}
                                    onChange={(e) => {
                                        this.props.onMultipleCheckboxChange(fieldKey, option?.value, e.target.checked);
                                    }}
                                />
                                {option?.value}
                            </label>
                        ))}
                    </div>
                ) : (
                    <div className={`form-builder__${inputType}Input${required ? ' required' : ''}`}>
                        <label htmlFor={fieldKey}>
                            {!!description && <small>{description}</small>}
                            <input
                                type={inputType}
                                name={fieldKey}
                                id={fieldKey}
                                required={required}
                                checked={value}
                                onChange={this.handleCheckboxChange}
                            />
                            {label}
                        </label>
                    </div>
                );
            }
            case 'text':
            case 'number': {
                return (
                    <div className={`form-builder__${inputType}Input${required ? ' required' : ''}`}>
                        <label htmlFor={fieldKey}>
                            {label}
                            {!!description && <small>{description}</small>}
                            <input
                                type={inputType}
                                name={fieldKey}
                                id={fieldKey}
                                required={required}
                                defaultValue={value}
                                onChange={this.handleInputChange}
                            />
                        </label>
                    </div>
                );
            }
            case 'textarea': {
                return (
                    <div className={`form-builder__textAreaInput${required ? ' required' : ''}`}>
                        <label htmlFor={fieldKey}>
                            {label}
                            {!!description && <small>{description}</small>}
                            <textarea
                                name={fieldKey}
                                id={fieldKey}
                                required={required}
                                onChange={this.handleInputChange}
                                defaultValue={value}
                            />
                        </label>
                    </div>
                );
            }
            case 'radio': {
                return (
                    <div className={`form-builder__radioInput${required ? ' required' : ''}`}>
                        {!!description && <small>{description}</small>}
                        {extra.options.map((option) => (
                            <label htmlFor={`${fieldKey}-${option}`} key={option}>
                                <input
                                    type={inputType}
                                    name={fieldKey}
                                    id={`${fieldKey}-${option}`}
                                    defaultValue={option}
                                    required={required}
                                    onChange={this.handleInputChange}
                                />
                                {option}
                            </label>
                        ))}
                    </div>
                );
            }
            case 'dropdown': {
                return (
                    <div className={`form-builder__optionsInput${required ? ' required' : ''}`}>
                        <label htmlFor={fieldKey}>
                            {label}
                            {!!description && <small>{description}</small>}
                            <select
                                name={fieldKey}
                                defaultValue={value}
                                onChange={this.handleSelectChange}
                                required={required}
                            >
                                <option value=''>Select a {label}</option>
                                {extra.options.map((option) => (
                                    <option value={option} key={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                );
            }
            case 'date': {
                return (
                    <div className={`form-builder__optionsInput${required ? ' required' : ''}`}>
                        <DatePicker
                            id={fieldKey}
                            handleDateChange={onChange}
                            date={value}
                            label={label}
                            required={required}
                            description={description}
                            isFormElement={true}
                        />
                    </div>
                );
            }
            case 'document': {
                return (
                    <DocumentCard
                        heading={heading}
                        content={content}
                        sourceDocument={sourceDocument ?? this?.props?.file}
                        theme={theme}
                    />
                );
            }
            case 'image': {
                return (
                    <ImageCard
                        heading={heading}
                        subHeading={subHeading}
                        content={content}
                        sourceImage={sourceImage ?? this?.props?.file}
                        imagePosition={imagePosition}
                        imageUrl={imageUrl}
                        theme={theme}
                        imageImportance={imageImportance}
                    />
                );
            }
            case 'file': {
                return (
                    <div>
                        <FileUpload
                            id='file'
                            name={fieldKey}
                            label={label}
                            handleFileChange={this.handleFileChange}
                            type={inputType}
                            required={required}
                            accept={extra?.allowedFileTypes}
                            description={description}
                        />
                    </div>
                );
            }
            default: {
                return <></>;
            }
        }
    }
}
