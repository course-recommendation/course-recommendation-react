import RatingBox from '@/common/components/RatingBox';
import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import useGet from '@/common/hooks/network/useGet';
import useRequest from '@/common/hooks/network/useRequest';
import { Algorithm } from '@/common/types/Course.types';
import { FSRecommendationRequest, FSRecommendationResult } from '@/common/types/FS.types';
import { Button, Card, Typography } from 'antd';
import useApp from 'antd/es/app/useApp';
import { useState } from 'react';
import { useAttributeValueToLabel } from '../RecommendationPage/FSRecommendation/hooks/useAttributeValueToLabel';

export default function SurveyPage() {
  const { message } = useApp();
  const algorithm = useAlgorithmContext();
  const attributeValueToLabel = useAttributeValueToLabel();

  const { data: attributesResponse, isPending: attributesPending } = useGet<string[]>(
    `/attributes`,
    {
      params: {
        algorithm,
      } as { algorithm: Algorithm },
    },
  );

  const [attributeToTargetSentimentScore, setAttributeToTargetSentimentScore] = useState<
    Record<string, number>
  >({});

  const { request: getFSRecommendation, isPending: creatingRecommendation } = useRequest<
    FSRecommendationResult,
    FSRecommendationRequest
  >();

  const { request: completeSurvey, isPending: completingSurvey } = useRequest<void, undefined>();

  const handleDone = async () => {
    if (!attributesResponse?.data) {
      return;
    }

    try {
      await getFSRecommendation({
        method: 'post',
        url: '/fs/recommendation',
        data: {
          attributeToPreferenceConfigure: Object.fromEntries(
            attributesResponse.data.map((attribute) => [
              attribute,
              {
                targetSentimentScore: attributeToTargetSentimentScore[attribute] ?? 3,
              },
            ]),
          ),
          filterCoursesOptions: [],
          customFilteredCourseCodes: [],
        },
      });

      await completeSurvey({
        method: 'put',
        url: '/me/complete-survey',
      });

      window.location.href = '/';
    } catch {
      message.error('Không thể hoàn tất khảo sát. Vui lòng thử lại.');
    }
  };

  return (
    <div className='max-w-4xl mx-auto w-full'>
      <Card className='shadow-lg border border-blue-100' bodyStyle={{ padding: 16 }}>
        <div className='space-y-5'>
          <div>
            <Typography.Title level={2} className='m-0'>
              Khảo sát sở thích môn học
            </Typography.Title>
            <Typography.Text className='text-gray-600 block mt-2'>
              Trước khi xem gợi ý, hãy cho hệ thống biết mức độ bạn mong muốn ở từng tiêu chí. Khảo
              sát này chỉ mất khoảng 1 phút và giúp kết quả gợi ý sát với nhu cầu của bạn hơn.
            </Typography.Text>
          </div>

          <div className='rounded-xl border border-blue-200 bg-blue-50 px-4 py-3'>
            <Typography.Text className='text-blue-900'>
              Thang điểm từ 1 đến 5: điểm càng cao nghĩa là bạn càng ưu tiên tiêu chí đó có cảm nhận
              tích cực hơn trong môn học được gợi ý.
            </Typography.Text>
          </div>

          {attributesPending ? (
            <Typography.Text>Đang tải tiêu chí...</Typography.Text>
          ) : (
            <div className='space-y-3'>
              {attributesResponse?.data.map((attribute) => {
                return (
                  <div key={attribute} className='rounded-xl border border-gray-200 px-4 py-3'>
                    <Typography.Text strong className='text-gray-700 block mb-2'>
                      {attributeValueToLabel(attribute)}
                    </Typography.Text>
                    <RatingBox
                      highlightSmallerValues
                      value={attributeToTargetSentimentScore[attribute] ?? 3}
                      onChange={(score) => {
                        setAttributeToTargetSentimentScore((prev) => ({
                          ...prev,
                          [attribute]: score,
                        }));
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          <div className='flex justify-end'>
            <Button
              type='primary'
              size='large'
              className='w-full md:w-auto'
              loading={creatingRecommendation || completingSurvey}
              onClick={handleDone}
            >
              Hoàn tất và xem gợi ý
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
