import { DeleteOutlined, EditOutlined, PlusOutlined, StarOutlined } from '@ant-design/icons';
import {
  ActionType,
  ModalForm,
  ProFormDigit,
  ProFormSelect,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Input, message, Modal, Space } from 'antd';
import { useRef, useState } from 'react';

import defaultAxios from '@/common/services/defaultAxios';
import { SortOrder } from 'antd/es/table/interface';
import { ImportButton } from './UsersSection';

type AdminRatingRow = {
  id: number;
  userEmail: string;
  courseId: number;
  courseCode: string;
  attributeId: number;
  attributeName: string;
  score: number;
};

function buildSortParam(sort: Record<string, SortOrder>): string | undefined {
  const entries = Object.entries(sort ?? {});
  if (!entries.length) return undefined;
  const [field, order] = entries[0];
  return `${field},${order === 'ascend' ? 'asc' : 'desc'}`;
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

export function RatingsSection() {
  const [modal, contextHolder] = Modal.useModal();
  const actionRef = useRef<ActionType>(null);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<AdminRatingRow | null>(null);

  const handleDelete = (id: number) =>
    modal.confirm({
      title: 'Xác nhận xóa đánh giá',
      content: 'Bạn có chắc chắn muốn xóa đánh giá này không?',
      okType: 'danger',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        await defaultAxios.delete(`/admin/ratings/${id}`);
        message.success('Xóa thành công');
        actionRef.current?.reload();
      },
    });

  const handleBulkDelete = () => {
    if (!selectedKeys.length) return;
    modal.confirm({
      title: `Xác nhận xóa ${selectedKeys.length} đánh giá`,
      content: 'Bạn có chắc chắn muốn xóa các đánh giá đã chọn không?',
      okType: 'danger',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        await defaultAxios.post('/admin/ratings/bulk-delete', { ids: selectedKeys.map(String) });
        message.success('Xóa thành công');
        setSelectedKeys([]);
        actionRef.current?.reload();
      },
    });
  };

  return (
    <>
      {contextHolder}
      <ProTable<AdminRatingRow>
        className='rounded-lg border border-gray-200 overflow-hidden'
        actionRef={actionRef}
        headerTitle={<span className='flex items-center gap-2 text-lg font-semibold'><StarOutlined className='text-amber-600' />Đánh giá người dùng</span>}
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
          const userEmail = (filter?.['userEmail'] as string[])?.[0];
          const courseCode = (filter?.['courseCode'] as string[])?.[0];
          const attributeName = (filter?.['attributeName'] as string[])?.[0];
          const resp = await defaultAxios.get('/admin/ratings', {
            params: {
              page: (params.current ?? 1) - 1,
              size: params.pageSize ?? 10,
              sort: buildSortParam(sort),
              userEmail: userEmail || undefined,
              courseCode: courseCode || undefined,
              attributeName: attributeName || undefined,
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
            title: 'Email người dùng',
            dataIndex: 'userEmail',
            sorter: true,
            filterDropdown: textFilterDropdown('Tìm email người dùng'),
            onFilter: () => true,
          },
          {
            title: 'Mã khóa học',
            dataIndex: 'courseCode',
            filterDropdown: textFilterDropdown('Tìm mã khóa học'),
            onFilter: () => true,
          },
          {
            title: 'Thuộc tính',
            dataIndex: 'attributeName',
            filterDropdown: textFilterDropdown('Tìm thuộc tính'),
            onFilter: () => true,
          },
          { title: 'Điểm', dataIndex: 'score', sorter: true },
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
            url='/admin/ratings/import'
            onSuccess={() => actionRef.current?.reload()}
            exampleFileName='mau-danh-gia'
            formatColumns={[
              { col: 'A', label: 'Email người dùng', required: true },
              { col: 'B', label: 'Mã khóa học', required: true },
              { col: 'C', label: 'Tên thuộc tính', required: true },
              { col: 'D', label: 'Điểm', required: true, note: 'Số nguyên từ 1 đến 5' },
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
        title='Thêm đánh giá'
        open={addOpen}
        onOpenChange={setAddOpen}
        modalProps={{ destroyOnClose: true, width: 480 }}
        onFinish={async (values) => {
          await defaultAxios.post('/admin/ratings', {
            userEmail: values.userEmail,
            courseId: Number(values.courseId),
            attributeName: values.attributeName,
            score: values.score,
          });
          message.success('Thêm thành công');
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormSelect
          name='userEmail'
          label='Email người dùng'
          rules={[{ required: true }]}
          showSearch
          request={async () => {
            const resp = await defaultAxios.get('/admin/users', {
              params: { page: 0, size: 10000 },
            });
            return (resp.data.data.content as { email: string }[]).map((u) => ({
              label: u.email,
              value: u.email,
            }));
          }}
        />
        <ProFormSelect
          name='courseId'
          label='Mã khóa học'
          rules={[{ required: true }]}
          showSearch
          request={async () => {
            const resp = await defaultAxios.get('/admin/courses', {
              params: { page: 0, size: 10000 },
            });
            return (resp.data.data.content as { id: number; code: string }[]).map((c) => ({
              label: c.code,
              value: c.id,
            }));
          }}
        />
        <ProFormSelect
          name='attributeName'
          label='Tên thuộc tính'
          rules={[{ required: true }]}
          showSearch
          request={async () => {
            const resp = await defaultAxios.get('/admin/attributes', {
              params: { page: 0, size: 10000 },
            });
            return (resp.data.data.content as { value: string }[]).map((a) => ({
              label: a.value,
              value: a.value,
            }));
          }}
        />
        <ProFormDigit name='score' label='Điểm' min={1} max={5} rules={[{ required: true }]} />
      </ModalForm>

      <ModalForm
        title='Sửa đánh giá'
        open={!!editRecord}
        onOpenChange={(open) => {
          if (!open) setEditRecord(null);
        }}
        modalProps={{ destroyOnClose: true, width: 480 }}
        initialValues={editRecord ? { score: editRecord.score } : undefined}
        onFinish={async (values) => {
          await defaultAxios.put(`/admin/ratings/${editRecord!.id}`, { score: values.score });
          message.success('Cập nhật thành công');
          setEditRecord(null);
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormDigit name='score' label='Điểm' min={1} max={5} rules={[{ required: true }]} />
      </ModalForm>
    </>
  );
}
