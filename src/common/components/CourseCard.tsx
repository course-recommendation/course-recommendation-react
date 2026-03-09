import { CourseDetail } from "@/common/types/Course.types";
import { Card } from "antd";
import React from "react";

interface Props {
  courseDetail: CourseDetail;
  footer?: React.ReactNode;
  cardProps?: React.HTMLAttributes<HTMLDivElement>;
}

export default function CourseCard({ courseDetail, footer, cardProps }: Props) {
  return (
    <Card
      className="bg-white rounded-lg overflow-hidden border border-gray-300"
      styles={{ body: { padding: 0 } }}
      {...cardProps}
    >
      <div className="relative w-full h-32 md:h-48 overflow-hidden">
        <img
          src={`https://picsum.photos/seed/${courseDetail.course.id}/1600/900`}
          alt={courseDetail.course.courseId}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-3 md:p-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-800 line-clamp-1">
          {courseDetail.course.name}
        </h3>
      </div>

      {footer && <div className="px-3 pb-3 md:px-4 md:pb-4">{footer}</div>}
    </Card>
  );
}
