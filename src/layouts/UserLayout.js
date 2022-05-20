import React, { Fragment } from 'react';
import { Link, Redirect, Switch, Route } from 'dva/router';
import DocumentTitle from 'react-document-title';
import { Icon } from 'antd';
import GlobalFooter from '../components/GlobalFooter';
import styles from './UserLayout.less';
import { getRoutes } from '../utils/utils';

const links = [
  {
    key: 'help',
    title: '帮助',
    //href: 'https://kpaas.gitbook.io',
    href: 'https://docs.kpaas.nsini.com',
  }
];

const copyright = (
  <Fragment>
    Copyright <Icon type="copyright" /> 2019 PaaS技术部出品
  </Fragment>
);

class UserLayout extends React.PureComponent {
  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = 'PaaS';
    if (routerData[pathname] && routerData[pathname].name) {
      title = `${routerData[pathname].name} - PaaS`;
    }
    return title;
  }
  render() {
    const { routerData, match } = this.props;
    return (
      <DocumentTitle title={this.getPageTitle()}>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.top}>
              <div className={styles.header}>
                <Link to="/">
                  <img alt="logo" className={styles.logo} src="http://localhost:8000/src/routes/Dashboard/UserLanding/images/avatar.jpg" />
                  <span className={styles.title}>PaaS云平台</span>
                </Link>
              </div>
              <div className={styles.desc}>PaaS 解决方案</div>
            </div>
            <Switch>
              {getRoutes(match.path, routerData).map(item => (
                <Route
                  key={item.key}
                  path={item.path}
                  component={item.component}
                  exact={item.exact}
                />
              ))}
              <Redirect exact from="/user" to="/user/login" />
            </Switch>
          </div>
          <GlobalFooter links={links} copyright={copyright} wxcode={true} />
        </div>
      </DocumentTitle>
    );
  }
}

export default UserLayout;
