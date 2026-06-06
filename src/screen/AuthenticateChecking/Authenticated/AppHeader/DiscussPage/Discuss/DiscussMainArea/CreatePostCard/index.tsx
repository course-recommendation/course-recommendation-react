import useGet from '@/common/hooks/network/useGet';
import useRequest from '@/common/hooks/network/useRequest';
import { Algorithm, Course, GetCoursesRequest } from '@/common/types/Course.types';
import { CreatePostRequest } from '@/common/types/Discuss.types';
import { useMeContext } from '@/screen/AuthenticateChecking/Authenticated/context/MeContext';
import { MessageOutlined, TeamOutlined, TrophyOutlined } from '@ant-design/icons';
import { ProForm, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { Avatar, Button, Modal, Skeleton, Typography } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useState } from 'react';

type CreatePostFormType = {
  courseCode: string;
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
    { params: { algorithm } as GetCoursesRequest },
  );

  return (
    <>
      <div className='relative overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-md shadow-indigo-50/60'>
        {/* Accent stripe */}
        <div className='absolute inset-x-0 top-0 h-[3px] bg-indigo-700' />

        <div className='px-5 pt-5 pb-4'>
          {/* Prompt row */}
          <div className='flex gap-3 items-center'>
            <Avatar
              src={me.avatarUrl}
              size={40}
              className='shrink-0 ring-2 ring-indigo-100 ring-offset-1'
            />
            <button
              className='flex-1 h-11 rounded-full border border-slate-200 bg-slate-50 px-5 text-left text-slate-400 text-sm hover:border-indigo-300 hover:bg-indigo-50/40 hover:text-slate-500 transition-all cursor-pointer shadow-inner shadow-slate-100/80'
              onClick={() => setOpenModal(true)}
            >
              Chia sẻ điều gì đó về môn học...
            </button>
          </div>

          {/* Divider */}
          <div className='mt-4 border-t border-slate-100' />

          {/* Stats row */}
          <div className='flex items-center justify-around mt-3'>
            <div className='flex items-center gap-1.5 text-xs text-slate-400'>
              <MessageOutlined className='text-indigo-400' />
              Thảo luận về môn học
            </div>
            <div className='w-px h-4 bg-slate-100' />
            <div className='flex items-center gap-1.5 text-xs text-slate-400'>
              <TeamOutlined className='text-indigo-400' />
              Chia sẻ kinh nghiệm
            </div>
            <div className='w-px h-4 bg-slate-100' />
            <div className='flex items-center gap-1.5 text-xs text-slate-400'>
              <TrophyOutlined className='text-indigo-400' />
              Đánh giá khóa học
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={openModal}
        onCancel={() => setOpenModal(false)}
        title={
          <Typography.Title level={4} className='m-0'>
            Tạo bài viết
          </Typography.Title>
        }
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
                    courseCode: formValues.courseCode,
                    content: formValues.content,
                    algorithm,
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
        {allCourseDetailsPending ? (
          <Skeleton />
        ) : (
          <ProForm<CreatePostFormType> form={form} submitter={false} clearOnDestroy>
            <ProFormSelect
              name='courseCode'
              label='Môn học'
              placeholder='Chọn môn học mà bài viết này thảo luận'
              options={allCourseDetailsResponse!.data.map((course) => ({
                label: course.name,
                value: course.code,
              }))}
              showSearch
              rules={[{ required: true, message: 'Vui lòng chọn ít nhất một môn học' }]}
            />
            <ProFormTextArea
              name='content'
              fieldProps={{
                placeholder: 'Viết gì đó...',
                className: 'text-base',
                autoSize: { minRows: 4 },
              }}
              rules={[{ required: true, message: 'Bài đăng không được trống' }]}
            />
          </ProForm>
        )}
      </Modal>
    </>
  );
}
