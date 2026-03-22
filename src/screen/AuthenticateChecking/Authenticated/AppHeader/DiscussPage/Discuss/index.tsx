import { Measure } from "@/common/constants/Measure";
import { Algorithm, Dataset } from "@/common/types/Course.types";
import { FilterOutlined } from "@ant-design/icons";
import { Button, Drawer } from "antd";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import DiscussFilter from "./components/DiscussFilter";
import DiscussMainArea from "./DiscussMainArea";

type Props = {
  algorithm: Algorithm;
  dataset: Dataset;
};

export default function Discuss({ algorithm, dataset }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filteredCourseCodes, setFilteredCourseCodes] = useState<string[]>([]);
  const [finalFilteredCourseCodes, setFinalFilteredCourseCodes] = useState<string[]>([]);
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);

  const resolveNumberOfFiltersText = () => {
    const filterCount = finalFilteredCourseCodes.length;
    if (filterCount === 0) {
      return "";
    }
    return ` (${filterCount})`;
  };

  useEffect(() => {
    const courseCodesParam = searchParams.get("courseCodes");
    if (courseCodesParam) {
      const codes = courseCodesParam.split(",");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilteredCourseCodes(codes);
      setFinalFilteredCourseCodes(codes);
    }
  }, [searchParams]);

  useEffect(() => {
    if (finalFilteredCourseCodes.length > 0) {
      setSearchParams(
        {
          courseCodes: finalFilteredCourseCodes.join(","),
        },
        { replace: true },
      );
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [finalFilteredCourseCodes, setSearchParams]);

  return (
    <div className="flex overflow-y-hidden" style={{ height: Measure.SCREEN_HEIGHT_STYLE }}>
      <div className="w-[28%] overflow-auto hidden md:block">
        <DiscussFilter
          algorithm={algorithm}
          dataset={dataset}
          selectedCourseIds={filteredCourseCodes}
          onSelectedCourseIdsChange={(courseIds) => {
            setFilteredCourseCodes(courseIds);
            setFinalFilteredCourseCodes(courseIds);
          }}
        />
      </div>
      <div className="flex-1 overflow-auto px-5 md:px-20 pt-10">
        <DiscussMainArea
          algorithm={algorithm}
          dataset={dataset}
          courseIds={finalFilteredCourseCodes}
          filterSection={
            <Button
              className="md:hidden md:-mb-6"
              icon={<FilterOutlined />}
              onClick={() => {
                setOpenFilterDrawer(true);
              }}
            >
              {`Bộ lọc${resolveNumberOfFiltersText()}`}
            </Button>
          }
        />
      </div>

      <Drawer
        open={openFilterDrawer}
        onClose={() => {
          setOpenFilterDrawer(false);
          setFilteredCourseCodes(finalFilteredCourseCodes);
        }}
        placement="bottom"
        size={"large"}
        className="md:hidden"
        extra={
          <Button
            type="primary"
            onClick={() => {
              setFinalFilteredCourseCodes(filteredCourseCodes);
              setOpenFilterDrawer(false);
            }}
          >
            Áp dụng
          </Button>
        }
      >
        <DiscussFilter
          algorithm={algorithm}
          dataset={dataset}
          selectedCourseIds={filteredCourseCodes}
          onSelectedCourseIdsChange={(courseIds) => {
            setFilteredCourseCodes(courseIds);
          }}
        />
      </Drawer>
    </div>
  );
}
