import React, { Component } from 'react';
import Editor from '../../../components/Editor';
import apiCall from '../../../helpers/apiCall';
import { connect } from 'react-redux';

class TermsSettings extends Component {
    state = {
        value: '',
    };

    async componentDidMount() {
        const { response: value, success, message } = await apiCall('GET', '/settings/' + this.props.settingKey);

        if (success) {
            this.setState({
                value,
            });
        } else {
            this.props.setGlobalAlert({ type: 'error', message });
        }
    }

    handleFormSubmit = async (e) => {
        e.preventDefault();

        const { message, success } = await apiCall('POST', '/settings/save/' + this.props.settingKey, {
            value: this.state.value,
        });

        if (success) {
            this.props.setGlobalAlert({
                type: 'success',
                message: message ?? this.props.title + ' saved!',
            });
        } else {
            this.props.setGlobalAlert({ type: 'error', message });
        }
    };

    handleCKEditorChange = (e) => {
        const { value } = e.target;

        this.setState({
            value,
        });
    };

    setCKEditor = (CKEditor) => {
        this.setState({
            CKEditor,
        });
    };

    render() {
        return (
            <div className='form'>
                <div className='form__content'>
                    <form action='/' onSubmit={this.handleFormSubmit}>
                        <div className='form__field'>
                            <Editor
                                name='message'
                                defaultValue={this.state.value}
                                onChange={this.handleCKEditorChange}
                            />
                        </div>
                        <div className='form__buttons'>
                            <button type='submit' className='btn bp'>
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default connect(null, {
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(TermsSettings);
