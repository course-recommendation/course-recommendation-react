import { Button, Card, Progress } from 'antd';
import { ReactNode } from 'react';
import { Link } from 'react-router';
import { CourseDetail } from '../types/Course.types';
import { scoreColor, scoreTrail } from '../utils/scoreColor';

export type ExplanationScore = {
  label: string;
  score: number;
};

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
  onSeeFullExplanation?: (e: React.MouseEvent) => void;
};

const SCORE_MAX = 5;
const PAGE_SIZE = 5;

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
  onSeeFullExplanation,
}: Props) {
  const hasExplanation = explanationScores && explanationScores.length > 0;
  const sortedScores = explanationScores?.slice().sort((a, b) => a.label.localeCompare(b.label, 'vi', { sensitivity: 'base' })) ?? [];
  const visibleScores = sortedScores.slice(0, PAGE_SIZE);
  const hiddenCount = sortedScores.length - visibleScores.length;

  return (
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
            <div className='flex items-start gap-2'>
              <div className='text-[18px] font-semibold text-[#1C1917] line-clamp-2 md:line-clamp-1 leading-snug flex-1 min-w-0'>
                {courseName ?? courseDetail.course.name}
              </div>
              {topRightBadge && <div className='shrink-0'>{topRightBadge}</div>}
            </div>
            <div className='line-clamp-3 md:line-clamp-2 text-gray-500 text-[15px] leading-[1.7]'>
              {courseDetail.course.description}
            </div>
            {extra}
          </div>
        </div>

        {/* Row 2: explanation scores (full width strip) */}
        {hasExplanation && (
          <div className='mt-4 pt-4 border-t border-stone-200' onClick={(e) => e.preventDefault()}>
            <div className='grid grid-cols-1 md:grid-cols-5 gap-x-6 gap-y-2'>
              {visibleScores.map(({ label, score }) => (
                <div key={label}>
                  <div className='flex justify-between items-center mb-1'>
                    <span className='text-xs text-gray-600 truncate flex-1'>{label}</span>
                    <span
                      className='text-xs font-semibold ml-2 shrink-0'
                      style={{ color: scoreColor(score) }}
                    >
                      {score.toFixed(1)}/5
                    </span>
                  </div>
                  <Progress
                    showInfo={false}
                    percent={(score / SCORE_MAX) * 100}
                    strokeLinecap='round'
                    strokeColor={scoreColor(score)}
                    trailColor={scoreTrail(score)}
                    size='small'
                  />
                </div>
              ))}
            </div>
            <div className='flex items-center gap-3 mt-2'>
              {hiddenCount > 0 && (
                <span className='text-xs text-gray-400'>+{hiddenCount} tiêu chí khác</span>
              )}
              {onSeeFullExplanation && (
                <Button
                  type='link'
                  size='small'
                  className='px-0 text-indigo-600 text-xs'
                  onClick={onSeeFullExplanation}
                >
                  Xem giải thích đầy đủ →
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </Link>
  );
}
