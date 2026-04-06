import { Rate } from 'antd';
import { useAttributeValueToLabel } from '../../RecommendationPage/FSRecommendation/hooks/useAttributeValueToLabel';

type Props = {
  attributeValues: string[];
  attributeValueToRatingScore: Record<string, number>;
  onRatingChange: (attributeValue: string, score: number) => void;
};

export default function AttributeRating({
  attributeValues,
  attributeValueToRatingScore,
  onRatingChange,
}: Props) {
  const attributeValueToLabel = useAttributeValueToLabel();

  return (
    <div className='flex flex-col gap-5'>
      {attributeValues.map((attributeValue) => {
        return (
          <div>
            <div className='text-gray-600 font-semibold'>
              {attributeValueToLabel(attributeValue)}
            </div>
            <div className='my-3'></div>
            <Rate
              className='text-5xl'
              defaultValue={attributeValueToRatingScore[attributeValue] ?? 0}
              onChange={(score) => {
                onRatingChange(attributeValue, score);
              }}
              allowClear
            />
          </div>
        );
      })}
    </div>
  );
}
