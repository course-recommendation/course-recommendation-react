import useGet from "@/common/hooks/network/useGet";
import {
  Course,
  CourseAlgorithm,
  CourseDataset,
  GetCoursesRequest,
} from "@/common/types/Course.types";
import { Card, Checkbox, Collapse, Input, Skeleton, Tag, Typography } from "antd";
import { useMemo, useState } from "react";

type Props = {
  algorithm: CourseAlgorithm;
  dataset: CourseDataset;
  selectedCourseIds: string[];
  onSelectedCourseIdsChange: (courseIds: string[]) => void;
};

export default function DiscussFilter({
  algorithm,
  dataset,
  selectedCourseIds,
  onSelectedCourseIdsChange,
}: Props) {
  const { data: allCoursesResponse, isPending: allCoursesPending } = useGet<Course[]>("/courses", {
    params: {
      domain: {
        algorithm,
        dataset,
      },
    } as GetCoursesRequest,
  });
  const [input, setInput] = useState("");

  const filteredCourses = useMemo(() => {
    return (
      allCoursesResponse?.data.filter((course) => {
        return course.name.toLowerCase().includes(input);
      }) ?? []
    );
  }, [allCoursesResponse?.data, input]);

  const checkedCourses =
    allCoursesResponse?.data.filter((course) => {
      return selectedCourseIds.includes(course.courseId);
    }) ?? [];

  return (
    <Card
      className="h-full rounded-none shadow overflow-y-auto pt-3"
      title={<Typography.Title level={4}>Bộ lọc</Typography.Title>}
      extra={
        <Typography.Text
          className="cursor-pointer"
          underline
          onClick={() => {
            onSelectedCourseIdsChange([]);
          }}
        >
          Xóa bộ lọc
        </Typography.Text>
      }
    >
      {(() => {
        if (allCoursesPending) {
          return <Skeleton />;
        }

        return (
          <div>
            <div className="flex flex-wrap gap-2">
              {checkedCourses.map((course) => {
                return (
                  <Tag
                    closeIcon
                    key={course.id}
                    onClose={() => {
                      onSelectedCourseIdsChange(selectedCourseIds.filter((x) => x !== course.courseId));
                    }}
                    className="text-base border-gray-400 p-2 rounded-xl"
                  >
                    {course.name}
                  </Tag>
                );
              })}
            </div>
            <div className="my-4"></div>
            <Collapse
              defaultActiveKey={["courses"]}
              items={[
                {
                  key: "courses",
                  label: (
                    <Typography.Title level={5} className="m-0">
                      Môn học
                    </Typography.Title>
                  ),
                  children: (
                    <div>
                      <Input
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value);
                        }}
                        placeholder="Tìm môn học"
                      />
                      <div className="my-3"></div>
                      <div className="h-[300px] overflow-y-auto px-2">
                        <Checkbox.Group
                          className="flex flex-col gap-1"
                          options={filteredCourses.map((course) => {
                            return {
                              label: course.name,
                              value: course.courseId,
                            };
                          })}
                          value={selectedCourseIds}
                          onChange={(e) => {
                            onSelectedCourseIdsChange(e);
                          }}
                        />
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        );
      })()}
    </Card>
  );
}
