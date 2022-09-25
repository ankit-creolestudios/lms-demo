import React, { Component } from 'react';
import { ApiTable } from '../../../components/ApiTable';
import { faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import apiCall from '../../../helpers/apiCall';
import { Link, Switch, Route } from 'react-router-dom';

export default class Quizzes extends Component {
    render() {
        return (
            <div>
                <Switch>
                    <Route exact path='/admin/quizzes'>
                        <Link to='/admin/quizzes/new' className='btn btn-primary'>
                            New Quiz
                        </Link>
                        <ApiTable
                            basePath='/admin/quizzes'
                            apiCall={{
                                method: 'GET',
                                path: '/quizzes',
                            }}
                            columns={[
                                {
                                    text: 'Title',
                                    field: 'title',
                                    minWidth: '70%',
                                },
                                {
                                    text: 'Status',
                                    field: (row) => `${row.status.charAt(0).toUpperCase() + row.status.slice(1)}`,
                                },
                            ]}
                            rowButtons={[
                                {
                                    text: 'Edit quiz',
                                    url: '/admin/quizzes/:_id',
                                    icon: faPencilAlt,
                                },
                                {
                                    text: 'Delete quiz',
                                    icon: faTrash,
                                    clickCallback: async (e, row, reloadTable) => {
                                        if (window.confirm('Are you sure you want to delete this quiz?')) {
                                            const { success } = await apiCall('DELETE', '/quizzes/' + row._id);
                                            if (success) {
                                                alert(`Quiz ${row.title} was deleted`);
                                                await reloadTable();
                                            } else {
                                                alert(`Quiz ${row.title} couldn't be deleted`);
                                            }
                                        } else {
                                            alert(`Quiz ${row.title} not deleted`);
                                        }
                                    },
                                },
                            ]}
                        />
                    </Route>
                    <Route exact path='/admin/quizzes/new'>
                        <div>New Quiz Form</div>
                    </Route>
                </Switch>
            </div>
        );
    }
}
