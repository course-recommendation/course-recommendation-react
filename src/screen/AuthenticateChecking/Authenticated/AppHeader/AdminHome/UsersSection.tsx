import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  TeamOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  ActionType,
  ModalForm,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Input, message, Modal, Space, Table, Tag, Upload } from 'antd';
import { useRef, useState } from 'react';

import defaultAxios from '@/common/services/defaultAxios';
import { SortOrder } from 'antd/es/table/interface';
import * as XLSX from 'xlsx';

type AdminUserRow = {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  createdAt: string;
};

const ROLE_OPTIONS = [
  { label: 'Người dùng (USER)', value: 'USER' },
  { label: 'Quản trị viên (ADMIN)', value: 'ADMIN' },
];

function buildSortParam(sort: Record<string, SortOrder>): string | undefined {
  const entries = Object.entries(sort ?? {});
  if (!entries.length) return undefined;
  const [field, order] = entries[0];
  return `${field},${order === 'ascend' ? 'asc' : 'desc'}`;
}

type ExcelColumn = {
  col: string;
  label: string;
  required?: boolean;
  note?: string;
};

export function ImportButton({
  url,
  onSuccess,
  formatColumns,
  exampleFileName = 'example',
}: {
  url: string;
  onSuccess: () => void;
  formatColumns: ExcelColumn[];
  exampleFileName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDownloadExample = () => {
    const headers = formatColumns.map((c) => c.label);
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${exampleFileName}.xlsx`);
  };

  return (
    <>
      <Button icon={<UploadOutlined />} onClick={() => setOpen(true)}>
        Import Excel
      </Button>
      <Modal
        title='Định dạng file Excel'
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={600}
      >
        <p style={{ marginBottom: 12 }}>
          File Excel (.xlsx) phải có định dạng như sau (dòng đầu tiên là tiêu đề, dữ liệu bắt đầu từ
          dòng 2):
        </p>
        <Table
          size='small'
          dataSource={formatColumns}
          rowKey='col'
          pagination={false}
          columns={[
            { title: 'Cột', dataIndex: 'col', width: 60 },
            { title: 'Trường dữ liệu', dataIndex: 'label' },
            {
              title: 'Bắt buộc',
              dataIndex: 'required',
              width: 90,
              render: (v: boolean) => (v ? 'Có' : 'Không'),
            },
            { title: 'Ghi chú', dataIndex: 'note' },
          ]}
        />
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Button icon={<DownloadOutlined />} onClick={handleDownloadExample}>
            Tải file mẫu
          </Button>
          <Upload
            accept='.xlsx'
            showUploadList={false}
            beforeUpload={async (file) => {
              setUploading(true);
              const form = new FormData();
              form.append('file', file);
              try {
                await defaultAxios.post(url, form, {
                  headers: { 'Content-Type': 'multipart/form-data' },
                });
                message.success('Import thành công');
                setOpen(false);
                onSuccess();
              } catch {
                message.error('Import thất bại');
              } finally {
                setUploading(false);
              }
              return false;
            }}
          >
            <Button type='primary' icon={<UploadOutlined />} loading={uploading}>
              Chọn file và Import
            </Button>
          </Upload>
        </div>
      </Modal>
    </>
  );
}

function textFilterDropdown(placeholder: string) {
  return ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
  }: {
    setSelectedKeys: (keys: React.Key[]) => void;
    selectedKeys: React.Key[];
    confirm: () => void;
    clearFilters?: () => void;
  }) => (
    <div style={{ padding: 8 }}>
      <Input
        placeholder={placeholder}
        value={selectedKeys[0] as string}
        onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
        onPressEnter={() => confirm()}
        style={{ marginBottom: 8, display: 'block', width: 200 }}
        autoFocus
      />
      <Space>
        <Button type='primary' onClick={() => confirm()} size='small' style={{ width: 90 }}>
          Tìm
        </Button>
        <Button
          onClick={() => {
            clearFilters?.();
            confirm();
          }}
          size='small'
          style={{ width: 90 }}
        >
          Xóa lọc
        </Button>
      </Space>
    </div>
  );
}

export function UsersSection() {
  const [modal, contextHolder] = Modal.useModal();
  const actionRef = useRef<ActionType>(null);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<AdminUserRow | null>(null);

  const handleDelete = (id: string) =>
    modal.confirm({
      title: 'Xác nhận xóa người dùng',
      content:
        'Xóa người dùng sẽ xóa tất cả đánh giá và trạng thái khóa học liên quan. Xác nhận tiếp tục?',
      okType: 'danger',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        await defaultAxios.delete(`/admin/users/${id}`);
        message.success('Xóa thành công');
        actionRef.current?.reload();
      },
    });

  const handleBulkDelete = () => {
    if (!selectedKeys.length) return;
    modal.confirm({
      title: `Xác nhận xóa ${selectedKeys.length} người dùng`,
      content: 'Xóa người dùng sẽ xóa tất cả đánh giá và trạng thái liên quan. Xác nhận tiếp tục?',
      okType: 'danger',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        await defaultAxios.post('/admin/users/bulk-delete', { ids: selectedKeys.map(String) });
        message.success('Xóa thành công');
        setSelectedKeys([]);
        actionRef.current?.reload();
      },
    });
  };

  return (
    <>
      {contextHolder}
      <ProTable<AdminUserRow>
        className='rounded-lg border border-gray-200 overflow-hidden'
        actionRef={actionRef}
        headerTitle={
          <span className='flex items-center gap-2 text-lg font-semibold'>
            <TeamOutlined className='text-emerald-600' />
            Người dùng
          </span>
        }
        rowKey='id'
        rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
        search={false}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100', '1000000'],
          showTotal: (total) => `Tổng ${total} bản ghi`,
        }}
        request={async (params, sort, filter) => {
          const email = (filter?.['email'] as string[])?.[0];
          const fullName = (filter?.['fullName'] as string[])?.[0];
          const roles = (filter?.['roles'] as string[]) ?? [];
          const resp = await defaultAxios.get('/admin/users', {
            params: {
              page: (params.current ?? 1) - 1,
              size: params.pageSize ?? 10,
              sort: buildSortParam(sort),
              email: email || undefined,
              fullName: fullName || undefined,
              roles: roles.length ? roles : undefined,
            },
          });
          return {
            data: resp.data.data.content,
            success: true,
            total: resp.data.data.totalElements,
          };
        }}
        columns={[
          { title: 'STT', valueType: 'index', width: 60 },
          {
            title: 'Email',
            dataIndex: 'email',
            sorter: true,
            filterDropdown: textFilterDropdown('Tìm email'),
            onFilter: () => true,
          },
          {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            sorter: true,
            filterDropdown: textFilterDropdown('Tìm họ và tên'),
            onFilter: () => true,
          },
          {
            title: 'Vai trò',
            dataIndex: 'roles',
            filters: [
              { text: 'Người dùng', value: 'USER' },
              { text: 'Quản trị viên', value: 'ADMIN' },
            ],
            onFilter: () => true,
            render: (_, r) =>
              r.roles?.map((role) => (
                <Tag key={role} color={role === 'ADMIN' ? 'red' : 'blue'}>
                  {role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                </Tag>
              )),
          },
          {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            width: 160,
            sorter: true,
            render: (_, entity) =>
              entity.createdAt
                ? new Date(entity.createdAt).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '-',
          },
          {
            title: 'Thao tác',
            valueType: 'option',
            render: (_, r) => (
              <Space>
                <Button type='text' icon={<EditOutlined />} onClick={() => setEditRecord(r)} />
                <Button
                  type='text'
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(r.id)}
                />
              </Space>
            ),
          },
        ]}
        toolBarRender={() => [
          <Button key='add' type='primary' icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>
            Thêm mới
          </Button>,
          <ImportButton
            key='import'
            url='/admin/users/import'
            onSuccess={() => actionRef.current?.reload()}
            exampleFileName='mau-nguoi-dung'
            formatColumns={[
              { col: 'A', label: 'Email', required: true },
              { col: 'B', label: 'Họ và tên' },
              { col: 'C', label: 'Vai trò', note: 'USER hoặc ADMIN', required: true },
              { col: 'D', label: 'Mật khẩu', required: true },
            ]}
          />,
          <Button
            key='del'
            danger
            icon={<DeleteOutlined />}
            disabled={!selectedKeys.length}
            onClick={handleBulkDelete}
          >
            Xóa đã chọn ({selectedKeys.length})
          </Button>,
        ]}
      />

      <ModalForm
        title='Thêm người dùng'
        open={addOpen}
        onOpenChange={setAddOpen}
        modalProps={{ destroyOnClose: true, width: 480 }}
        onFinish={async (values) => {
          await defaultAxios.post('/admin/users', {
            ...values,
            roles: values.role ? [values.role] : ['USER'],
          });
          message.success('Thêm thành công');
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText name='email' label='Email' rules={[{ required: true }]} />
        <ProFormText
          name='password'
          label='Mật khẩu'
          fieldProps={{ type: 'password' }}
          rules={[{ required: true }]}
        />
        <ProFormText name='fullName' label='Họ và tên' rules={[{ required: true }]} />
        <ProFormSelect name='role' label='Vai trò' options={ROLE_OPTIONS} initialValue='USER' />
      </ModalForm>

      <ModalForm
        title='Sửa người dùng'
        open={!!editRecord}
        onOpenChange={(open) => {
          if (!open) setEditRecord(null);
        }}
        modalProps={{ destroyOnClose: true, width: 480 }}
        initialValues={editRecord ? { ...editRecord, role: editRecord.roles?.[0] } : undefined}
        onFinish={async (values) => {
          await defaultAxios.put(`/admin/users/${editRecord!.id}`, {
            ...values,
            roles: values.role ? [values.role] : undefined,
          });
          message.success('Cập nhật thành công');
          setEditRecord(null);
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText name='email' label='Email' rules={[{ required: true }]} />
        <ProFormText name='fullName' label='Họ và tên' rules={[{ required: true }]} />
        <ProFormSelect name='role' label='Vai trò' options={ROLE_OPTIONS} />
      </ModalForm>
    </>
  );
}
