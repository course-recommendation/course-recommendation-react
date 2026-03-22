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
    <div>
      {attributeValues.map((attributeValue) => {
        return (
          <div>
            <div>{attributeValueToLabel(attributeValue)}</div>
            <Rate
              defaultValue={attributeValueToRatingScore[attributeValue] ?? 0}
              onChange={(score) => {
                onRatingChange(attributeValue, score);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
