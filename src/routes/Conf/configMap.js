/**
 * Created by huyunting on 2018/5/17.
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Cookie from 'js-cookie';
import { Link, routerRedux } from 'dva/router';
import { Button, Card, Table, Icon, Pagination, Input, Divider, Select } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import NamespaceSelect from '../../components/Security/namespaceSelect';
import namespace from '../../models/namespace';

const Search = Input.Search;
const { Option, OptGroup } = Select;

class ConfigMap extends PureComponent {
  state = {
    name: '',
    defaultNamespace: '',
    group: '',
  };

  componentWillMount() {
    const namespace = Cookie.get('namespace');
    this.setState({ defaultNamespace: namespace });
  }

  componentDidMount() {
    const namespace = Cookie.get('namespace');
    const { dispatch } = this.props;
    dispatch({
      type: 'conf/list',
      payload: {
        'namespace': namespace,
      },
    });
    dispatch({
      type: 'conf/clearConfData',
    });
    dispatch({
      type: 'user/fetchNamespaces',
    });
    dispatch({
      type: 'group/ownergrouplist',
      payload: {
        'ns': namespace,
      },
    });
  }

  onUpdate = (name, ns) => {
    const { dispatch } = this.props;
    dispatch(routerRedux.push('/conf/updateConfigMap/' + ns + '/' + name));
  };

  onDetail = (name, ns) => {
    const { dispatch } = this.props;
    dispatch(routerRedux.push('/conf/configMapDetail/' + ns + '/' + name));
  };

  onDelete = (id, ns) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'conf/deleteConfMap',
      payload: {
        'namespace': ns,
        'id': id,
      },
    });
  };

  onAdd = () => {
    const { dispatch } = this.props;
    dispatch(routerRedux.push('/conf/addConfigMap'));
  };

  searchOnChange = e => {
    const { value } = e.target;
    this.setState({
      name: value,
    });
  };

  render() {
    const { list, loading, namespaces, page, dispatch ,ownergrouplist} = this.props;
    const namespacesMap = [];
    const that = this;
    if (namespaces && namespaces.length > 0) {
      namespaces.map((item, key) => {
        namespacesMap[item.name_en] = item.name;
      });
    }
    const namespace = (name) => {
      if (namespacesMap) {
        return namespacesMap[name];
      }
      return '';
    };
    const namespaceSelectPros = {
      disabledStatus: false,
      onOk(value) {
        dispatch({
          type: 'conf/list',
          payload: {
            'namespace': value,
            'name': that.state.name,
          },
        }).then(() => {
          clearGroup(value)
        });
      },

    };
    const clearGroup = (value) => {
      this.setState({
        group: '',
        defaultNamespace: value,
      });
      dispatch({
        type: 'group/ownergrouplist',
        payload: {
          'ns': value,
        },
      });
    };
    const searchChange = (value) => {
      this.setState({
        name: value,
      });
      dispatch({
        type: 'conf/list',
        payload: {
          'namespace': this.state.defaultNamespace,
          'name': value,
          'group': this.state.group,
        },
      });
    };

    const groupOption = () => {
      const options = [];
      if (ownergrouplist.length) {
        ownergrouplist.map((item, key) => options.push(
          <Option
            value={`${item.id}`}
            key={`${item.id}`}
          >{item.name}
          </Option>));
      }
      options.push(
        <OptGroup label="add Group" key="add Group">
          <Option value="" key="add Group2">
            <div>
              <Link to={{ pathname: '/group/list', query: { addGroup: 1 } }}>
                <div style={{ cursor: 'pointer' }}>
                  <Icon type="plus"/> ???????????????
                </div>
              </Link>
            </div>
          </Option>
        </OptGroup>,
      );
      return options;
    };
    const groupChange = (value) => {
      const v = value === undefined ? '' : value;
      this.setState({
        group: v,
      });
      const nss = Cookie.get("namespace");

      dispatch({
        type: 'conf/list',
        payload: {
          "namespace": nss,
          "group":value,
          'name': this.state.name,
        },
      })

    };

    const extraContent = (
      <div>
        <Button type="primary" ghost style={{ width: '120px', marginRight: '20px' }} onClick={this.onAdd}>
          <Icon type="plus"/> ????????????
        </Button>
        ???????????????
        <NamespaceSelect {...namespaceSelectPros} />
        <Select
          value={`${this.state.group ? this.state.group : '????????????'}`}
          showSearch
          style={{ width: 150 ,marginLeft: '16px'}}
          placeholder="????????????"
          onChange={groupChange}
          allowClear
          notFoundContent={
            <div>
              <Divider style={{ margin: '4px 0' }}/>
              <Link to={{ pathname: '/group/list', query: { addGroup: 1 } }}>
                <div style={{ padding: '8px', cursor: 'pointer' }}>
                  <Icon type="plus"/> ???????????????
                </div>
              </Link>
            </div>
          }
        >
          {ownergrouplist && groupOption()}
        </Select>
        <Search
          style={{ width: '200px', marginLeft: '20px' }}
          placeholder="??????????????????..."
          onSearch={value => searchChange(value)}
          onChange={this.searchOnChange}
          enterButton
        />
      </div>
    );
    const columns = [{
      title: '????????????',
      key: 'name',
      render: (text) => (
        <span>
          <a key={text.id} onClick={() => this.onDetail(text.name, text.namespace)}>{text.name}</a>
        </span>
      ),
    }, {
      title: '????????????',
      key: 'namespace',
      render: (text) => (
        <span>{text.namespace}</span>
      ),
    }, {
      title: '????????????',
      key: 'UpdatedAt',
      render: (text) => (
        <span>{moment(text.UpdatedAt).format('YYYY-MM-DD HH:mm:ss')}</span>
      ),

    }, {
      title: '??????',
      key: 'action',
      render: (text) => (
        <span>
          <a key={text.id + 100} onClick={() => this.onUpdate(text.name, text.namespace)}>?????? </a>
        </span>
      ),
    }];
    const onShowSizeChange = (current) => {
      dispatch({
        type: 'conf/list',
        payload: {
          'p': current,
          'namespace': this.state.defaultNamespace,
          'name': this.state.name,
          'group': this.state.group,
        },
      });
    };
    return (
      <PageHeaderLayout title={'????????????'}>
        <Card title="????????????" extra={extraContent}>
          <Table loading={loading} columns={columns} rowKey="id" dataSource={list} pagination={false}/>
          <Pagination
            style={{ marginTop: 20, float: 'right' }}
            title=""
            current={page ? page.page : 0}
            defaultCurrent={page.page}
            total={page.total}
            showTotal={total => `??? ${page.total} ?????????`}
            onChange={onShowSizeChange}
          />
        </Card>
      </PageHeaderLayout>
    );
  }
}

export default connect(({ conf, user, group }) => ({
  modalVisible: conf.modalVisible,
  list: conf.list,
  loading: conf.loading,
  btnLoading: conf.btnLoading,
  namespaces: user.namespaces,
  confMap: conf.confMap,
  confData: conf.confData,
  page: conf.page,
  ownergrouplist: group.ownergrouplist,
}))(ConfigMap);
