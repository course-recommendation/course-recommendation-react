import { Attribute } from '@/common/types/Course.types';
import { Rate } from 'antd';

type Props = {
  attributes: Attribute[];
  attributeIdToRatingScore: Record<number, number>;
  onRatingChange: (attributeId: number, score: number) => void;
};

export default function AttributeRating({
  attributes,
  attributeIdToRatingScore,
  onRatingChange,
}: Props) {
  return (
    <div className='flex flex-col gap-4'>
      {attributes.map((attribute) => (
        <div
          key={attribute.id}
          className='bg-[#FAF9F7] rounded-xl border border-stone-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}
        >
          <div className='text-[15px] font-semibold text-[#1C1917]'>{attribute.value}</div>
          <Rate
            className='text-4xl text-amber-500 shrink-0'
            defaultValue={attributeIdToRatingScore[attribute.id] ?? 0}
            onChange={(score) => onRatingChange(attribute.id, score)}
            allowClear
          />
        </div>
      ))}
    </div>
  );
}
