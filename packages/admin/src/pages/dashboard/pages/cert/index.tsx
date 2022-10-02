import { Button, Descriptions, Form, Input, message, Modal, Space, Spin, Table, Tabs } from 'antd';
import { DeployedCert, RunningCertInstance } from '@x-gateway/interface';
import React, { useEffect, useState } from 'react';
import { requestNewCert, getRunningCertProcess, getAllDeployedCerts } from '../../../../apis/cert-management';

const CertManagementPage: React.FC = () => {

  return (
    <div>
      <RunningCertTable />
    </div>
  );
};

const RunningCertTable: React.FC = () => {
  const [dataSource, setDataSource] = useState<RunningCertInstance[]>([]);
  const [deployedDataSource, setDeployedDataSource] = useState<DeployedCert[]>([]);
  const [currentDetailName, setCurrentDetailName] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('deployed');

  const reloadDataSource = async (showLoading = false) => {
    setLoading(true);
    const data = await getRunningCertProcess();
    if (data.some(d => d.status === 'running')) {
      setTimeout(() => {
        reloadDataSource();
      }, 5000);
    }
    setDataSource(data);
    setLoading(false);
  }

  const reloadDeployedDataSource = async (showLoading = false) => {
    setLoading(true);
    const data = await getAllDeployedCerts();
    setDeployedDataSource(data);
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      if (currentTab === 'running') {
        await reloadDataSource(true);
      } else {
        reloadDeployedDataSource();
      }
    })();
  }, [currentTab]);

  const defaultColumns = [
    {
      title: '证书名称',
      dataIndex: 'name',
      width: '250px',
    },
    {
      title: '域名',
      dataIndex: 'domain',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      render: (timestamp: number) => <span>{new Date(timestamp).toLocaleString()}</span>,
    },
    {
      title: '创建用户',
      dataIndex: 'createdBy',
    },
    {
      title: '当前状态',
      dataIndex: 'status',
      render: (status: 'running' | 'fail' | 'success') => {
        return <Space>
          {
            status === 'running' ? '申请中' : status === 'fail' ? '失败' : '成功'
          }
          {
            status === 'running' ? <Spin /> : ''
          }
        </Space>
      }
    },
    {
      title: '操作',
      render: (_: any, record: RunningCertInstance) => {
        return <Button onClick={() => {
          setCurrentDetailName(record.name)
          openModal();
        }}>详情</Button>
      }
    },
  ];

  const defaultDeployedColumns = [
    {
      title: '证书名称',
      dataIndex: 'name',
      width: '250px',
    },
    {
      title: '域名',
      dataIndex: 'domain',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      render: (timestamp: number) => <span>{new Date(timestamp).toLocaleString()}</span>,
    },
    {
      title: '创建用户',
      dataIndex: 'createdBy',
    },
    {
      title: '操作',
      render: (_: any, record: DeployedCert) => {
        return <Button onClick={() => {
          setCurrentDetailName(record.name)
          openModal();
        }}>删除</Button>
      }
    },
  ];
  const openModal = () => setModalOpen(true);

  const closeModal = () => {
    setModalOpen(false)
    setCurrentDetailName(undefined);
  };

  const addNewCert = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      setLoading(true);
      await requestNewCert(values);
      reloadDataSource();
      message.info('添加证书成功');
      await reloadDataSource();
      setAddModalOpen(false);
    } catch (e) {
      setLoading(false);
      console.log('form validation error: ', e);
    }
  }

  const [form] = Form.useForm();

  const currentDetail = dataSource.find(d => d.name === currentDetailName);

  return (
    <div>
      <Button onClick={() => { setAddModalOpen(true); setCurrentTab('running'); }} type="primary">创建新证书</Button>
      <Tabs onChange={(activeKey) => setCurrentTab(activeKey)} activeKey={currentTab}>
        <Tabs.TabPane tab="已部署" key="deployed">
          <Table
            loading={loading}
            dataSource={deployedDataSource}
            columns={defaultDeployedColumns}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="执行中" key="running">
          <Table
            loading={loading}
            dataSource={dataSource}
            columns={defaultColumns}
          />
        </Tabs.TabPane>
      </Tabs>

      <Modal width={'80%'} title="SSL证书详情" visible={isModalOpen} onCancel={closeModal} footer={null}>
        {
          currentDetail ? <Descriptions column={2} title="证书处理进度" bordered>
            <Descriptions.Item label="证书名称">{currentDetail.name}</Descriptions.Item>
            <Descriptions.Item label="绑定域名">{currentDetail.domain}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{new Date(currentDetail.createdAt).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="创建用户">{currentDetail.createdBy}</Descriptions.Item>
            <Descriptions.Item label={`日志(${currentDetail.status})`} style={{ whiteSpace: 'pre-wrap' }}>
              {currentDetail.status === 'running' ? <><Spin></Spin><br /></> : null}
              {currentDetail.log}
            </Descriptions.Item>
          </Descriptions>
            : null
        }
      </Modal>
      <Modal title="创建新SSL证书" visible={isAddModalOpen} onOk={addNewCert} onCancel={() => setAddModalOpen(false)}>
        <Spin tip="加载中" spinning={loading}>
          <Form
            form={form}
            name="basic"
            initialValues={{ remember: true }}
            autoComplete="off"
          >
            <Form.Item
              labelCol={{ span: 5 }}
              label="证书名称"
              name="name"
              rules={[{ required: true, message: '请输入证书名称' }]}
            >
              <Input placeholder='证书名称' />
            </Form.Item>
            <Form.Item
              labelCol={{ span: 5 }}
              label="域名(domain)"
              name="domain"
              rules={[{ required: true, message: '请输入证书域名' }]}
            >
              <Input placeholder='证书域名' />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default CertManagementPage;