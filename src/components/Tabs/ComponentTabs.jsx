import React, { Children, Component } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';

class ComponentTabs extends Component {
    render() {
        const { children, tabs, mountOnEnter = true, unmountOnExit = true } = this.props;
        const query = new URLSearchParams(this.props.location.search);

        return (
            <Tabs mountOnEnter={mountOnEnter} unmountOnExit={unmountOnExit} defaultActiveKey={query.get('tab') ?? undefined}>
                {children && children.length !== 0
                    ? Children.map(children, (child) => {
                          const { tabTitle, hidden } = child.props,
                              tabKey = tabTitle.toLowerCase().replace(' ', '-');
                          if (hidden) {
                              return;
                          }

                          return (
                              <Tab eventKey={tabKey} title={tabTitle} key={tabKey}>
                                  {child}
                              </Tab>
                          );
                      })
                    : tabs.map((tab) => {
                          const { tabTitle, TabComponent } = tab,
                              tabKey = tabTitle.toLowerCase().replace(' ', '-');

                          return (
                              <Tab eventKey={tabKey} title={tabTitle} key={tabKey}>
                                  <TabComponent docId={this.props.docId} user={this.props.user} />
                              </Tab>
                          );
                      })}
            </Tabs>
        );
    }
}

export default withRouter(ComponentTabs);