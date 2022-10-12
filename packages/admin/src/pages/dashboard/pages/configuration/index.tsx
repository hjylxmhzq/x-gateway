import { Button, Form, Input, Popconfirm, Table, InputRef, message, Modal, InputNumber, Select, Spin, Switch, Space } from 'antd';
import type { FormInstance } from 'antd/es/form';
import React, { useContext, useEffect, useRef, useState } from 'react';
import style from './index.module.less';
import './index.less';
import classnames from 'classnames';
import { addHttpProxy, deleteProxy, listProxies, startOrStopProxy } from '../../../../apis/proxy-config';
import { DeployedCert, ListProxyResponse } from '@x-gateway/interface';
import { ProxyStatus } from '@x-gateway/interface/lib/setting/add-http-proxy';
import prettyBytes from 'pretty-bytes';
import { getAllDeployedCerts } from '../../../../apis/cert-management';

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface Item {
  key: string;
  name: string;
  age: string;
  address: string;
}

interface EditableRowProps {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof Item;
  record: Item;
  handleSave: (record: Item) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef.current!.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();

      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

type EditableTableProps = Parameters<typeof Table>[0];

type DataType = (ListProxyResponse[0] & {
  key: React.Key;
});

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

const RoutesTable: React.FC = () => {
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const reloadDataSource = async () => {
    setLoading(true);
    const proxies = await listProxies();
    const proxiesWithKey = proxies.map(p => ({ key: p.name, ...p }));
    setDataSource(proxiesWithKey);
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      await reloadDataSource();
    })();
  }, []);

  const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
    {
      title: '规则名称',
      dataIndex: 'name',
      width: 120,
      editable: true,
      sorter(a: any, b: any) { return a.name === b.name ? 0 : a.name < b.name ? -1 : 1 },
    },
    {
      title: '主机(host)',
      dataIndex: 'host',
      sorter(a: any, b: any) { return a.host === b.host ? 0 : a.host < b.host ? -1 : 1 },
    },
    {
      title: '端口(port)',
      dataIndex: 'port',
      sorter(a: any, b: any) { return a.port - b.port },
    },
    {
      title: '路径(path)',
      dataIndex: 'path',
    },
    {
      title: '协议类型(protocol)',
      dataIndex: 'type',
      width: 100,
      filters: [
        {
          text: 'HTTP',
          value: 'http',
        },
        {
          text: 'HTTPS',
          value: 'https',
        },
      ],
      onFilter(value, record: any) {
        return value === record.type;
      }
    },
    {
      title: '目标主机',
      dataIndex: 'targetHost',
      sorter(a: any, b: any) { return a.targetHost === b.targetHost ? 0 : a.targetHost < b.targetHost ? -1 : 1 },
    },
    {
      title: '目标端口',
      dataIndex: 'targetPort',
      sorter(a: any, b: any) { return a.targetPort - b.targetPort },
    },
    {
      title: '流量(发送/返回)',
      width: 150,
      dataIndex: 'traffic',
      sorter(a: any, b: any) { return a.traffic.received - b.traffic.received },
      render(item) {
        console.log(item);
        return <span>{`${prettyBytes(item.sent)}/${prettyBytes(item.received)}`}</span>
      }
    },
    {
      title: '需要授权',
      dataIndex: 'needAuth',
      sorter(a: any, b: any) { return Number(a.needAuth) - Number(b.needAuth) },
      render(item) {
        console.log(item);
        return <span>{`${item ? '是' : '否'}`}</span>
      }
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_, record: any) => {
        console.log(record, ProxyStatus.running)
        return dataSource.length >= 1 ? (
          <Space>
            <ProxyRunningSwitch name={record.name} defaultStatus={record.status} />
            <Popconfirm okText="确定" cancelText="取消" title="确认删除吗?" onConfirm={async () => {
              setLoading(true);
              console.log(record.name);
              await deleteProxy(record.name);
              await reloadDataSource();
              setLoading(false);
              message.info(`已删除代理规则: ${record.name}`);
            }}>
              <Button size='small' type="primary" danger>删除</Button>
            </Popconfirm>
          </Space>
        ) : null
      },
    },
  ];

  const handleSave = (row: DataType) => {
    const newData = [...dataSource];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: DataType) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  const onAddProxy = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      setLoading(true);
      await addHttpProxy(values);
      message.info('添加代理规则成功');
      await reloadDataSource();
      setAddModalOpen(false);
    } catch (e) {
      setLoading(false);
      console.log('form validation error: ', e);
    }
  };

  const [form] = Form.useForm();

  return (
    <div>
      <Button onClick={() => setAddModalOpen(true)} type="primary" style={{ marginBottom: 16 }}>
        添加规则
      </Button>
      <Table
        loading={loading}
        components={components}
        rowClassName={() => 'editable-row'}
        dataSource={dataSource}
        columns={columns as ColumnTypes}
      />
      <Modal title="添加代理规则" okText="确定" cancelText="取消" visible={isAddModalOpen} onOk={onAddProxy} onCancel={() => setAddModalOpen(false)}>
        <Spin tip="加载中" spinning={loading}>
          <AddProxyForm form={form} />
        </Spin>
      </Modal>
    </div>
  );
};

const ProxyRunningSwitch = ({ name, defaultStatus }: { name: string, defaultStatus: ProxyStatus }) => {
  const [status, setStatus] = useState(defaultStatus === ProxyStatus.running ? 1 : 0);
  const [loading, setLoading] = useState(false);

  async function setProxyStatus(checked: boolean) {
    setLoading(true);
    const proxy = await startOrStopProxy(name, checked ? 1 : 0);
    if (proxy.status === ProxyStatus.running) {
      setStatus(1);
    } else {
      setStatus(0);
    }
    setLoading(false);
  }

  return <Switch
    loading={loading}
    onChange={setProxyStatus}
    checkedChildren="on"
    unCheckedChildren="off"
    checked={!!status}
  />
};

const { Option } = Select;

const AddProxyForm = (props: { form: FormInstance }) => {
  const [count, forceUpdate] = useState(0);
  const [isHostChanged, setHostChanged] = useState(false);
  const [certsDomains, setCertDomains] = useState<DeployedCert[]>([]);

  const reloadCertDomain = async () => {
    const delpoyedCerts = await getAllDeployedCerts();
    setCertDomains(delpoyedCerts);
  }

  useEffect(() => {
    reloadCertDomain();
  }, [count]);

  return <Form
    form={props.form}
    name="basic"
    initialValues={{ remember: true }}
    autoComplete="off"
  >
    <Form.Item
      labelCol={{ span: 5 }}
      label="协议类型"
      name="proxyProtocol"
      initialValue={'http'}
      rules={[{ required: true, message: '请选择协议类型' }]}
    >
      <Select
        placeholder="转发协议类型"
        allowClear
        onSelect={() => forceUpdate(count + 1)}
      >
        <Option value="http">HTTP</Option>
        <Option value="https">HTTPS</Option>
      </Select>
    </Form.Item>
    <Form.Item
      labelCol={{ span: 5 }}
      label="规则名称"
      name="name"
      rules={[{ required: true, message: '请输入规则名称' }]}
    >
      <Input onChange={(e) => {
        const value  = e.target.value;
        if (!isHostChanged) {
          const currentDomain = window.location.hostname;
          props.form.setFieldValue('host', `${value}.${currentDomain}`);
        }
      }} placeholder='代理规则名称' />
    </Form.Item>
    {
      props.form.getFieldValue('proxyProtocol') === 'https' ? <Form.Item
        labelCol={{ span: 5 }}
        label="SSL证书"
        name="certName"
        rules={[{ required: true, message: '请选择绑定的证书' }]}
      >
        <Select
          placeholder="绑定SSL证书"
          allowClear
        >
          {
            certsDomains.map((cert) => {
              return <Option value={cert.name}>{cert.domain}({cert.name})</Option>
            })
          }
        </Select>
      </Form.Item>
        : null
    }
    <Form.Item
      labelCol={{ span: 5 }}
      label="主机(host)"
      tooltip="可使用*通配符，如*.example.com"
      name="host"
      rules={[{ required: true, message: '输入需要匹配的规则' }]}
    >
      <Input onChange={() => setHostChanged(true)} placeholder='输入需要匹配的主机名' />
    </Form.Item>
    <Form.Item
      labelCol={{ span: 5 }}
      label="端口(port)"
      name="port"
      rules={[{ type: 'number', max: 65535, min: 0, required: true, message: '端口范围为[0, 65535]' }]}
    >
      <InputNumber style={{ width: 200 }} placeholder='代理端口' min={0} max={65535} autoComplete={'false'} />
    </Form.Item>
    <Form.Item
      labelCol={{ span: 5 }}
      label="路径(path)"
      name="path"
      initialValue={'.*'}
      rules={[{ required: true, message: '请输入路径' }]}
    >
      <Input placeholder='输入需要匹配的路径(正则表达式)' />
    </Form.Item>
    <Form.Item
      labelCol={{ span: 5 }}
      label="目标主机"
      name="proxyHost"
      initialValue={'127.0.0.1'}
      rules={[{ required: true, message: '请输入目标主机' }]}
    >
      <Input placeholder='目标主机(ip或域名)' />
    </Form.Item>
    <Form.Item
      labelCol={{ span: 5 }}
      label="目标端口"
      name="proxyPort"
      rules={[{ type: 'number', max: 65535, min: 0, required: true, message: '端口范围为[0, 65535]' }]}
    >
      <InputNumber style={{ width: 200 }} placeholder='代理端口' min={0} max={65535} autoComplete={'false'} />
    </Form.Item>
    <Form.Item
      labelCol={{ span: 5 }}
      label="需要登录"
      name="needAuth"
      initialValue={false}
      rules={[{ required: true, message: '请选择' }]}
    >
      <Select
        placeholder="是否需要登录授权"
      >
        <Option value={true}>是</Option>
        <Option value={false}>否</Option>
      </Select>
    </Form.Item>
  </Form>
}

const Configuratioin: React.FC = () => {
  return <div className={classnames(style['configuration-container'], 'configuration-page')}>
    <RoutesTable />
  </div>
}

export default Configuratioin;