import React, { Component } from 'react';
import FormElement from './FormElement';
import './FormBuilder.scss';

export default class FormBuilder extends Component {
    constructor(props) {
        super(props);

        this.state = Array.isArray(props.fields)
            ? Object.fromEntries(
                  props.fields.reduce((fields, field) => {
                      if (field.key) {
                          const fieldHasMultipleCheckboxes =
                              field.inputType === 'checkbox' &&
                              field?.extra?.multiple &&
                              field?.extra?.options.length > 0;

                          if (fieldHasMultipleCheckboxes) {
                              let multipleCheckboxFields = [];
                              field.extra.options.forEach((option) => {
                                  multipleCheckboxFields.push({ [option.value]: false });
                              });
                              fields.push([field.key, multipleCheckboxFields]);
                          } else {
                              fields.push([field.key, null]);
                          }
                      }

                      return fields;
                  }, [])
              )
            : [];
    }

    handleInputChange = (key, value) => {
        this.setState({
            [key]: value,
        });
    };

    muplitpleCheckboxChange = (fieldKey, checkboxKey, value) => {
        let allCheckboxOptions = this.state[fieldKey];
        this.setState({
            [fieldKey]: allCheckboxOptions.map((thisItem) => {
                if (Object.keys(thisItem)[0] === checkboxKey) {
                    thisItem[checkboxKey] = value;
                }
                return thisItem;
            }),
        });
    };

    handleMultipleChange = (item, multiple) => {
        this.setState({
            items: this.state.items.map((thisItem) => {
                if (item.uuid === thisItem.uuid) {
                    thisItem.extra.multiple = JSON.parse(multiple);
                }
                return thisItem;
            }),
        });
    };

    render() {
        const { onSubmit, fields, header: Header } = this.props;

        return (
            <form
                className='form-builder'
                onSubmit={(e) => {
                    e.preventDefault();
                    if (onSubmit && typeof onSubmit === 'function') {
                        onSubmit(this.state);
                    }
                }}
            >
                {Header && <Header />}
                <main>
                    {Array.isArray(fields) && fields.length > 0 ? (
                        <div>
                            {fields.map((field, i) => (
                                <FormElement
                                    {...field}
                                    fieldKey={field.key}
                                    key={`${field.key}-${i}`}
                                    value={this.state[field.key]}
                                    onChange={this.handleInputChange}
                                    onMultipleCheckboxChange={this.muplitpleCheckboxChange}
                                />
                            ))}
                        </div>
                    ) : (
                        <div />
                    )}
                </main>
                <footer>
                    <button type='submit' className='bp'>
                        {this.props.submitText ?? 'Submit'}
                    </button>
                </footer>
            </form>
        );
    }
}
