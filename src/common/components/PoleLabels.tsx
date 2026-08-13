import { Tooltip } from 'antd';
import classNames from 'classnames';

type Props = {
  lowLabel?: string;
  highLabel?: string;
  className?: string;
};

/**
 * Hiển thị 2 nhãn cực của thang đo hai cực: nhãn thấp bên trái (phía điểm 1),
 * nhãn cao bên phải (phía điểm 5), mũi tên hai chiều ở giữa.
 * Nhãn dài sẽ bị cắt và xem đầy đủ qua tooltip.
 */
export default function PoleLabels({ lowLabel, highLabel, className }: Props) {
  if (!lowLabel && !highLabel) {
    return null;
  }

  return (
    <div
      className={classNames(
        'flex items-center gap-1 text-[11px]  text-gray-500 leading-tight',
        className,
      )}
    >
      <Tooltip title={lowLabel} placement='top'>
        <span className='flex-1 min-w-0 truncate text-left cursor-default'>{lowLabel}</span>
      </Tooltip>
      {/* Glyph ⟷ vẽ thấp trong em-box nên đẩy nhẹ lên cho cân giữa theo chiều đứng */}
      <span className='shrink-0 text-gray-500 select-none leading-none relative -top-[2px]'>⟷</span>
      <Tooltip title={highLabel} placement='top'>
        <span className='flex-1 min-w-0 truncate text-right cursor-default'>{highLabel}</span>
      </Tooltip>
    </div>
  );
}
