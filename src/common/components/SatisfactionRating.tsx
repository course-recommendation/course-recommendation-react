import { Rate } from 'antd';
import classNames from 'classnames';

/** Nhãn tooltip cho từng mức sao, index 0 ứng với 1 sao. */
const STAR_TOOLTIPS = [
  'Rất không hài lòng',
  'Không hài lòng',
  'Bình thường',
  'Hài lòng',
  'Rất hài lòng',
];

type Props = {
  value?: number;
  onChange?: (score: number) => void;
  className?: string;
};

/**
 * Đánh giá mức độ hài lòng tổng thể với một môn học, thang 1-5 sao.
 *
 * Khác với các thuộc tính (thang hai cực, không đầu nào tốt hơn), đây là thang có chiều tốt/xấu rõ
 * ràng, và là điểm duy nhất thể hiện "thích hay không thích". TriRank dùng chính điểm này làm ma
 * trận user-item R.
 */
export default function SatisfactionRating({ value, onChange, className }: Props) {
  return (
    <div className={classNames('flex flex-col gap-1.5', className)}>
      <div className='flex items-center gap-3'>
        <Rate
          value={value ?? 0}
          onChange={onChange}
          tooltips={STAR_TOOLTIPS}
          // Không truyền `size`: cỡ sao được đặt bằng token Rate.starSize trong antdThemeConfig.
          // Nếu truyền size='large' thì class .ant-rate-large sẽ ăn starSizeLG và ghi đè token đó
          // (cùng độ ưu tiên, thắng nhờ thứ tự trong CSS sinh ra).
          //
          // Cho phép bỏ chọn: bấm lại đúng số sao đang chọn sẽ trả về 0, tức xoá điểm đã lưu.
          allowClear
        />
        <span className='text-[13px] text-gray-500'>
          {value ? STAR_TOOLTIPS[value - 1] : 'Chưa đánh giá'}
        </span>
      </div>
    </div>
  );
}
