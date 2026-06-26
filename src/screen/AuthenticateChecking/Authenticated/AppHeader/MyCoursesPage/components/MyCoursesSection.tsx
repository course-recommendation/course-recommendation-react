import RatingPopoverCard from '@/common/components/RatingPopoverCard';
import { Algorithm, CourseDetail } from '@/common/types/Course.types';
import { RestResponse } from '@/common/types/Network.ts';
import { DownOutlined, EditOutlined } from '@ant-design/icons';
import { ProForm, ProFormSelect } from '@ant-design/pro-components';
import { Button, Card, Modal, Popover, Skeleton, Spin, Table } from 'antd';
import { useForm } from 'antd/es/form/Form';
import type { ColumnsType } from 'antd/es/table';
import { ReactNode, useState } from 'react';
import { Link } from 'react-router';

export type UpdateMyCoursesFormType = {
  courseIds: number[];
};

type Props = {
  title?: ReactNode;
  allCourseDetailsResponse?: RestResponse<CourseDetail[]>;
  allCourseDetailsPending: boolean;
  courseDetailsResponse?: RestResponse<CourseDetail[]>;
  courseDetailsPending: boolean;
  onOk: (courseIds: number[]) => Promise<void>;
  refetching: boolean;
  showRatingColumn?: boolean;
  algorithm?: Algorithm;
};

const columns: ColumnsType<CourseDetail> = [
  {
    title: 'STT',
    key: 'index',
    width: 60,
    render: (_: unknown, __: CourseDetail, index: number) => index + 1,
  },
  {
    title: 'Mã',
    dataIndex: ['course', 'code'],
    key: 'code',
    width: 110,
  },
  {
    title: 'Tên môn học',
    dataIndex: ['course', 'name'],
    key: 'name',
    render: (name: string, record: CourseDetail) => (
      <Link to={`/courses/${record.course.code}`}>{name}</Link>
    ),
  },
  {
    title: 'Mô tả',
    dataIndex: ['course', 'description'],
    key: 'description',
    ellipsis: true,
  },
];

export default function MyCoursesSection({
  title,
  allCourseDetailsPending,
  allCourseDetailsResponse,
  courseDetailsPending,
  courseDetailsResponse,
  onOk,
  refetching,
  showRatingColumn,
  algorithm,
}: Props) {
  const [form] = useForm<UpdateMyCoursesFormType>();
  const [openModal, setOpenModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const ratingColumn: ColumnsType<CourseDetail>[number] = {
    title: 'Đánh giá',
    key: 'rating',
    width: 110,
    render: (_: unknown, record: CourseDetail) => (
      <Popover
        trigger='hover'
        placement='bottomRight'
        overlayInnerStyle={{ background: 'white' }}
        content={
          <RatingPopoverCard
            courseId={record.course.id}
            courseCode={record.course.code}
            algorithm={algorithm!}
          />
        }
      >
        <Button type='link' size='small' iconPlacement='end' icon={<DownOutlined />}>
          Đánh giá
        </Button>
      </Popover>
    ),
  };

  return (
    <Spin spinning={refetching}>
      <Card>
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-6'>
          {title && (
            <div>
              <div
                className='text-[22px] font-semibold text-[#1C1917] leading-tight'
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {title}
              </div>
              <div className='mt-2 w-8 h-[3px] rounded-full bg-indigo-700' />
            </div>
          )}
          <Button
            type='primary'
            size='middle'
            icon={<EditOutlined />}
            className='w-full sm:w-auto sm:ml-auto shrink-0'
            onClick={() => {
              form.setFieldsValue({
                courseIds: courseDetailsResponse?.data.map((x) => x.course.id) ?? [],
              });
              setOpenModal(true);
            }}
          >
            Cập nhật danh sách
          </Button>
        </div>

        {(() => {
          if (courseDetailsPending) return <Skeleton active />;

          const courseDetails = courseDetailsResponse!.data;

          return (
            <Table<CourseDetail>
              columns={showRatingColumn ? [...columns, ratingColumn] : columns}
              dataSource={courseDetails}
              rowKey={(r) => r.course.id}
              scroll={{ x: 600 }}
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100', '1000000'],
                showTotal: (total) => `Tổng ${total} bản ghi`,
              }}
              size='middle'
            />
          );
        })()}

        <Modal
          okText='Xác nhận'
          cancelText='Hủy'
          open={openModal}
          onCancel={() => setOpenModal(false)}
          confirmLoading={confirmLoading}
          onOk={async () => {
            setConfirmLoading(true);
            try {
              const formValues = await form.validateFields();
              await onOk(formValues.courseIds);
              setConfirmLoading(false);
              setOpenModal(false);
            } catch {
              setConfirmLoading(false);
            }
          }}
        >
          {(() => {
            if (allCourseDetailsPending) return <Skeleton active />;

            const courses = allCourseDetailsResponse!.data;

            return (
              <ProForm<UpdateMyCoursesFormType> form={form} submitter={false}>
                <ProFormSelect
                  label='Môn học'
                  name='courseIds'
                  mode='multiple'
                  options={courses.map((courseDetail) => ({
                    label: courseDetail.course.name,
                    value: courseDetail.course.id,
                  }))}
                  showSearch
                  fieldProps={{ placeholder: 'Chọn môn học' }}
                />
              </ProForm>
            );
          })()}
        </Modal>
      </Card>
    </Spin>
  );
}
