import PoleLabels from '@/common/components/PoleLabels';
import RatingBox from '@/common/components/RatingBox';
import { Attribute } from '@/common/types/Course.types';
import { Card } from 'antd';

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
          <div className='flex flex-col gap-2'>
            <div className='text-[15px] font-semibold text-[#1C1917]'>{attribute.value}</div>
            <div className='flex flex-col gap-1 w-fit'>
              <RatingBox
                highlightSmallerValues
                defaultValue={attributeIdToRatingScore[attribute.id] ?? 0}
                onChange={(score) => onRatingChange(attribute.id, score)}
              />
              {/* Nhãn hai cực căn theo bề rộng dãy ô điểm: cực thấp dưới ô 1, cực cao dưới ô 5 */}
              <PoleLabels
                lowLabel={attribute.lowLabel}
                highLabel={attribute.highLabel}
                className='w-[184px]'
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
