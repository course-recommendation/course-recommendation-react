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
    <div className='flex flex-col gap-5'>
      {attributes.map((attribute) => {
        return (
          <div key={attribute.id}>
            <div className='text-gray-600 font-semibold'>{attribute.value}</div>
            <div className='my-3'></div>
            <Rate
              className='text-5xl'
              defaultValue={attributeIdToRatingScore[attribute.id] ?? 0}
              onChange={(score) => {
                onRatingChange(attribute.id, score);
              }}
              allowClear
            />
          </div>
        );
      })}
    </div>
  );
}
