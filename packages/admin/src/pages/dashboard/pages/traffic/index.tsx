import { Button, Form, Input, message, Modal, Popconfirm, Space, Spin, Switch, Table, Tabs } from 'antd';
import { DeployedCert, GetAllProxyTrafficResponse } from '@x-gateway/interface';
import React, { useEffect, useState } from 'react';
import { LineGraph } from './line-graph';
import { getAllProxiesTraffic } from '../../../../apis/traffic';
import prettyBytes from 'pretty-bytes';

const TrafficHistoryPage: React.FC = () => {

  return (
    <div>
      <RunningCertTable />
    </div>
  );
};

const RunningCertTable: React.FC = () => {
  const [dataSource, setDataSource] = useState<GetAllProxyTrafficResponse>([]);
  const [loading, setLoading] = useState(false);
  const [currentProxyName, setCurrentProxyName] = useState<string | undefined>(undefined);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const reloadDataSource = async (showLoading = false) => {
    setLoading(true);
    const data = await getAllProxiesTraffic();
    setDataSource(data);
    setLoading(false);
  }

  useEffect(() => {
    reloadDataSource();
  }, [])

  const defaultColumns = [
    {
      title: '代理规则',
      dataIndex: 'proxyName',
      width: '250px',
    },
    {
      title: '最后更新时间',
      dataIndex: 'realTime',
      render(time: string) {
        return <span>{new Date(time).toLocaleString()}</span>
      }
    },
    {
      title: '请求数',
      dataIndex: 'requestCount',
    },
    {
      title: '上传量',
      dataIndex: 'trafficSent',
      render(bytes: number) {
        return <span>{prettyBytes(bytes)}</span>
      }
    },
    {
      title: '下载量',
      dataIndex: 'trafficReceived',
      render(bytes: number) {
        return <span>{prettyBytes(bytes)}</span>
      }
    },
    {
      title: '操作',
      render: (_: any, record: GetAllProxyTrafficResponse[0]) => {
        return <Button size='small' onClick={() => {
          setCurrentProxyName(record.proxyName);
          openModal();
        }}>详情</Button>
      }
    },
  ];

  const openModal = () => setModalOpen(true);

  const closeModal = () => {
    setModalOpen(false)
  };

  const [displayType, setDisplayType] = useState<'accumulation' | 'normal'>('normal');

  return (
    <div>
      <Table
        loading={loading}
        dataSource={dataSource}
        columns={defaultColumns}
      />
      <Modal title={
        <Space>
          <span>流量详情</span>
          <span style={{ fontSize: 14, fontWeight: 200 }}>累积模式</span>
          <Switch size='small' onChange={(checked) => setDisplayType(checked ? 'accumulation' : 'normal')} />
        </Space>
      }
        width={'80%'} visible={isModalOpen} onCancel={closeModal} footer={null}>
        <LineGraph displayType={displayType} proxyName={currentProxyName} />
      </Modal>
    </div>
  );
};

export default TrafficHistoryPage;