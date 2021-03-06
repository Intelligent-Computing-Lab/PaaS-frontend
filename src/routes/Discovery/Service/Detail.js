import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Table, Tag, Modal, Button } from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import DescriptionList from 'components/DescriptionList';
import { MiniArea } from '../../../components/Charts';
import { routerRedux } from 'dva/router';

const { Description } = DescriptionList;
const { Column } = Table;

class Detail extends PureComponent {
  state = {
    visible: false,
    title: '',
    content: '',
  };

  componentDidMount() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'services/detail',
      payload: {
        name: match.params.name,
        namespace: match.params.namespace,
      },
    });
  }

  podsTag = status => {
    if (status == 'Pending') {
      return <Tag color="gold">{status}</Tag>;
    }
    if (status == 'Running' || status == 'Succeeded') {
      return <Tag color="green">{status}</Tag>;
    }
    if (status == 'Failed') {
      return <Tag color="red">{status}</Tag>;
    }
    if (status == 'Unknown') {
      return <Tag>{status}</Tag>;
    }
  };

  onClick = (e, name, service) => {
    e.preventDefault();
    const { dispatch, match } = this.props;
    dispatch(
      routerRedux.push(
        '/pods/' + service.metadata.namespace + '/' + match.params.name + '/detail/' + name,
      ),
    );
  };

  showModal = (e, title, content) => {
    e.preventDefault();
    this.setState({
      visible: true,
      title: title,
      content: content,
    });
  };

  handleCancel = () => {
    this.setState({ visible: false, title: '', content: '' });
  };

  render() {
    const { services } = this.props;
    const { loading, detail } = services;
    const { service } = detail;
    var ports = [];
    if (service && service.spec) {
      service.spec.ports.map((item, key) => {
        if (item.nodePort == '' || item.nodePort == undefined) {
          item.nodePort = 0;
        }
        let port = `${service.metadata.name}.${service.metadata.namespace}:${item.port} ${
          item.protocol
          }`;
        let nodeport = `${service.metadata.name}.${service.metadata.namespace}:${item.nodePort} ${
          item.protocol
          }`;
        ports.push(<Tag key={`prot-${key}`}>{port}</Tag>);
        ports.push(<Tag key={`nodeport-${key}`}>{nodeport}</Tag>);
      });
    }
    var annotations = [];
    if (service && service.metadata.annotations) {
      for (var i in service.metadata.annotations) {
        var tag;
        if (service.metadata.annotations[i].length > 40) {
          let n = i;
          let v = service.metadata.annotations[i];
          tag = (
            <Tag key={`annotations-${i}`} color="blue" onClick={e => this.showModal(e, n, v)}>
              {i}
            </Tag>
          );
        } else {
          tag = (
            <Tag key={`annotations-${i}`}>
              {i}: {service.metadata.annotations[i]}
            </Tag>
          );
        }
        annotations.push(tag);
      }
    }

    var labels = [];
    if (service && service.metadata.labels) {
      for (var i in service.metadata.labels) {
        labels.push(
          <Tag key={`labels-${i}`}>
            {i}: {service.metadata.labels[i]}
          </Tag>,
        );
      }
    }

    const extra = (
      <DescriptionList style={{ marginBottom: 24, textAlign: 'left' }}>
        <Description term="??????">{service ? service.metadata.name : '-'}</Description>
        <Description term="????????????">{service ? service.metadata.namespace : '-'}</Description>
        <Description term="??????">{labels}</Description>
        <Description term="??????">{annotations}</Description>
        <Description term="????????????">
          {service ? service.metadata.creationTimestamp : '-'}
        </Description>
        <Description term="???????????????">
          {service && service.spec.selector ? service.spec.selector.app : '-'}
        </Description>
        <Description term="??????">{service ? service.spec.type : '-'}</Description>
        <Description term="????????????">{service ? service.spec.sessionAffinity : '-'}</Description>
        <Description term="?????? IP:">{service ? service.spec.clusterIP : '-'}</Description>
        <Description term="????????????">{ports}</Description>
      </DescriptionList>
    );

    var endpoints = [];
    var pods = [];
    if (detail && detail.endpoints && detail.endpoints.addresses) {
      detail.endpoints.addresses.map((item, key) => {
        endpoints.push({
          host: item.ip,
          node: item.nodeName,
          ports: detail.endpoints.ports,
        });
      });
    }
    if (detail && detail.pods) {
      pods = detail.pods;
    }

    return (
      <PageHeaderLayout title="??????" extraContent={extra} loading={false}>
        <Modal
          visible={this.state.visible}
          title={this.state.title}
          width={500}
          onOk={this.handleCancel}
          footer={[
            <Button key="back" type="primary" onClick={this.handleCancel}>
              OK
            </Button>,
          ]}
          onCancel={this.handleCancel}
          bodyStyle={{ background: '#EFEFEF', overflow: 'auto', height: '400px' }}
        >
          {this.state.content}
        </Modal>
        <Card title={`??????`} style={{ marginBottom: 24 }} bordered={false}>
          <Table pagination={false} loading={loading} dataSource={endpoints} rowKey="host">
            <Column title="??????" dataIndex="host" key="host"/>
            <Column
              title="????????????????????????????????????"
              dataIndex="ports"
              key="ports"
              render={(val, record) => {
                var s = [];
                val.map((item, key) => {
                  s.push(
                    <Tag key={`${item.name}-${item.port}-${item.protocol}`}>
                      {item.name}, {item.port}, {item.protocol}
                    </Tag>,
                  );
                });
                return s.length > 0 ? s : '-';
              }}
            />
            <Column title="??????" dataIndex="node" key="node"/>
            <Column
              title="??????"
              dataIndex="ready"
              key="ready"
              render={() => {
                return 'true';
              }}
            />
          </Table>
        </Card>
        {pods &&
        pods.length > 0 && (
          <Card title={`?????????`} bordered={false}>
            <Table
              pagination={false}
              loading={loading}
              dataSource={pods}
              rowKey="name"
              // columns={columns}
            >
              <Column
                title="??????"
                dataIndex="name"
                key="name"
                render={(val, record, index) => {
                  return (
                    <a href="javascript:;" onClick={e => this.onClick(e, val, service)}>
                      {val}
                    </a>
                  );
                }}
              />
              <Column title="??????" dataIndex="node_name" key="node_name"/>
              <Column title="??????" dataIndex="status" key="status" render={this.podsTag}/>
              <Column title="?????????" dataIndex="restart_count" key="restart_count"/>
              <Column title="?????????" dataIndex="create_at" key="create_at"/>
              <Column
                title="CPU?????????"
                dataIndex="cpu"
                key="cpu"
                render={(data, record) => {
                  return (
                    <span>
                        <MiniArea color="#87CEFA" data={data}/> {record['curr_cpu'] / 1000}
                      </span>
                  );
                }}
              />
              <Column
                title="??????????????????"
                dataIndex="memory"
                key="memory"
                render={(data, record) => {
                  return (
                    <span>
                        <MiniArea color="#90EE90" data={data}/> {record['curr_memory']}MB
                      </span>
                  );
                }}
              />
            </Table>
          </Card>
        )}
      </PageHeaderLayout>
    );
  }
}

export default connect(({ services }) => ({
  services,
}))(Detail);
