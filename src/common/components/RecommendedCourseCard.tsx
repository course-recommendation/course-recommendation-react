import PostCard from '@/screen/AuthenticateChecking/Authenticated/AppHeader/DiscussPage/Discuss/DiscussMainArea/PostCard';
import { MoreOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Card, Drawer, Dropdown, Empty, Progress, Skeleton, Tooltip } from 'antd';
import { ReactNode, useState } from 'react';
import { Link } from 'react-router';
import { useAlgorithmContext } from '../context/AlgorithmContext';
import useGet from '../hooks/network/useGet';
import { CourseDetail } from '../types/Course.types';
import { FindPostDetailsRequest, PostDetail } from '../types/Discuss.types';
import { PageResponse } from '../types/Network';
import PoleLabels from './PoleLabels';

export type ExplanationScore = {
  label: string;
  score: number;
  /** Điểm mục tiêu người dùng đã chọn cho tiêu chí này (thang 1–5). */
  preferenceScore?: number;
  lowLabel?: string;
  highLabel?: string;
};

// Thang đo hai cực: điểm thấp/cao chỉ thể hiện thiên hướng, không phải tệ/tốt.
// Màu thanh thể hiện khoảng cách tới sở thích: trùng khớp → xanh lục,
// lệch vừa → cam, càng xa điểm mục tiêu → càng đỏ.
const SCORE_COLOR = '#4338CA'; // indigo-700 — dùng khi không có sở thích để so
const SCORE_TRAIL = '#E7E5E4'; // stone-200 — trail trung tính cho mọi màu thanh
const MAX_SCORE_DISTANCE = 4; // thang 1–5 nên chênh lệch tối đa là 4

// Các mốc màu theo khoảng cách chuẩn hoá [0..1]; giữa hai mốc thì nội suy RGB.
const DISTANCE_COLOR_STOPS: [number, string][] = [
  [0, '#059669'], // emerald-600 — trùng khớp sở thích
  [0.5, '#D97706'], // amber-600 — lệch vừa
  [1, '#DC2626'], // red-600 — xa sở thích nhất
];

function mixHexColors(from: string, to: string, t: number) {
  const f = parseInt(from.slice(1), 16);
  const g = parseInt(to.slice(1), 16);
  const channel = (shift: number) => {
    const a = (f >> shift) & 0xff;
    const b = (g >> shift) & 0xff;
    return Math.round(a + (b - a) * t);
  };
  return `#${((channel(16) << 16) | (channel(8) << 8) | channel(0)).toString(16).padStart(6, '0')}`;
}

function getScoreColor(score: number, preferenceScore?: number) {
  if (preferenceScore == null) {
    return SCORE_COLOR;
  }
  const distance =
    Math.min(Math.abs(score - preferenceScore), MAX_SCORE_DISTANCE) / MAX_SCORE_DISTANCE;
  for (let i = 1; i < DISTANCE_COLOR_STOPS.length; i++) {
    const [fromDistance, fromColor] = DISTANCE_COLOR_STOPS[i - 1];
    const [toDistance, toColor] = DISTANCE_COLOR_STOPS[i];
    if (distance <= toDistance) {
      return mixHexColors(
        fromColor,
        toColor,
        (distance - fromDistance) / (toDistance - fromDistance),
      );
    }
  }
  return DISTANCE_COLOR_STOPS[DISTANCE_COLOR_STOPS.length - 1][1];
}

type Props = {
  courseDetail: CourseDetail;
  extra?: ReactNode;
  courseName?: ReactNode;
  topLeftBadge?: ReactNode;
  topRightBadge?: ReactNode;
  index?: number;
  rank?: number;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  explanationScores?: ExplanationScore[];
  onMarkNotInterested?: () => void;
};

function CourseDiscussionDrawerContent({ courseCode }: { courseCode: string }) {
  const algorithm = useAlgorithmContext();
  const { data: postDetailsResponse, isPending } = useGet<PageResponse<PostDetail>>(`/posts`, {
    params: {
      sort: ['createdAt,desc'],
      algorithm,
      courseIdsRequest: { fetchAll: false, data: [courseCode] },
    } as FindPostDetailsRequest,
  });

  if (isPending) {
    return <Skeleton active paragraph={{ rows: 4 }} />;
  }

  if (!postDetailsResponse?.data?.content?.length) {
    return <Empty description='Chưa có bài thảo luận nào về môn học này' />;
  }

  return (
    <div className='flex flex-col gap-4'>
      {postDetailsResponse.data.content.map((postDetail) => (
        <PostCard key={postDetail.post.id} postDetail={postDetail} algorithm={algorithm} />
      ))}
    </div>
  );
}

const SCORE_MAX = 5;
const PAGE_SIZE = 6;

export default function RecommendedCourseCard({
  courseDetail,
  extra,
  courseName,
  topLeftBadge,
  topRightBadge,
  index,
  rank,
  onClick,
  explanationScores,
  onMarkNotInterested,
}: Props) {
  const hasExplanation = explanationScores && explanationScores.length > 0;
  const sortedScores =
    explanationScores
      ?.slice()
      .sort((a, b) => a.label.localeCompare(b.label, 'vi', { sensitivity: 'base' })) ?? [];
  const [expanded, setExpanded] = useState(false);
  const [discussionOpen, setDiscussionOpen] = useState(false);
  const visibleScores = expanded ? sortedScores : sortedScores.slice(0, PAGE_SIZE);
  const hiddenCount = sortedScores.length - PAGE_SIZE;

  return (
    <>
      <Link
        to={
          rank != null
            ? `/courses/${courseDetail.course.code}?rank=${rank}`
            : `/courses/${courseDetail.course.code}`
        }
        className='block'
        onClick={(e) => {
          onClick?.(e);
        }}
      >
        <Card
          variant='borderless'
          className='card-course card-enter relative overflow-hidden group bg-white border border-stone-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all duration-200'
          style={{ '--card-i': index ?? 0 } as React.CSSProperties}
        >
          {topLeftBadge}

          {/* Row 1: thumbnail + course info */}
          <div className='flex flex-col md:flex-row items-center gap-4 md:gap-5'>
            <div className='w-full md:w-60 aspect-video overflow-hidden rounded-xl shrink-0 bg-stone-100'>
              <img
                src={`https://picsum.photos/seed/${courseDetail.course.code}/1600/900`}
                className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
              />
            </div>

            <div className='flex flex-col gap-3 flex-1 min-w-0'>
              <div className='flex items-center gap-2'>
                <div className='text-[18px] font-semibold text-[#1C1917] line-clamp-2 md:line-clamp-1 leading-snug flex-1 min-w-0'>
                  {courseName ?? courseDetail.course.name}
                </div>
                {(topRightBadge || onMarkNotInterested) && (
                  <div className='flex items-center gap-1.5 shrink-0'>
                    {topRightBadge}
                    {onMarkNotInterested && (
                      <Dropdown
                        trigger={['click']}
                        menu={{
                          items: [{ key: 'not-interested', label: 'Không quan tâm' }],
                          onClick: ({ domEvent }) => {
                            domEvent.preventDefault();
                            domEvent.stopPropagation();
                            onMarkNotInterested();
                          },
                        }}
                      >
                        <Button
                          shape='circle'
                          icon={<MoreOutlined style={{ fontSize: 20 }} rotate={90} />}
                          aria-label='Tùy chọn khác'
                          className=' -my-2'
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        />
                      </Dropdown>
                    )}
                  </div>
                )}
              </div>
              <div className='line-clamp-3 md:line-clamp-2 text-gray-500 text-[15px] leading-[1.7]'>
                {courseDetail.course.description}
              </div>
              {extra}
            </div>
          </div>

          {/* Row 2: explanation scores (full width strip) */}
          {hasExplanation && (
            <div className='mt-4 pt-4 border-t border-stone-200'>
              <p className='text-xs text-gray-500 mb-2 flex items-center gap-1.5'>
                Cảm nhận của các sinh viên khác về các tiêu chí
                <Tooltip
                  color='#fff'
                  overlayInnerStyle={{ color: '#1C1917' }}
                  title={
                    <div className='py-0.5' style={{ width: 180 }}>
                      <div
                        className='h-1.5 rounded-full'
                        style={{ background: 'linear-gradient(to right, #DC2626, #D97706, #059669)' }}
                      />
                      <div className='flex justify-between text-[11px] text-gray-500 mt-1'>
                        <span>Lệch xa sở thích</span>
                        <span>Gần sở thích</span>
                      </div>
                    </div>
                  }
                >
                  <QuestionCircleOutlined className='text-gray-400 hover:text-indigo-600 cursor-help transition-colors duration-150' />
                </Tooltip>
              </p>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4'>
                {visibleScores.map(({ label, score, preferenceScore, lowLabel, highLabel }) => {
                  const scoreColor = getScoreColor(score, preferenceScore);
                  return (
                    <div key={label}>
                      <div className='flex justify-between items-center -mb-1'>
                        <Tooltip title={label} placement='top'>
                          <span className='text-xs text-gray-600 truncate flex-1 cursor-default'>
                            {label}
                          </span>
                        </Tooltip>
                        <span
                          className='text-xs font-semibold ml-2 shrink-0'
                          style={{ color: scoreColor }}
                        >
                          {score.toFixed(1)}/5
                        </span>
                      </div>
                      <Progress
                        showInfo={false}
                        percent={(score / SCORE_MAX) * 100}
                        strokeLinecap='round'
                        strokeColor={scoreColor}
                        trailColor={SCORE_TRAIL}
                        size='small'
                      />
                      <PoleLabels lowLabel={lowLabel} highLabel={highLabel} className='mt-0.5' />
                    </div>
                  );
                })}
              </div>
              <div className='flex items-center gap-3 mt-2'>
                {hiddenCount > 0 && (
                  <Button
                    type='text'
                    size='small'
                    className='text-indigo-600 text-xs'
                    onClick={(e) => {
                      e.preventDefault();
                      setExpanded(!expanded);
                    }}
                  >
                    {expanded
                      ? 'Thu gọn ←'
                      : `Xem tất cả tiêu chí (${hiddenCount} tiêu chí khác) →`}
                  </Button>
                )}
                {/*<Button*/}
                {/*  type='text'*/}
                {/*  size='small'*/}
                {/*  icon={<CommentOutlined />}*/}
                {/*  className='text-indigo-600 text-xs ml-auto'*/}
                {/*  onClick={(e) => { e.preventDefault(); setDiscussionOpen(true); }}*/}
                {/*>*/}
                {/*  Xem thảo luận*/}
                {/*</Button>*/}
              </div>
            </div>
          )}
        </Card>
      </Link>

      <Drawer
        open={discussionOpen}
        onClose={() => setDiscussionOpen(false)}
        placement='right'
        size='large'
        title={`Thảo luận — ${courseDetail.course.name}`}
        destroyOnClose
      >
        {discussionOpen && <CourseDiscussionDrawerContent courseCode={courseDetail.course.code} />}
      </Drawer>
    </>
  );
}
