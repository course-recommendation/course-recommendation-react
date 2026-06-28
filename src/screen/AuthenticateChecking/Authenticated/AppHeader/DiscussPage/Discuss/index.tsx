import useGet from '@/common/hooks/network/useGet';
import useRequest from '@/common/hooks/network/useRequest';
import { Algorithm } from '@/common/types/Course.types';
import { FindPostDetailsRequest, PostDetail } from '@/common/types/Discuss.types';
import { User } from '@/common/types/User.types';
import { FilterOutlined } from '@ant-design/icons';
import { Button, Drawer } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import DiscussFilter from './components/DiscussFilter';
import DiscussMainArea from './DiscussMainArea';

type Props = {
  algorithm: Algorithm;
};

export default function Discuss({ algorithm }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filteredCourseCodes, setFilteredCourseCodes] = useState<string[]>([]);
  const [finalFilteredCourseCodes, setFinalFilteredCourseCodes] = useState<string[]>([]);
  const [filteredAuthorIds, setFilteredAuthorIds] = useState<string[]>([]);
  const [finalFilteredAuthorIds, setFinalFilteredAuthorIds] = useState<string[]>([]);
  const [authorUsersMap, setAuthorUsersMap] = useState<Record<string, User>>({});
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);

  const { request: fetchUser } = useRequest<User>();
  const initialLoadDone = useRef(false);

  const {
    data: postDetailsResponse,
    isPending: postDetailsPending,
    refetch: refetchPosts,
  } = useGet<PostDetail[]>(`/posts`, {
    params: {
      sort: ['createdAt,desc'],
      algorithm,
      courseIdsRequest: {
        fetchAll: finalFilteredCourseCodes.length === 0,
        data: finalFilteredCourseCodes,
      },
      ...(finalFilteredAuthorIds.length > 0 && {
        authorIdsRequest: {
          fetchAll: false,
          data: finalFilteredAuthorIds,
        },
      }),
    } as FindPostDetailsRequest,
  });

  // Load from URL on mount only
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const courseCodesParam = searchParams.get('courseCodes');
    if (courseCodesParam) {
      const codes = courseCodesParam.split(',');
      setFilteredCourseCodes(codes);
      setFinalFilteredCourseCodes(codes);
    }

    const authorIdsParam = searchParams.get('authorIds');
    if (authorIdsParam) {
      const ids = authorIdsParam.split(',').filter(Boolean);
      setFilteredAuthorIds(ids);
      setFinalFilteredAuthorIds(ids);
      // Fetch user info for each author ID to populate the display cache
      ids.forEach((id) => {
        fetchUser({ url: `/users/${id}` })
          .then((res) => {
            if (res?.data) {
              setAuthorUsersMap((prev) => ({ ...prev, [id]: res.data! }));
            }
          })
          .catch(() => {});
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state to URL params
  useEffect(() => {
    const newParams: Record<string, string> = {};
    if (finalFilteredCourseCodes.length > 0) {
      newParams.courseCodes = finalFilteredCourseCodes.join(',');
    }
    if (finalFilteredAuthorIds.length > 0) {
      newParams.authorIds = finalFilteredAuthorIds.join(',');
    }
    setSearchParams(newParams, { replace: true });
  }, [finalFilteredCourseCodes, finalFilteredAuthorIds, setSearchParams]);

  // React to external URL changes (e.g. from UserPopoverCard filter button)
  useEffect(() => {
    if (!initialLoadDone.current) return;
    const authorIdsParam = searchParams.get('authorIds');
    const ids = authorIdsParam ? authorIdsParam.split(',').filter(Boolean) : [];
    const currentIds = finalFilteredAuthorIds;

    const same =
      ids.length === currentIds.length && ids.every((id) => currentIds.includes(id));
    if (!same) {
      setFilteredAuthorIds(ids);
      setFinalFilteredAuthorIds(ids);
      ids.forEach((id) => {
        if (!authorUsersMap[id]) {
          fetchUser({ url: `/users/${id}` })
            .then((res) => {
              if (res?.data) {
                setAuthorUsersMap((prev) => ({ ...prev, [id]: res.data! }));
              }
            })
            .catch(() => {});
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const resolveNumberOfFiltersText = () => {
    const filterCount = finalFilteredCourseCodes.length + finalFilteredAuthorIds.length;
    if (filterCount === 0) return '';
    return ` (${filterCount})`;
  };

  const handleAuthorUsersCacheUpdate = (user: User) => {
    setAuthorUsersMap((prev) => ({ ...prev, [user.id]: user }));
  };

  return (
    <div className='grid grid-cols-1 gap-5 md:grid-cols-[4fr_2fr] md:gap-6'>
      {/* Main feed */}
      <div className='min-w-0 self-start'>
        <DiscussMainArea
          algorithm={algorithm}
          postDetails={postDetailsResponse?.data}
          postDetailsPending={postDetailsPending}
          refetchPosts={refetchPosts}
          filterSection={
            <Button
              type='primary'
              className='md:hidden rounded-xl'
              icon={<FilterOutlined />}
              size='large'
              onClick={() => setOpenFilterDrawer(true)}
            >
              {`Bộ lọc${resolveNumberOfFiltersText()}`}
            </Button>
          }
        />
      </div>

      {/* Filter sidebar */}
      <div className='hidden md:block'>
        <DiscussFilter
          algorithm={algorithm}
          selectedCourseIds={filteredCourseCodes}
          onSelectedCourseIdsChange={(courseIds) => {
            setFilteredCourseCodes(courseIds);
            setFinalFilteredCourseCodes(courseIds);
          }}
          selectedAuthorIds={filteredAuthorIds}
          onSelectedAuthorIdsChange={(authorIds) => {
            setFilteredAuthorIds(authorIds);
            setFinalFilteredAuthorIds(authorIds);
          }}
          authorUsersMap={authorUsersMap}
          onAuthorUsersCacheUpdate={handleAuthorUsersCacheUpdate}
        />
      </div>

      {/* Mobile filter drawer */}
      <Drawer
        open={openFilterDrawer}
        onClose={() => {
          setOpenFilterDrawer(false);
          setFilteredCourseCodes(finalFilteredCourseCodes);
          setFilteredAuthorIds(finalFilteredAuthorIds);
        }}
        placement='bottom'
        size='large'
        className='md:hidden'
        styles={{ body: { background: '#f9fafb', paddingTop: 12 } }}
        title='Bộ lọc thảo luận'
        extra={
          <Button
            type='primary'
            onClick={() => {
              setFinalFilteredCourseCodes(filteredCourseCodes);
              setFinalFilteredAuthorIds(filteredAuthorIds);
              setOpenFilterDrawer(false);
            }}
          >
            Áp dụng
          </Button>
        }
      >
        <DiscussFilter
          algorithm={algorithm}
          selectedCourseIds={filteredCourseCodes}
          onSelectedCourseIdsChange={(courseIds) => {
            setFilteredCourseCodes(courseIds);
          }}
          selectedAuthorIds={filteredAuthorIds}
          onSelectedAuthorIdsChange={(authorIds) => {
            setFilteredAuthorIds(authorIds);
          }}
          authorUsersMap={authorUsersMap}
          onAuthorUsersCacheUpdate={handleAuthorUsersCacheUpdate}
        />
      </Drawer>
    </div>
  );
}
