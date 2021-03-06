import React, { Component, Fragment } from 'react';
import { Form, Tabs,Tag, Input, Select, Button,message,Table,Pagination,Icon, Card} from 'antd';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import styles from './View.less';
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Search = Input.Search;


@Form.create()
class NoticeView extends Component {

  constructor(props) {
    super(props);
    const { match, location, dispatch } = props;
  }

  state = {
    type: 2,
    is_read: "all",
    title: "",
    classList: styles.display,
    classDetail: styles.undisplay,
    noticeInfo: {
      title: "",
      content: "",
    },
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: "msgs/noticelist",
      payload: {
        type: this.state.type
      },
    })
    dispatch({
      type: "msgs/noticeReadCount",
      payload: {
        type: this.state.type
      },
    })
  }

  tabCallback =(key) => {
    this.setState({
        is_read: key,
        title: "",
    });
    
    const { dispatch } = this.props;
    dispatch({
      type: "msgs/noticelist",
      payload: {
        type: this.state.type,
        is_read: key,
      },
    })
  }

  showView = (v) => {
    const { dispatch } = this.props;
    if (v=="list"){
      dispatch({
        type: "msgs/noticeReadCount",
        payload: {
          type: this.state.type
        },
      })
      this.tabCallback(this.state.is_read)
      this.setState({
          classList: styles.display,
          classDetail: styles.undisplay,
          noticeInfo: {
            title: "",
            content: "",
          },
      });
    }else{
      dispatch({
        type: "msgs/getNoticeView",
        payload: {
          id: v.id
        },
      })
      this.setState({
          classList: styles.undisplay,
          classDetail: styles.display,
          noticeInfo: v,
      });
    }
    
  }

  clearAll = () => {
    const { dispatch } = this.props;
    dispatch({
      type: "msgs/clearAllNotice",
      payload:{
        type: this.state.type,
        is_read: this.state.is_read,
      }
    })
  }

  searchChange = (value) => {
    const {dispatch} = this.props;
    this.setState({
          title: value,
      });
    dispatch({
      type: 'msgs/noticelist',
      payload: {
        title: value,
        type: this.state.type,
        is_read: this.state.is_read,
      },
    });
  }

  contentChange = (c) => {
    var subStr=new RegExp('\n','i'); //???????????????????????????,??????????????????
    var result=c.replace(subStr,"<br/>"); //???'is'?????????????????????
    return result
  }

  render() {
    const { form: { getFieldDecorator }, list,noticePage,loading, readcount} = this.props; //console.log("xxxxx",this.props)
    
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };

    const tabAll = "????????????(" + readcount.all + ")"
    const tabUnRead = "????????????(" + readcount.unread + ")"
    const tabRead = "????????????(" + readcount.read + ")"

    const Tablefooter = () => {
      return (<Button icon="folder-open" onClick={() => this.clearAll()} size="small">??????????????????</Button>)
    };

    const eventColor = {
      "Build":"#2db7f5", 
      "Apply":"#99CC00", 
      "Audit":"#66FF00", 
      "Delete":"#CCCCCC", 
      "Member":"#99CC66", 
      "Rollback":"#FF0033", 
      "Logging":"#99FF99", 
      "Reboot":"#FFFFCC", 
      "Command":"#33FFFF", 
      "Storage":"#66CCFF", 
      "Gateway":"#9933FF", 
      "Expansion":"#99FFFF", 
      "Extend":"#CC66FF", 
      "SwitchModel":"#CC9900", 
      "ReadinessProbe":"#FF99FF", 
    };

    //this.showView(list)

    const columns = [{
      title: '??????',
      key: 'title',
      render: (text, record) => (
        <a className={record.is_read == 1 ? styles.tit : styles.untit} onClick={() => this.showView(record)}>{text.title}</a>
      ),
    }, {
      title: '??????',
      key: 'action',
      render: (text, record) => (
        <Tag color={eventColor[text.action]}>{text.action}</Tag>
      ),
    },{
      title: '?????????',
      dataIndex: 'member_name',
      key: 'member_name',
    }, {
      title: '????????????',
      dataIndex: 'created_at',
      key: 'created_at',
    }];
    const extraContent = (
      <div >
        <Search
          placeholder="????????????..."
          onSearch={value => this.searchChange(value)}
          enterButton
        />
      </div>
    );
    const onShowSizeChange = (current) => {
      const { dispatch } = this.props;
      dispatch({
        type: "msgs/noticelist",
        payload: {
          type: this.state.type,
          is_read: this.state.is_read,
          title: this.state.title,
          p: current,
        },
      })
    }

    

    return (
        <span>
          <Tabs className={this.state.classList} defaultActiveKey="all" onChange={this.tabCallback}>
            <TabPane tab={tabAll} key="all">
              <Card title="" style={{border:0}} extra={extraContent}>
              <Table loading={loading} columns={columns} rowKey="id" dataSource={list} pagination={false}/>
              <Pagination style={{marginTop: 20, float: "right"}}
                        title=""
                        current={noticePage ? noticePage.page : 0}
                        defaultCurrent={noticePage.page}
                        total={noticePage.total}
                        showTotal={total => `??? ${noticePage.total} ?????????`}
                        onChange={onShowSizeChange}/>
              </Card>
            </TabPane>
            <TabPane tab={tabUnRead} key="0">
              <Card title="" style={{border:0}} extra={extraContent}>
              <Table loading={loading} columns={columns} rowKey="id" footer={Tablefooter} dataSource={list} pagination={false}/>
              <Pagination style={{marginTop: 20, float: "right"}}
                        title=""
                        current={noticePage ? noticePage.page : 0}
                        defaultCurrent={noticePage.page}
                        total={noticePage.total}
                        showTotal={total => `??? ${noticePage.total} ?????????`}
                        onChange={onShowSizeChange}/>
              </Card>
            </TabPane>
            <TabPane tab={tabRead} key="1">
              <Card title="" style={{border:0}} extra={extraContent}>
              <Table loading={loading} columns={columns} rowKey="id" dataSource={list} pagination={false}/>
              <Pagination style={{marginTop: 20, float: "right"}}
                        title=""
                        current={noticePage ? noticePage.page : 0}
                        defaultCurrent={noticePage.page}
                        total={noticePage.total}
                        showTotal={total => `??? ${noticePage.total} ?????????`}
                        onChange={onShowSizeChange}/>
              </Card>
            </TabPane>
          </Tabs>
          <div className={this.state.classDetail}>
            <p onClick={() => this.showView("list")} className={styles.returnList}><Icon type="left-circle" theme="twoTone" /><span className={styles.rtnls}>????????????</span></p>
            <p>
              {this.state.noticeInfo.title}
            </p>
            <span dangerouslySetInnerHTML={{ __html:this.state.noticeInfo.content}}></span>
          </div>
        </span>
    );
  }
}
export default connect(({msgs, loading}) => ({
  list: msgs.noticeList,
  loading: msgs.loading,
  noticePage: msgs.noticePage,
  readcount: msgs.readcount,
  listShow: msgs.listShow,
}))(NoticeView);

