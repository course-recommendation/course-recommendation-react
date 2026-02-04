import { Measure } from "@/common/constants/Measure";
import { CourseAlgorithm, CourseDataset } from "@/common/types/Course.types";
import { FilterOutlined } from "@ant-design/icons";
import { Button, Drawer } from "antd";
import { useState } from "react";
import DiscussFilter from "./components/DiscussFilter";
import DiscussMainArea from "./DiscussMainArea";

type Props = {
  algorithm: CourseAlgorithm;
  dataset: CourseDataset;
};

export default function Discuss({ algorithm, dataset }: Props) {
  const [filteredCourseIds, setFilteredCourseIds] = useState<string[]>([]);
  const [finalFilteredCourseIds, setFinalFilteredCourseIds] = useState<string[]>([]);
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);

  const resolveNumberOfFiltersText = () => {
    const filterCount = finalFilteredCourseIds.length;
    if (filterCount === 0) {
      return "";
    }
    return ` (${filterCount})`;
  };

  return (
    <div className="flex overflow-y-hidden" style={{ height: Measure.SCREEN_HEIGHT_STYLE }}>
      <div className="w-[28%] overflow-auto hidden md:block">
        <DiscussFilter
          algorithm={algorithm}
          dataset={dataset}
          selectedCourseIds={filteredCourseIds}
          onSelectedCourseIdsChange={(courseIds) => {
            setFilteredCourseIds(courseIds);
            setFinalFilteredCourseIds(courseIds);
          }}
        />
      </div>
      <div className="flex-1 overflow-auto px-5 md:px-20 pt-10">
        <DiscussMainArea
          algorithm={algorithm}
          dataset={dataset}
          courseIds={finalFilteredCourseIds}
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
          setFilteredCourseIds(finalFilteredCourseIds);
        }}
        placement="bottom"
        size={"large"}
        className="md:hidden"
        extra={
          <Button
            type="primary"
            onClick={() => {
              setFinalFilteredCourseIds(filteredCourseIds);
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
          selectedCourseIds={filteredCourseIds}
          onSelectedCourseIdsChange={(courseIds) => {
            setFilteredCourseIds(courseIds);
          }}
        />
      </Drawer>
    </div>
  );
}
