import { ProForm, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { Avatar, Button, Card, Modal, Skeleton, Typography } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useState } from 'react';

import useGet from '@/common/hooks/network/useGet';
import useRequest from '@/common/hooks/network/useRequest';
import { Algorithm, Course, GetCoursesRequest } from '@/common/types/Course.types';
import { CreatePostRequest } from '@/common/types/Discuss.types';
import { useMeContext } from '@/screen/AuthenticateChecking/Authenticated/context/MeContext';

type CreatePostFormType = {
  courseId: string;
  content: string;
};

type Props = {
  afterPost?: () => void;
  algorithm: Algorithm;
};

export default function CreatePostCard({ afterPost, algorithm }: Props) {
  const { me } = useMeContext();

  const [openModal, setOpenModal] = useState(false);

  const [form] = useForm<CreatePostFormType>();
  const [confirmLoading, setConfirmLoading] = useState(false);

  const { request: createPost } = useRequest<void, CreatePostRequest>();

  const { data: allCourseDetailsResponse, isPending: allCourseDetailsPending } = useGet<Course[]>(
    `/courses`,
    {
      params: {
        algorithm,
      } as GetCoursesRequest,
    },
  );

  return (
    <Card
      className='rounded-2xl border border-slate-200/80 bg-white/95 shadow-sm'
      styles={{ body: { padding: 15 } }}
    >
      <div className='flex gap-3 items-center'>
        <Avatar src={me.avatarUrl} size={{ xs: 32, sm: 36, md: 40 }} className='shrink-0' />
        <div
          className='h-12 w-full cursor-pointer rounded-full border border-slate-200 bg-gradient-to-r from-slate-100 to-slate-50 px-5 text-slate-500 transition-colors hover:border-indigo-200 hover:text-slate-600'
          onClick={() => {
            setOpenModal(true);
          }}
        >
          <Typography.Text className='leading-[48px] text-sm text-inherit md:text-base'>
            Viết gì đó...
          </Typography.Text>
        </div>
      </div>
      <Modal
        open={openModal}
        onCancel={() => {
          setOpenModal(false);
        }}
        title={<Typography.Title level={4}>Tạo bài viết</Typography.Title>}
        okText={'Đăng'}
        cancelButtonProps={{ hidden: true }}
        destroyOnHidden
        footer={
          <Button
            className='w-full'
            type='primary'
            loading={confirmLoading}
            onClick={async () => {
              setConfirmLoading(true);
              try {
                const formValues = await form.validateFields();
                await createPost({
                  method: 'post',
                  url: '/posts',
                  data: {
                    courseId: formValues.courseId,
                    content: formValues.content,
                  },
                });
                setConfirmLoading(false);
                setOpenModal(false);
                afterPost?.();
              } catch {
                setConfirmLoading(false);
              }
            }}
          >
            Đăng bài viết
          </Button>
        }
      >
        {(() => {
          if (allCourseDetailsPending) {
            return <Skeleton />;
          }

          const allCourseDetails = allCourseDetailsResponse!.data;

          return (
            <ProForm<CreatePostFormType> form={form} submitter={false} clearOnDestroy>
              <ProFormSelect
                name={'courseId'}
                label='Môn học'
                placeholder={'Chọn môn học mà bài viết này thảo luận'}
                options={allCourseDetails.map((course) => {
                  return {
                    label: course.name,
                    value: course.id,
                  };
                })}
                showSearch
                rules={[{ required: true, message: 'Vui lòng chọn ít nhất một môn học' }]}
              />
              <ProFormTextArea
                name='content'
                fieldProps={{
                  variant: 'borderless',
                  placeholder: 'Viết gì đó...',
                  className: 'text-lg md:text-xl',
                  autoSize: true,
                }}
                rules={[{ required: true, message: 'Bài đăng không được trống' }]}
              />
            </ProForm>
          );
        })()}
      </Modal>
    </Card>
  );
}
