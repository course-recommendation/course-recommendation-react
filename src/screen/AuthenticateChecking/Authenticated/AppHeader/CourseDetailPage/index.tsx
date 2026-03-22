import { useCourseDomainContext as useDomainContext } from "@/common/context/DomainContext";
import useGet from "@/common/hooks/network/useGet";
import useRequest from "@/common/hooks/network/useRequest";
import { useAttributeValues } from "@/common/hooks/useAttributeValues";
import {
  CourseDetail,
  GetCourseDetailsRequest,
  RateCourseRequest,
} from "@/common/types/Course.types";
import { Button, Skeleton, Typography } from "antd";
import { Link, useParams } from "react-router";
import AttributeRating from "./AttributeRating";

export default function CourseDetailPage() {
  const { courseCode: courseCodeOpt } = useParams();
  const domain = useDomainContext();
  const { algorithm, dataset } = domain;

  const courseCode = courseCodeOpt!;

  const { data: courseDetailResponse, isPending: courseDetailPending } = useGet<CourseDetail>(
    `/courses/${courseCode}/detail`,
    {
      params: { domain } as GetCourseDetailsRequest,
    },
  );

  const { data: attributeValuesResponse, isPending: attributeValuesPending } = useAttributeValues({
    algorithm,
    dataset,
  });

  const { request: rateCourse } = useRequest<void, RateCourseRequest>();

  return (
    <div className="m-10">
      {(() => {
        if (courseDetailPending || attributeValuesPending) {
          return <Skeleton />;
        }

        const courseDetail = courseDetailResponse!.data;
        const attributeValues = attributeValuesResponse!.data;

        return (
          <div className="flex flex-col items-center gap-3">
            <img
              src={`https://picsum.photos/seed/${courseDetail.course.code}/1600/900`}
              className="w-1/3"
            />
            <Typography.Title className="mb-0" level={3}>
              {courseDetail.course.name}
            </Typography.Title>
            <AttributeRating
              attributeValues={attributeValues}
              attributeValueToRatingScore={courseDetail.userAttributeValueToRatingScore}
              onRatingChange={async (attributeValue, score) => {
                rateCourse({
                  method: "PUT",
                  url: `/courses/${courseDetail.course.id}/rating`,
                  data: {
                    attributeValue,
                    score,
                  },
                });
              }}
            />
            <Link to={`/discuss?courseCodes=${courseDetail.course.code}`}>
              <Button>Xem thảo luận</Button>
            </Link>
          </div>
        );
      })()}
    </div>
  );
}
