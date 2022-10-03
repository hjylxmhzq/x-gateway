import { Button, Form, FormInstance, Input, message, Modal, Popconfirm, Select, Space, Spin, Switch, Table, Tabs } from 'antd';
import { GetAllUsersInfoResponse } from '@x-gateway/interface';
import React, { useEffect, useState } from 'react';
import { deleteUser, getAllUserInfo, register } from '../../../../apis/user';
import { useForm } from 'antd/es/form/Form';

const UserManagementPage: React.FC = () => {

  return (
    <div>
      <RunningCertTable />
    </div>
  );
};

const RunningCertTable: React.FC = () => {
  const [dataSource, setDataSource] = useState<GetAllUsersInfoResponse>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  const reloadDataSource = async (showLoading = false) => {
    setLoading(true);
    const data = await getAllUserInfo();
    setDataSource(data);
    setLoading(false);
  }

  useEffect(() => {
    reloadDataSource();
  }, [])

  const defaultColumns = [
    {
      title: '用户名',
      dataIndex: 'name',
      sorter(a: any, b: any) { return a.name - b.name },
    },
    {
      title: '邮件地址',
      dataIndex: 'email',
      sorter(a: any, b: any) { return a.email - b.email },
    },
    {
      title: '分组',
      dataIndex: 'tags',
    },
    {
      title: '最后登陆',
      dataIndex: 'lastLogin',
      sorter(a: any, b: any) { return a.lastLogin - b.lastLogin },
      render(time: number) {
        return <span>{new Date(time).toLocaleString()}</span>
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      sorter(a: any, b: any) { return a.createdAt - b.createdAt },
      render(time: number) {
        return <span>{new Date(time).toLocaleString()}</span>
      }
    },
    {
      title: '管理员',
      dataIndex: 'isAdmin',
      sorter(a: any, b: any) { return a.isAdmin - b.isAdmin },
      render(item: number) {
        return <span>{item ? '是' : '否'}</span>
      }
    },
    {
      title: '操作',
      render: (_: any, record: GetAllUsersInfoResponse[0]) => {
        return <Popconfirm okText="确定" cancelText="取消" title="确认删除吗?" onConfirm={async () => {
          try {
            setLoading(true);
            await deleteUser({ name: record.name });
            await reloadDataSource();
            setLoading(false);
            message.info(`已删除用户: ${record.name}`);
          } catch (e) {
            setLoading(false);
          }
        }}>
          <Button size='small' danger>删除</Button>
        </Popconfirm>
      }
    },
  ];

  const openModal = () => setModalOpen(true);

  const closeModal = () => {
    setModalOpen(false)
  };

  const [form] = useForm();

  return (
    <div>
      <Button onClick={openModal} type="primary" style={{ marginBottom: 16 }}>添加用户</Button>
      <Table
        loading={loading}
        dataSource={dataSource}
        columns={defaultColumns}
      />
      <Modal
        title="添加用户"
        visible={isModalOpen} onCancel={closeModal}
        okText="确定"
        cancelText="取消"
        onOk={async () => {
          try {
            await form.validateFields();
            const values = form.getFieldsValue();
            values.isAdmin = values.isAdmin === 'true' ? true : false;
            await register(values);
            reloadDataSource();
          } catch (e) {
            console.log('validate form error');
          }
          closeModal();
        }}
      >
        <AddUserForm form={form} />
      </Modal>
    </div >
  );
};

const AddUserForm = (props: { form: FormInstance }) => {

  return <Form
    form={props.form}
    name="basic"
    initialValues={{ remember: true }}
    autoComplete="off"
  >
    <Form.Item
      labelCol={{ span: 5 }}
      label="用户名"
      name="username"
      rules={[{ required: true, message: '请输入用户名' }]}
    >
      <Input placeholder='用户名' />
    </Form.Item>
    <Form.Item
      labelCol={{ span: 5 }}
      label="密码"
      name="password"
      rules={[{ required: true, message: '请输入密码' }]}
    >
      <Input placeholder='密码' />
    </Form.Item>
    <Form.Item
      labelCol={{ span: 5 }}
      label="Email"
      name="email"
      rules={[{ message: '请输入Email' }]}
    >
      <Input placeholder='Email' />
    </Form.Item>
    <Form.Item
      labelCol={{ span: 5 }}
      label="是否管理员"
      name="isAdmin"
      initialValue={"false"}
      rules={[{ message: '请选择用户类型', required: true }]}
    >
      <Select>
        <Select.Option value="true">是</Select.Option>
        <Select.Option value="false">否</Select.Option>
      </Select>
    </Form.Item>
  </Form>
}
export default UserManagementPage;