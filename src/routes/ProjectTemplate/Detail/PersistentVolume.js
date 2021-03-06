import React, { Fragment } from 'react';
import { connect } from 'dva';
import { Card, Tag, Table, Button } from 'antd';
import { findDOMNode } from 'react-dom';
import DescriptionList from '../../../components/DescriptionList';
import AddPersistentVolume from './AddPersistentVolume'

const { Description } = DescriptionList;
class PersistentVolume extends React.PureComponent {
    state = {
        addPvcVisible: false,
    };
  componentWillMount() {
    const { dispatch, deployment } = this.props;
    if (deployment && deployment.metadata.name) {
      dispatch({
        type: 'project/getPersistentVolume',
        payload: {
          namespace: deployment.metadata.namespace,
          name: deployment.metadata.name
        },
      });
    }
  }

  componentWillUnmount () {
    const { dispatch } = this.props;
      //clearPersistentVolume
      dispatch({
        type: 'project/clearPersistentVolume',
    });
  };

  lable = data => {
    const that = this;
    var items = [];
    for (var key in data) {
      var len = data[key].length;
      let tag = (<Tag key={key}>
      {key}:{data[key]}
    </Tag>);
      if (len >= 40) {
          tag = (<Tag key={key} color="blue" onClick={(e) => {console.log(e)}}>
            {key}
          </Tag>)
      }
      items.push(tag)
    }
    return items;
  };

  handleCancel = (e) => {
    e.preventDefault();
    this.setState({
        addPvcVisible: false
    })
  };

  handleOk = (values) => {
    const {dispatch, deployment} = this.props;
    dispatch({
        type: 'project/bindPvc',
        payload: {
            ...values,
            namespace: deployment.metadata.namespace,
            name: deployment.metadata.name,
        },
    });

    this.setState({
        addPvcVisible: false
    })
  };

  showModal = (e) => {
    e.preventDefault();
    const {dispatch, deployment} = this.props;
    this.setState({
        addPvcVisible: true
    })
    dispatch({
        type: 'storage/pvcList',
        payload: {
            namespace: deployment.metadata.namespace
        },
    });
  };

  render() {
    const {persistentVolume, deployment, storage} = this.props;
    const {addPvcVisible} = this.state;
    const {pv, pvc,volumeName, pvcName, volumePath} = persistentVolume;
    const pvDetail = pv;

    if (!pvDetail || !pvDetail.metadata) {
        return (<Card style={{ marginBottom: 24 }} bordered={false}>
            <AddPersistentVolume
                visible={addPvcVisible}
                loading={false}
                handleCancel={this.handleCancel}
                handleOk={this.handleOk}
                deployment={deployment}
                storage={storage}
                />

            <Button
              type="dashed"
              style={{ width: '100%', marginBottom: 8 }}
              icon="plus"
              onClick={this.showModal}
              ref={component => {
                /* eslint-disable */
                this.addBtn = findDOMNode(component);
                /* eslint-enable */
              }}
            >
              ??????
            </Button>
          </Card>)
    }

    const list = [];
    list.push({
        name: "Storage",
        storage: pvDetail.spec.capacity.storage
    })

    const columns = [{
        title: '????????????',
        key: "name",
        dataIndex: 'name'
    }, {
      title: '??????',
      dataIndex: 'storage',
      key: "storage"
    }];

    return (
        <div>
            <Card title="??????" style={{ marginBottom: 24 }} bordered={false}>
                <DescriptionList  size="small" col="2">
                    <Description term="????????????">{volumeName}</Description>
                    <Description term="????????????">{volumePath}</Description>
                    <Description term="??????">{pvDetail.metadata.name}</Description>
                    <Description term="??????">{this.lable(pvDetail.metadata.annotations)}</Description>
                    <Description term="??????">{pvDetail.status.phase}</Description>
                    <Description term="????????????">{pvDetail.spec.accessModes[0]}</Description>
                    <Description term="????????????">{pvDetail.spec.persistentVolumeReclaimPolicy}</Description>
                    <Description term="??????"><a href={`#/conf/pvc/${pvDetail.spec.claimRef.namespace}/detail/${pvDetail.spec.claimRef.name}`}>{pvDetail.spec.claimRef.namespace}/{pvDetail.spec.claimRef.name}</a></Description>
                    <Description term="?????????"><a href={`#/conf/storage/${pvDetail.spec.storageClassName}`}>{pvDetail.spec.storageClassName}</a></Description>
                    <Description term="????????????">{pvDetail.metadata.creationTimestamp}</Description>
                </DescriptionList>
            </Card>
            <Card title="NFS" style={{ marginBottom: 24 }} bordered={false}>
                <DescriptionList  size="small" col="2">
                    <Description term="?????????">{pvDetail.spec.nfs.server}</Description>
                    <Description term="??????">{pvDetail.spec.nfs.path}</Description>
                    <Description term="??????">-</Description>
                </DescriptionList>
            </Card>

            <Card bordered={false} 
                title="??????"
            >
                <Table columns={columns} dataSource={list} pagination={false} rowKey={record => record.name} />
            </Card>
        </div>
    );
  }
}

export default connect(({ project, storage }) => ({
    persistentVolume: project.persistentVolume,
    storage
}))(PersistentVolume);
