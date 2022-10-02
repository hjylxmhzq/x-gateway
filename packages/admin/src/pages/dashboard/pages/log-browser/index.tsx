import { Button, DatePicker, List, Modal, Spin, Table } from 'antd';
import { RangeValue } from 'rc-picker/lib/interface';
import React, { useEffect, useState } from 'react';
import { getLogContent, getLogFiles } from '../../../../apis/log-browser';

const LogBrowser: React.FC = () => {

  return (
    <div>
      <LogTable />
    </div>
  );
};

interface DataType {
  name: string;
  date: number;
  hash: string;
}

interface LogItem {
  level: string;
  message: string;
  date: number;
}

const LogTable: React.FC = () => {
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const [logContentDataSource, setLogContentDataSource] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  const reloadDataSource = async (fromTime: number | null, toTime: number | null) => {
    setLoading(true);
    fromTime = fromTime || 1;
    toTime = toTime || 10000000000000;
    const logFiles = await getLogFiles({ fromTime, toTime });
    const logFilesWithKey = logFiles.map(p => ({ key: p.date, ...p }));
    setDataSource(logFilesWithKey);
    setLoading(false);
  }

  const reloadLogContentDataSource = async (file: string) => {
    const content = await getLogContent({ file });
    setLogContentDataSource(content);
  }

  useEffect(() => {
    (async () => {
      await reloadDataSource(null, null);
    })();
  }, []);

  const defaultColumns = [
    {
      title: '时间',
      dataIndex: 'date',
      width: '250px',
      render: (timestamp: number) => <span>{new Date(timestamp).toLocaleString()}</span>,
    },
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: 'hash',
      dataIndex: 'hash',
    },
    {
      title: '操作',
      render: (item: DataType) => {
        return <Button onClick={() => {
          reloadLogContentDataSource(item.name);
          openModal();
        }}>详情</Button>
      }
    },
  ];

  const openModal = () => setModalOpen(true);

  const closeModal = () => setModalOpen(false);

  const { RangePicker } = DatePicker;

  const onRangeChange = (range: RangeValue<any>) => {
    if (!range) {
      reloadDataSource(null, null);
      return;
    }
    const fromTime = range[0] || 1;
    const toTime = range[1] || 1000000000000000;
    reloadDataSource(+fromTime, +toTime);
  }

  return (
    <div>
      <RangePicker onChange={onRangeChange} showTime style={{ marginBottom: 16 }} />
      <Table
        loading={loading}
        dataSource={dataSource}
        columns={defaultColumns}
      />
      <Modal width={'80%'} title="日志详情" visible={isModalOpen} onCancel={closeModal} footer={null}>
        <Spin tip="加载中" spinning={loading}>
          <List
            bordered
            size='small'
            dataSource={logContentDataSource}
            renderItem={item => (
              <List.Item>
                <strong style={{ color: item.level === 'info' ? '#5577ff' : 'red' }}>[{item.level}][{new Date(item.date).toLocaleString()}]</strong> {item.message}
              </List.Item>
            )}
          />
        </Spin>
      </Modal>
    </div>
  );
};

export default LogBrowser;