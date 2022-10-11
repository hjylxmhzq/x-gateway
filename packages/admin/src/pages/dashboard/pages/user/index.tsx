import { Button, Form, FormInstance, Input, message, Modal, Popconfirm, Select, Space, Spin, Switch, Table, Tabs, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons'
import { GetAllUsersInfoResponse } from '@x-gateway/interface';
import React, { useEffect, useRef, useState } from 'react';
import { deleteUser, disableTotp, enableTotp, getAllUserInfo, register } from '../../../../apis/user';
import { useForm } from 'antd/es/form/Form';
import { customAlphabet } from 'nanoid'
import qrCode from 'qrcode';
import base32Encode from 'base32-encode';
import { useUserInfo } from '../../../../hooks/user';

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
  const [isEnableTotpModalOpen, setEnableTotpModalOpen] = useState(false);
  const [secret, setSecret] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(true);
  const qrCodeRef = useRef<HTMLCanvasElement>(null);
  const userInfo = useUserInfo();

  const reloadDataSource = async (showLoading = false) => {
    setLoading(true);
    const data = await getAllUserInfo();
    setDataSource(data);
    setLoading(false);
  }

  useEffect(() => {
    reloadDataSource();
  }, [])

  useEffect(() => {
    if (isEnableTotpModalOpen && qrCodeRef.current) {
      const uint8 = new TextEncoder().encode(secret);
      const encoded = base32Encode(uint8, 'RFC4648');
      const { name, email } = userInfo;
      const url = `otpauth://totp/${name}:${email}?secret=${encoded}&issuer=x-gateway`
      qrCode.toCanvas(qrCodeRef.current, url, { width: 250, margin: 2 }, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }
  }, [secret]);

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
        return <Space>
          <Popconfirm okText="确定" cancelText="取消" title="确认删除吗?" onConfirm={async () => {
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
          <Switch onChange={(checked) => onTotpChange(checked, record.name)} checkedChildren="TOTP" unCheckedChildren="TOTP" checked={record.needTwoFacAuth} />
        </Space>
      }
    },
  ];

  const onTotpChange = async (checked: boolean, username: string) => {
    if (checked) {
      const secret = customAlphabet('1234567890abcdefghijklnmopqrstuvwxyz', 25)();
      setSecret(secret);
      setEnableTotpModalOpen(true);
      setCurrentUsername(username);
    } else {
      await disableTotp({ username });
      await reloadDataSource();
    }
  }

  const openModal = () => setModalOpen(true);

  const closeModal = () => {
    setModalOpen(false)
  };

  const [form] = useForm();
  const [addTotpForm] = useForm();

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
      <Modal
        title="启用两步验证(TOTP)"
        visible={isEnableTotpModalOpen} onCancel={() => setEnableTotpModalOpen(false)}
        okText="确定"
        cancelText="取消"
        onOk={async () => {
          try {
            const token = addTotpForm.getFieldValue('token');
            const { success } = await enableTotp({ username: currentUsername, token, secret });
            if (!success) {
              setIsTokenValid(false);
            } else {
              setIsTokenValid(true);
              setEnableTotpModalOpen(false);
              await reloadDataSource();
            }
          } catch (e) {
            console.log('validate form error');
          }
          closeModal();
        }}
      >
        <div>
          <Space>
            第一步：扫描二维码添加TOTP账户
            <Tooltip title={
              <div>
                许多客户端支持TOTP验证码，例如Google Authenticator、Microsoft Authenticator等
                <br />
                <a target="_blank" rel="noreferrer" href="https://www.microsoft.com/en-us/security/mobile-authenticator-app">查看更多</a>
              </div>
            }>
              <QuestionCircleOutlined style={{ color: '#999' }} />
            </Tooltip>
          </Space>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <canvas ref={qrCodeRef}></canvas>
        </div>
        <div style={{ marginBottom: 10 }}>
          <Space>
            第二步：验证TOTP验证码
            <Tooltip title={
              <div>
                <a target="_blank" rel="noreferrer" href="https://zh.wikipedia.org/zh-cn/基于时间的一次性密码算法">TOTP</a>
                (Time-based One-Time Password)是一种基于时间的一次性密码算法，它的验证码会随时间发生变化
              </div>
            }>
              <QuestionCircleOutlined style={{ color: '#999' }} />
            </Tooltip>
          </Space>
        </div>
        <AddTotpForm form={addTotpForm} valid={isTokenValid} />
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
      initialValue={false}
      rules={[{ message: '请选择用户类型', required: true }]}
    >
      <Select>
        <Select.Option value={true}>是</Select.Option>
        <Select.Option value={false}>否</Select.Option>
      </Select>
    </Form.Item>
  </Form>
}


const AddTotpForm = (props: { form: FormInstance, valid: boolean }) => {

  return <Form
    form={props.form}
    name="basic"
    initialValues={{ remember: true }}
    autoComplete="off"
  >
    <Form.Item
      labelCol={{ span: 5 }}
      name="token"
      hasFeedback
      help={props.valid ? '' : 'Token错误'}
      validateStatus={props.valid ? 'success' : 'error'}
    >
      <Input placeholder='验证Token' />
    </Form.Item>
  </Form>
}
export default UserManagementPage;