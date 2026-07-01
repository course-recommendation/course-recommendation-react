import { DeleteOutlined, EditOutlined, PlusOutlined, TagsOutlined } from '@ant-design/icons';
import { ActionType, ModalForm, ProFormText, ProTable } from '@ant-design/pro-components';
import { Button, Input, message, Modal, Space } from 'antd';
import { useRef, useState } from 'react';

import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import defaultAxios from '@/common/services/defaultAxios';
import { SortOrder } from 'antd/es/table/interface';
import { ImportButton } from './UsersSection';

type AdminAttributeRow = {
  id: number;
  value: string;
  algorithm: string;
  createdAt: string;
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

export function AttributesSection() {
  const algorithm = useAlgorithmContext();
  const [modal, contextHolder] = Modal.useModal();
  const actionRef = useRef<ActionType>(null);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<AdminAttributeRow | null>(null);

  function confirmRetrain(): Promise<void> {
    return new Promise((resolve, reject) =>
      modal.confirm({
        title: 'Cảnh báo: Huấn luyện lại mô hình',
        content: 'Thao tác này sẽ huấn luyện lại mô hình ngay lập tức. Xác nhận tiếp tục?',
        okText: 'Xác nhận',
        cancelText: 'Hủy',
        onOk: () => resolve(),
        onCancel: () => reject(new Error('cancelled')),
      }),
    );
  }

  const handleDelete = (id: number) =>
    modal.confirm({
      title: 'Xác nhận xóa thuộc tính',
      content:
        'Xóa thuộc tính sẽ xóa tất cả đánh giá liên quan và huấn luyện lại mô hình ngay lập tức. Xác nhận tiếp tục?',
      okType: 'danger',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        await defaultAxios.delete(`/admin/attributes/${id}`);
        message.success('Xóa thành công');
        actionRef.current?.reload();
      },
    });

  const handleBulkDelete = () => {
    if (!selectedKeys.length) return;
    modal.confirm({
      title: `Xác nhận xóa ${selectedKeys.length} thuộc tính`,
      content:
        'Xóa thuộc tính sẽ xóa tất cả đánh giá liên quan và huấn luyện lại mô hình ngay lập tức. Xác nhận tiếp tục?',
      okType: 'danger',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        await defaultAxios.post('/admin/attributes/bulk-delete', { ids: selectedKeys.map(String) });
        message.success('Xóa thành công');
        setSelectedKeys([]);
        actionRef.current?.reload();
      },
    });
  };

  return (
    <>
      {contextHolder}
      <ProTable<AdminAttributeRow>
        className='rounded-lg border border-gray-200 overflow-hidden'
        actionRef={actionRef}
        headerTitle={
          <span className='flex items-center gap-2 text-lg font-semibold'>
            <TagsOutlined className='text-violet-600' />
            Thuộc tính
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
          const value = (filter?.['value'] as string[])?.[0];
          const resp = await defaultAxios.get('/admin/attributes', {
            params: {
              page: (params.current ?? 1) - 1,
              size: params.pageSize ?? 10,
              sort: buildSortParam(sort),
              value: value || undefined,
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
            title: 'Tên',
            dataIndex: 'value',
            sorter: true,
            filterDropdown: textFilterDropdown('Tìm tên thuộc tính'),
            onFilter: () => true,
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
            url='/admin/attributes/import'
            onSuccess={() => actionRef.current?.reload()}
            exampleFileName='mau-thuoc-tinh'
            formatColumns={[{ col: 'A', label: 'Tên thuộc tính', required: true }]}
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
        title='Thêm thuộc tính'
        open={addOpen}
        onOpenChange={setAddOpen}
        modalProps={{ destroyOnClose: true, width: 480 }}
        onFinish={async (values) => {
          try {
            await confirmRetrain();
          } catch {
            return false;
          }
          await defaultAxios.post('/admin/attributes/create', { ...values, algorithm });
          message.success('Thêm thành công');
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText name='value' label='Tên' rules={[{ required: true }]} />
      </ModalForm>

      <ModalForm
        title='Sửa thuộc tính'
        open={!!editRecord}
        onOpenChange={(open) => {
          if (!open) setEditRecord(null);
        }}
        modalProps={{ destroyOnClose: true, width: 480 }}
        initialValues={editRecord ?? undefined}
        onFinish={async (values) => {
          try {
            await confirmRetrain();
          } catch {
            return false;
          }
          await defaultAxios.put(`/admin/attributes/${editRecord!.id}`, { ...values, algorithm });
          message.success('Cập nhật thành công');
          setEditRecord(null);
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText name='value' label='Tên' rules={[{ required: true }]} />
      </ModalForm>
    </>
  );
}
