import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import CoreLibraryForm from './CoreLibraryForm';
import CoreLibraryTable from './CoreLibraryTable';
import LessonForm from '../../../components/LessonForm';
import Lesson from 'src/pages/Admin/Courses/Lesson';

export default class Courses extends Component {
    render() {
        return (
            <div>
                <Switch>
                    <Route exact path='/admin/core-library' component={CoreLibraryTable} />
                    <Route
                        exact
                        path='/admin/core-library/create'
                        key='admin-coreLibrary-create'
                        component={CoreLibraryForm}
                    />
                    <Route
                        exact
                        path='/admin/core-library/edit/:id'
                        key='admin-coreLibrary-edit'
                        component={CoreLibraryForm}
                    />
                    <Route exact path='/admin/core-library/lessons/edit/:id' component={LessonForm} />
                    <Route
                        exact
                        path='/admin/core-library/:coreId/chapters/:chapterId/lessons/:lessonId'
                        component={Lesson}
                    />
                </Switch>
            </div>
        );
    }
}
