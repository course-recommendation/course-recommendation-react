import { CourseDetail } from "@/common/types/Course.types";
import { ProForm, ProFormSelect } from "@ant-design/pro-components";
import { Button, Card, Empty, Modal, Skeleton, Spin, Typography } from "antd";
import { useForm } from "antd/es/form/Form";
import { ReactNode, useState } from "react";
import CourseCard from "../../../../../../common/components/CourseCard";
import { RestResponse } from "../../../../../../common/types/Network";

export type UpdateMyCoursesFormType = {
  courseIds: string[];
};

type Props = {
  title: ReactNode;
  allCourseDetailsResponse?: RestResponse<CourseDetail[]>;
  allCourseDetailsPending: boolean;
  courseDetailsResponse?: RestResponse<CourseDetail[]>;
  courseDetailsPending: boolean;
  onOk: (courseIds: string[]) => Promise<void>;
  refetching: boolean;
};

export default function MyCoursesCard({
  title,
  allCourseDetailsPending,
  allCourseDetailsResponse,
  courseDetailsPending,
  courseDetailsResponse,
  onOk,
  refetching,
}: Props) {
  const [form] = useForm<UpdateMyCoursesFormType>();
  const [openModal, setOpenModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  return (
    <Spin spinning={refetching}>
      <Card className="shadow">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <Typography.Title level={3} className="m-0 text-xl sm:text-2xl">
            {title}
          </Typography.Title>
          <Button
            type="primary"
            size="middle"
            className="w-full sm:w-auto"
            onClick={() => {
              form.setFieldsValue({
                courseIds: courseDetailsResponse?.data.map((x) => x.course.id) ?? [],
              });
              setOpenModal(true);
            }}
          >
            Cập nhật
          </Button>
        </div>
        <div>
          {(() => {
            if (courseDetailsPending) {
              return <Skeleton active />;
            }

            const courseDetails = courseDetailsResponse!.data;

            if (courseDetails.length === 0) {
              return <Empty description="Chưa có môn học nào" />;
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {courseDetails.map((courseDetail) => (
                  <CourseCard key={courseDetail.course.id} courseDetail={courseDetail} />
                ))}
              </div>
            );
          })()}
        </div>

        <Modal
          okText="Xác nhận"
          cancelText="Hủy"
          open={openModal}
          onCancel={() => {
            setOpenModal(false);
          }}
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
            if (allCourseDetailsPending) {
              return <Skeleton active />;
            }

            const courses = allCourseDetailsResponse!.data;

            return (
              <ProForm<UpdateMyCoursesFormType> form={form} submitter={false}>
                <ProFormSelect
                  label="Môn học"
                  name="courseIds"
                  mode="multiple"
                  options={courses.map((courseDetail) => ({
                    label: courseDetail.course.name,
                    value: courseDetail.course.id,
                  }))}
                  showSearch
                  fieldProps={{
                    maxTagCount: "responsive",
                    placeholder: "Chọn môn học",
                  }}
                />
              </ProForm>
            );
          })()}
        </Modal>
      </Card>
    </Spin>
  );
}
