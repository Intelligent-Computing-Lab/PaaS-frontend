import React, { PureComponent, Fragment } from 'react';
import { Table, Alert } from 'antd';
import styles from './Index.less';

function initTotalList(columns) {
  const totalList = [];
  columns.forEach(column => {
    if (column.needTotal) {
      totalList.push({ ...column, total: 0 });
    }
  });
  return totalList;
}

class StandardTable extends PureComponent {
  constructor(props) {
    super(props);
    const { columns } = props;
    const needTotalList = initTotalList(columns);

    this.state = {
      selectedRowKeys: [],
      needTotalList,
    };
  }

  //   componentWillReceiveProps(nextProps) {
  //     // clean state
  //     if (nextProps.selectedRows.length === 0) {
  //       const needTotalList = initTotalList(nextProps.columns);
  //       this.setState({
  //         selectedRowKeys: [],
  //         needTotalList,
  //       });
  //     }
  //   }

  //   handleRowSelectChange = (selectedRowKeys, selectedRows) => {
  //     const { needTotalList: list } = this.state;
  //     const { onSelectRow } = this.props;
  //     let needTotalList = [...list];
  //     needTotalList = needTotalList.map(item => {
  //       return {
  //         ...item,
  //         total: selectedRows.reduce((sum, val) => {
  //           return sum + parseFloat(val[item.dataIndex], 10);
  //         }, 0),
  //       };
  //     });

  //     if (onSelectRow) {
  //       onSelectRow(selectedRows);
  //     }

  //     this.setState({ selectedRowKeys, needTotalList });
  //   };

  handleTableChange = (pagination, filters, sorter) => {
    const { onChange } = this.props;
    onChange(pagination, filters, sorter);
  };

  cleanSelectedKeys = () => {
    this.handleRowSelectChange([], []);
  };

  render() {
    const { selectedRowKeys, needTotalList } = this.state;
    const { data: { list, pagination }, loading, columns, rowKey } = this.props;
    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      ...pagination,
    };

    return (
      <div className={styles.standardTable}>
        <div className={styles.tableAlert}>
          <Alert
            message={
              <Fragment>
                <span style={{ marginLeft: 8 }}>
                  ??????&nbsp;
                  <span style={{ fontWeight: 600 }}>{list ? list.length : 0} ???</span>
                </span>
              </Fragment>
            }
            type="info"
            showIcon
          />
        </div>
        <Table
          loading={loading}
          rowKey={record => (record.name ? record.name : record.cluster_ip)}
          //   rowSelection={rowSelection}
          dataSource={list}
          columns={columns}
          pagination={paginationProps}
          //   onChange={this.handleTableChange}
        />
      </div>
    );
  }
}

export default StandardTable;
