import { createElement } from 'react';
import dynamic from 'dva/dynamic';
import pathToRegexp from 'path-to-regexp';
import { getMenuData } from './menu';

let routerDataCache;

const modelNotExisted = (app, model) =>
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf('.then(') < 0) {
    models.forEach(model => {
      if (modelNotExisted(app, model)) {
        // eslint-disable-next-line
        app.model(require(`../models/${model}`).default);
      }
    });
    return props => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache,
      });
    };
  }
  // () => import('module')
  return dynamic({
    app,
    models: () =>
      models.filter(model => modelNotExisted(app, model)).map(m => import(`../models/${m}.js`)),
    // add routerData prop
    component: () => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return component().then(raw => {
        const Component = raw.default || raw;
        return props =>
          createElement(Component, {
            ...props,
            routerData: routerDataCache,
          });
      });
    },
  });
};

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach(item => {
    if (item.children) {
      keys[item.path] = { ...item };
      keys = { ...keys, ...getFlatMenuData(item.children) };
    } else {
      keys[item.path] = { ...item };
    }
  });
  return keys;
}

export const getRouterData = app => {
  const routerConfig = {
    '/': {
      component: dynamicWrapper(app, ['user', 'login'], () => import('../layouts/BasicLayout')),
    },
    '/dashboard/workplace': {
      component: dynamicWrapper(app, ['project', 'activities', 'chart', 'monitor'], () =>
        import('../routes/Dashboard/Workplace'),
      ),
    },
    '/dashboard/monitor': {
      component: dynamicWrapper(app, ['monitor'], () => import('../routes/Dashboard/Monitor')),
    },
    '/dashboard/statistics': {
      component: dynamicWrapper(app, ['statistics'], () => import('../routes/Dashboard/Statistics')),
    },
    '/exception/403': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/403')),
    },
    '/exception/404': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/404')),
    },
    '/exception/500': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/500')),
    },
    '/project/list': {
      name: '????????????',
      component: dynamicWrapper(app, ['form'], () => import('../routes/ProjectTemplate/BasicList')),
    },
    '/project/audit': {
      name: '????????????',
      component: dynamicWrapper(app, ['form'], () => import('../routes/ProjectTemplate/AuditList')),
    },
    '/project/detail/:namespace/:name': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'pods', 'jenkins', 'builds', 'storage'], () => import('../routes/ProjectTemplate/Detail')),
    },
    '/project/detail/:namespace/:name/overview': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'pods'], () => import('../routes/ProjectTemplate/Detail')),
    },
    '/project/detail/:namespace/:name/configmap': {
      name: '????????????',
      component: dynamicWrapper(app, ['form'], () => import('../routes/ProjectTemplate/Detail')),
    },
    '/project/detail/:namespace/:name/dockerfile': {
      name: '????????????',
      component: dynamicWrapper(app, ['form'], () => import('../routes/ProjectTemplate/Detail')),
    },
    '/project/detail/:namespace/:name/persistentvolume': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'storage'], () => import('../routes/ProjectTemplate/Detail')),
    },
    '/project/detail/:namespace/:name/webhooks': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'webhook'], () => import('../routes/ProjectTemplate/Detail')),
    },
    '/project/create': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'gitlab'], () => import('../routes/ProjectTemplate/StepForm/Index')),
    },
    '/project/cornjob/list': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'cronjob'], () => import('../routes/Cronjob/cronjob')),
    },
    '/project/cornjob/add': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'gitlab', 'cronjob'], () => import('../routes/Cronjob/Add')),
    },
    '/project/cornjob/addcjob': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'gitlab', 'cronjob'], () => import('../routes/Cronjob/AddCjob')),
    },
    '/project/cornjob/edit/:name': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'gitlab', 'cronjob'], () => import('../routes/Cronjob/AddCjob')),
    },
    '/project/cornjob/detail/:namespace/:name': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'gitlab', 'cronjob'], () => import('../routes/Cronjob/Detail')),
    },
    '/project/cornjob/detail/:namespace/:name/overview': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'gitlab', 'cronjob'], () => import('../routes/Cronjob/Detail')),
    },
    '/project/cornjob/detail/:namespace/:name/build-logs': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'gitlab', 'cronjob'], () => import('../routes/Cronjob/Detail')),
    },
    '/project/create/info': {
      name: '??????????????????????????????????????????',
      component: dynamicWrapper(app, ['form'], () => import('../routes/ProjectTemplate/StepForm/Step1')),
    },
    '/project/create/:namespace/basic/:name': {
      name: '??????????????????????????????????????????',
      component: dynamicWrapper(app, ['form'], () => import('../routes/ProjectTemplate/StepForm/Step2')),
    },
    '/project/create/rule/:projectId': {
      name: '??????????????????????????????????????????',
      component: dynamicWrapper(app, ['form'], () => import('../routes/ProjectTemplate/StepForm/Step3')),
    },
    '/project/create/success': {
      name: '??????????????????????????????',
      component: dynamicWrapper(app, ['form'], () => import('../routes/ProjectTemplate/StepForm/Step4')),
    },
    '/project/discovery/services/list': {
      name: '?????????????????????',
      component: dynamicWrapper(app, ['form', 'services'], () => import('../routes/Discovery/Service')),
    },
    '/project/discovery/services/create': {
      name: '??????Service',
      component: dynamicWrapper(app, ['form', 'services'], () => import('../routes/Discovery/Service/Add')),
    },
    '/project/discovery/services/edit/:namespace/:name': {
      name: '??????Service',
      component: dynamicWrapper(app, ['form', 'services'], () => import('../routes/Discovery/Service/Add')),
    },
    '/project/discovery/services/detail/:namespace/:name': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'services'], () => import('../routes/Discovery/Service/Detail')),
    },
    '/pods/:namespace/:svc/detail/:name': {
      name: 'Pods??????',
      component: dynamicWrapper(app, ['form', 'pods'], () => import('../routes/Pods/Detail')),
    },
    '/pods/:namespace/:svc/detail/:name/overview': {
      name: 'Pods??????',
      component: dynamicWrapper(app, ['form', 'pods'], () => import('../routes/Pods/Detail')),
    },
    '/pods/:namespace/job/:name/logs/:svc': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'pods'], () => import('../routes/Pods/JobLogs')),
    },
    '/pods/:namespace/detail/:name/logs': {
      name: 'Pods??????',
      component: dynamicWrapper(app, ['form', 'pods'], () => import('../routes/Pods/Detail')),
    },
    '/template/list': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'template'], () => import('../routes/Template/TempList')),
    },
    '/template/create': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'template'], () => import('../routes/Template/AddTemp')),
    },
    '/template/eidt/:id': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'template'], () => import('../routes/Template/AddTemp')),
    },
    '/template/message/list': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'template'], () => import('../routes/Template/Message/List')),
    },
    '/template/message/create': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'template'], () => import('../routes/Template/Message/Add')),
    },
    '/security/ingress/list': {
      name: 'API??????',
      component: dynamicWrapper(app, ['form', 'ingress'], () => import('../routes/Security/IngressList')),
    },
    '/security/ingress/add': {
      name: 'API??????',
      component: dynamicWrapper(app, ['form', 'ingress'], () => import('../routes/Security/addIngress')),
    },
    '/security/ingress/edit/:namespace/:name': {
      name: 'API??????',
      component: dynamicWrapper(app, ['form', 'ingress'], () => import('../routes/Security/addIngress')),
    },
    '/security/ingress/:namespace/detail/:name': {
      name: 'API??????',
      component: dynamicWrapper(app, ['form', 'ingress', 'virtualservice'], () => import('../routes/Security/IngressDetail')),
    },
    '/security/egress/list': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'egress'], () => import('../routes/Security/egressList')),
    },
    '/security/egress/create': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'egress'], () => import('../routes/Security/addEgress')),
    },
    '/security/egress/edit/:namespace/:name': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'egress'], () => import('../routes/Security/addEgress')),
    },
    '/security/service/entry/list': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'serviceentry'], () => import('../routes/Security/serviceEntryList')),
    },
    '/security/service/entry/create': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'serviceentry'], () => import('../routes/Security/addServiceEntry')),
    },
    '/security/service/entry/edit/:namespace/:name': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'serviceentry'], () => import('../routes/Security/addServiceEntry')),
    },
    '/security/virtual/service/list': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'virtualservice'], () => import('../routes/Security/VirtualService/List')),
    },
    '/security/virtual/service/detail/:namespace/:name': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'virtualservice'], () => import('../routes/Security/VirtualService/Detail')),
    },
    '/security/virtual/service/create': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'virtualservice'], () => import('../routes/Security/VirtualService/Add')),
    },
    '/security/virtual/service/create/info': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'virtualservice'], () => import('../routes/Security/VirtualService/StepForm/Step1')),
    },
    '/security/virtual/service/create/editInfo/:namespace/:name': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'virtualservice'], () => import('../routes/Security/VirtualService/StepForm/Step1')),
    },
    '/security/virtual/service/create/route/:namespace/:name': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'virtualservice'], () => import('../routes/Security/VirtualService/StepForm/Step2')),
    },
    '/security/virtual/service/create/success/:namespace/:name': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'virtualservice'], () => import('../routes/Security/VirtualService/StepForm/Step4')),
    },
    '/security/gateway/list': {
      name: '?????????',
      component: dynamicWrapper(app, ['form', 'gateway'], () => import('../routes/Security/GateWay/List')),
    },
    '/security/gateway/create': {
      name: '?????????',
      component: dynamicWrapper(app, ['form', 'gateway'], () => import('../routes/Security/GateWay/Add')),
    },
    '/security/gateway/:namespace/update/:name': {
      name: '?????????',
      component: dynamicWrapper(app, ['form', 'gateway'], () => import('../routes/Security/GateWay/Add')),
    },
    '/security/namespace': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'namespace'], () => import('../routes/Security/namespaceList')),
    },
    '/system/member': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'system'], () => import('../routes/System/member')),
    },
    '/system/role': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'system'], () => import('../routes/System/role')),
    },
    '/system/permission': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'system'], () => import('../routes/System/Permission')),
    },
    '/system/group': {
      name: '?????????',
      component: dynamicWrapper(app, ['form', 'group'], () => import('../routes/Group/AllGroup/AllGroup')),
    },
    '/system/proclaim': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'proclaim'], () => import('../routes/Proclaim/Proclaim')),
    },
    '/system/addproclaim': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'proclaim'], () => import('../routes/Proclaim/CreateProclaim')),
    },
    '/system/viewproclaim/:id': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'proclaim'], () => import('../routes/Proclaim/ViewProclaim')),
    },
    '/group/list': {
      name: '?????????',
      component: dynamicWrapper(app, ['form', 'group'], () => import('../routes/Group/PerGroup/groupList')),
    },
    '/conf/configMap': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'conf'], () => import('../routes/Conf/configMap')),
    },
    '/conf/addConfigMap': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'conf'], () => import('../routes/Conf/addConfigMap')),
    },
    '/conf/updateConfigMap/:namespace/:name': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'conf'], () => import('../routes/Conf/addConfigMap')),
    },
    '/conf/configMapDetail/:namespace/:name': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'conf'], () => import('../routes/Conf/configMapDetail')),
    },
    '/conf/storage/list': {
      name: '????????????',
      component: dynamicWrapper(app, ['form', 'storage'], () => import('../routes/Conf/Storage/List')),
    },
    '/conf/storage/:name': {
      name: '???????????????',
      component: dynamicWrapper(app, ['storage'], () => import('../routes/Conf/Storage/Detail')),
    },
    '/conf/pvc/list': {
      name: '???????????????',
      component: dynamicWrapper(app, ['storage'], () => import('../routes/Conf/Storage/PersistentVolumeClaim')),
    },
    '/conf/pvc/:namespace/detail/:name': {
      name: '???????????????',
      component: dynamicWrapper(app, ['storage'], () => import('../routes/Conf/Storage/Detail/PVCDetail')),
    },
    '/conf/storage/:namespace/persistentvolume/:volumeName': {
      name: '???????????????',
      component: dynamicWrapper(app, ['storage'], () => import('../routes/Conf/Storage/Detail/PVDetail')),
    },
    '/conf/consul/acl/list': {
      name: 'Consul',
      component: dynamicWrapper(app, ['form', 'consul'], () => import('../routes/Conf/Consul/AclList')),
    },
    '/conf/consul/acl/edit': {
      name: 'Consul',
      component: dynamicWrapper(app, ['form', 'consul'], () => import('../routes/Conf/Consul/AclCreate')),
    },
    '/conf/consul/acl/:namespace/edit/:name': {
      name: 'Consul',
      component: dynamicWrapper(app, ['form', 'consul'], () => import('../routes/Conf/Consul/AclCreate')),
    },
    '/conf/consul/acl/:namespace/detail/:name': {
      name: 'Consul acl ??????',
      component: dynamicWrapper(app, ['form', 'consul'], () => import('../routes/Conf/Consul/AclDetail')),
    },
    '/conf/consul/kv/:namespace/detail/:name': {
      name: 'Consul K/V ??????',
      component: dynamicWrapper(app, ['form', 'consul'], () => import('../routes/Conf/Consul/KVDetail')),
    },
    '/conf/webhook/list': {
      name: 'webhook',
      component: dynamicWrapper(app, ['form', 'webhook'], () => import('../routes/Conf/Webhook/webhookList')),
    },
    '/conf/webhook/create': {
      name: 'webhook',
      component: dynamicWrapper(app, ['form', 'webhook'], () => import('../routes/Conf/Webhook/addWebhook')),
    },
    '/conf/webhook/edit/:id': {
      name: 'webhook',
      component: dynamicWrapper(app, ['form', 'webhook'], () => import('../routes/Conf/Webhook/addWebhook')),
    },
    '/markets/dockerfile/list': {
      name: '?????????',
      component: dynamicWrapper(app, ['user', 'dockerfile'], () => import('../routes/Markets/Dockerfile/List')),
    },
    '/markets/dockerfile/detail/:id': {
      name: '?????????',
      component: dynamicWrapper(app, ['user', 'dockerfile'], () => import('../routes/Markets/Dockerfile/Detail')),
    },
    '/node': {
      name: '????????????',
      component: dynamicWrapper(app, ['nodes'], () => import('../routes/Nodes')),
    },
    '/tools/generates': {
      name: '??????????????????',
      component: dynamicWrapper(app, ['resource'], () => import('../routes/Tools/Generate/Index')),
    },
    '/tools/faketime': {
      name: '??????????????????',
      component: dynamicWrapper(app, ['project'], () => import('../routes/Tools/Faketime/Index')),
    },
    '/tools/duplication': {
      name: '??????/????????????',
      component: dynamicWrapper(app, ['project', 'tools'], () => import('../routes/Tools/Duplication/Index')),
    },
    '/user': {
      component: dynamicWrapper(app, [], () => import('../layouts/UserLayout')),
    },
    '/choose': {
      component: dynamicWrapper(app, [], () => import('../layouts/ChooseNameSpace')),
    },
    '/user/login': {
      component: dynamicWrapper(app, ['login'], () => import('../routes/User/Login')),
    },
    // '/user/:id': {
    //   component: dynamicWrapper(app, [], () => import('../routes/User/SomeComponent')),
    // },
    '/account/center': {
      name: '????????????',
      component: dynamicWrapper(app, ['setting', 'user', 'project'], () => import('../routes/Account/Center/Center')),
    },
    '/account/settings': {
      name: '????????????',
      component: dynamicWrapper(app, ['setting', 'user'], () => import('../routes/Account/Settings/Info')),
    },
    '/account/settings/base': {
      name: '????????????',
      component: dynamicWrapper(app, ['setting', 'user'], () => import('../routes/Account/Settings/Info')),
    },
    '/account/settings/binding': {
      name: '????????????',
      component: dynamicWrapper(app, ['setting', 'user', 'binding'], () => import('../routes/Account/Settings/Info')),
    },
    '/account/settings/notice': {
      name: '????????????',
      component: dynamicWrapper(app, ['setting', 'user'], () => import('../routes/Account/Settings/Info')),
    },
    '/account/msgs': {
      name: '????????????',
      component: dynamicWrapper(app, ['msgs'], () => import('../routes/Account/Msgs/Base')),
    },
    '/account/msgs/notice': {
      name: '????????????',
      component: dynamicWrapper(app, ['msgs'], () => import('../routes/Account/Msgs/Base')),
    },
    '/account/msgs/alarm': {
      name: '????????????',
      component: dynamicWrapper(app, ['msgs'], () => import('../routes/Account/Msgs/Base')),
    },
    '/account/msgs/proclaim': {
      name: '????????????',
      component: dynamicWrapper(app, ['msgs'], () => import('../routes/Account/Msgs/Base')),
    },
  };

  // Get name from ./menu.js or just set it in the router data.
  const menuData = getFlatMenuData(getMenuData());

  // Route configuration data
  // eg. {name,authority ...routerConfig }
  const routerData = {};
  // The route matches the menu
  Object.keys(routerConfig).forEach(path => {
    // Regular match item name
    // eg.  router /user/:id === /user/chen
    const pathRegexp = pathToRegexp(path);
    const menuKey = Object.keys(menuData).find(key => pathRegexp.test(`${key}`));
    let menuItem = {};
    // If menuKey is not empty
    if (menuKey) {
      menuItem = menuData[menuKey];
    }
    let router = routerConfig[path];
    // If you need to configure complex parameter routing,
    // https://github.com/ant-design/ant-design-pro-site/blob/master/docs/router-and-nav.md#%E5%B8%A6%E5%8F%82%E6%95%B0%E7%9A%84%E8%B7%AF%E7%94%B1%E8%8F%9C%E5%8D%95
    // eg . /list/:type/user/info/:id
    router = {
      ...router,
      name: router.name || menuItem.name,
      authority: router.authority || menuItem.authority,
      hideInBreadcrumb: router.hideInBreadcrumb || menuItem.hideInBreadcrumb,
    };
    routerData[path] = router;
  });
  return routerData;
};
