import { ProForm, ProFormSelect, ProFormTextArea } from "@ant-design/pro-components";
import { Avatar, Button, Card, Modal, Skeleton, Typography } from "antd";
import { useForm } from "antd/es/form/Form";
import { useState } from "react";

import useGet from "@/common/hooks/network/useGet";
import useRequest from "@/common/hooks/network/useRequest";
import { Algorithm, Course, Dataset, GetCoursesRequest } from "@/common/types/Course.types";
import { CreatePostRequest } from "@/common/types/Discuss.types";
import { useMeContext } from "@/screen/AuthenticateChecking/Authenticated/context/MeContext";

type CreatePostFormType = {
  courseId: string;
  content: string;
};

type Props = {
  afterPost?: () => void;
  algorithm: Algorithm;
  dataset: Dataset;
};

export default function CreatePostCard({ afterPost, algorithm, dataset }: Props) {
  const { me } = useMeContext();

  const [openModal, setOpenModal] = useState(false);

  const [form] = useForm<CreatePostFormType>();
  const [confirmLoading, setConfirmLoading] = useState(false);

  const { request: createPost } = useRequest<void, CreatePostRequest>();

  const { data: allCourseDetailsResponse, isPending: allCourseDetailsPending } = useGet<Course[]>(
    `/courses`,
    {
      params: {
        domain: {
          algorithm,
          dataset,
        },
      } as GetCoursesRequest,
    },
  );

  return (
    <Card className="shadow" styles={{ body: { padding: 15 } }}>
      <div className="flex gap-3 items-center">
        <Avatar src={me.avatarUrl} size={{ xs: 32, sm: 36, md: 40 }} className="shrink-0" />
        <div
          className="bg-[#F0F2F5] rounded-full w-full h-12 flex flex-col justify-center cursor-pointer hover:bg-[#E4E6E9]"
          onClick={() => {
            setOpenModal(true);
          }}
        >
          <Typography.Text className="ml-5 text-[#65686c] text-sm md:text-base">
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
        okText={"Đăng"}
        cancelButtonProps={{ hidden: true }}
        destroyOnHidden
        footer={
          <Button
            className="w-full"
            type="primary"
            loading={confirmLoading}
            onClick={async () => {
              setConfirmLoading(true);
              try {
                const formValues = await form.validateFields();
                await createPost({
                  method: "post",
                  url: "/posts",
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
                name={"courseId"}
                placeholder={"Chọn môn học mà bài viết này thảo luận"}
                options={allCourseDetails.map((course) => {
                  return {
                    label: course.name,
                    value: course.id,
                  };
                })}
                showSearch
                rules={[{ required: true, message: "Vui lòng chọn ít nhất một môn học" }]}
              />
              <ProFormTextArea
                name="content"
                fieldProps={{
                  variant: "borderless",
                  placeholder: "Viết gì đó...",
                  className: "text-2xl",
                  autoSize: true,
                }}
                rules={[{ required: true, message: "Bài đăng không được trống" }]}
              />
            </ProForm>
          );
        })()}
      </Modal>
    </Card>
  );
}
