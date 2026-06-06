import RatingBox from '@/common/components/RatingBox';
import { PAGE_SIZE_FOR_ALL_ITEMS } from '@/common/constants/Recommendation.constant';
import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import useGet from '@/common/hooks/network/useGet';
import useRequest from '@/common/hooks/network/useRequest';
import { Algorithm, Attribute } from '@/common/types/Course.types';
import { FSRecommendationRequest, FSRecommendationResult } from '@/common/types/FS.types';
import {
  TriRankRecommendationRequest,
  TriRankRecommendationResult,
} from '@/common/types/TriRank.types';
import { Button, Skeleton } from 'antd';
import useApp from 'antd/es/app/useApp';
import { useState } from 'react';

export default function SurveyPage() {
  const { message } = useApp();
  const algorithm = useAlgorithmContext();

  const { data: attributesResponse, isPending: attributesPending } = useGet<Attribute[]>(
    `/attributes`,
    { params: { algorithm } as { algorithm: Algorithm } },
  );

  const [attributeToScore, setAttributeToScore] = useState<Record<string, number>>({});

  const { request: getFSRecommendation, isPending: creatingFSRecommendation } = useRequest<
    FSRecommendationResult,
    FSRecommendationRequest
  >();
  const { request: getTriRankRecommendation, isPending: creatingTriRankRecommendation } =
    useRequest<TriRankRecommendationResult, TriRankRecommendationRequest>();
  const { request: completeSurvey, isPending: completingSurvey } = useRequest<void, undefined>();

  const handleDone = async () => {
    if (!attributesResponse?.data) return;

    try {
      if (algorithm === Algorithm.FS) {
        await getFSRecommendation({
          method: 'post',
          url: '/fs/recommendation',
          data: {
            attributeToPreferenceConfigure: Object.fromEntries(
              attributesResponse.data.map((attribute) => [
                attribute.value,
                { targetSentimentScore: attributeToScore[attribute.value] ?? 3 },
              ]),
            ),
            filterCoursesOptions: [],
            customFilteredCourseCodes: [],
          },
        });
      } else {
        await getTriRankRecommendation({
          method: 'post',
          url: '/tri-rank/recommendation',
          data: {
            attributeToScore: Object.fromEntries(
              attributesResponse.data.map((attribute) => [
                attribute.value,
                attributeToScore[attribute.value] ?? 3,
              ]),
            ),
            filterCoursesOptions: [],
            customFilteredCourseCodes: [],
          },
        });
      }

      await completeSurvey({
        method: 'put',
        url: '/me/done-first-login',
        params: { algorithm } as { algorithm: Algorithm },
      });

      window.location.href = '/';
    } catch {
      message.error('Không thể hoàn tất khảo sát. Vui lòng thử lại.');
    }
  };

  return (
    <div className='max-w-2xl mx-auto w-full'>
      {/* Heading */}
      <div className='mb-8'>
        <h1
          className='text-[28px] font-semibold text-[#1C1917] leading-tight'
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Khảo sát sở thích môn học
        </h1>
        <div className='mt-2 w-8 h-[3px] rounded-full bg-indigo-700' />
        <p className='mt-4 text-gray-500 text-[15px] leading-[1.7]'>
          Trước khi xem gợi ý, hãy cho hệ thống biết mức độ bạn mong muốn ở từng tiêu chí. Khảo sát
          này chỉ mất khoảng 1 phút và giúp kết quả gợi ý sát với nhu cầu của bạn hơn.
        </p>
      </div>

      {/* Info callout */}
      <div className='mb-6 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-4'>
        <p className='text-indigo-800 text-[14px] leading-[1.7]'>
          Thang điểm từ 1 đến 5: điểm càng cao nghĩa là bạn càng ưu tiên tiêu chí đó có cảm nhận
          tích cực hơn trong môn học được gợi ý.
        </p>
      </div>

      {/* Attribute ratings */}
      {attributesPending ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <div className='flex flex-col gap-4'>
          {attributesResponse?.data.map((attribute) => (
            <div
              key={attribute.id}
              className='bg-[#FAF9F7] rounded-xl border border-stone-200 px-5 py-4'
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}
            >
              <div className='text-[15px] font-semibold text-[#1C1917] mb-3'>{attribute.value}</div>
              <RatingBox
                highlightSmallerValues
                value={attributeToScore[attribute.value] ?? 3}
                onChange={(score) =>
                  setAttributeToScore((prev) => ({ ...prev, [attribute.value]: score }))
                }
              />
            </div>
          ))}
        </div>
      )}

      <div className='mt-8 flex justify-end'>
        <Button
          type='primary'
          size='large'
          className='w-full md:w-auto px-8'
          loading={creatingFSRecommendation || creatingTriRankRecommendation || completingSurvey}
          onClick={handleDone}
        >
          Hoàn tất và xem gợi ý
        </Button>
      </div>
    </div>
  );
}
