import { Attribute } from '@/common/types/Course.types';
import { Card, Rate } from 'antd';

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
    <div className='flex flex-col gap-3'>
      {attributes.map((attribute) => (
        <Card key={attribute.id} size='small' style={{ background: 'transparent' }}>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
            <div className='text-[15px] font-semibold text-[#1C1917]'>{attribute.value}</div>
            <Rate
              className='text-4xl text-amber-500 shrink-0'
              defaultValue={attributeIdToRatingScore[attribute.id] ?? 0}
              onChange={(score) => onRatingChange(attribute.id, score)}
              allowClear
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
