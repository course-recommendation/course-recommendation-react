import useRequest from '@/common/hooks/network/useRequest';
import defaultAxios from '@/common/services/defaultAxios';
import { Algorithm } from '@/common/types/Course.types';
import { FindPostDetailsRequest, PostDetail } from '@/common/types/Discuss.types';
import { PageResponse, RestResponse } from '@/common/types/Network';
import { User } from '@/common/types/User.types';
import { FilterOutlined } from '@ant-design/icons';
import { Button, Drawer } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import DiscussFilter from './components/DiscussFilter';
import DiscussMainArea from './DiscussMainArea';

type Props = {
  algorithm: Algorithm;
};

const POSTS_PAGE_SIZE = 10;

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

  const [postDetails, setPostDetails] = useState<PostDetail[]>([]);
  const [postDetailsPending, setPostDetailsPending] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const nextPageRef = useRef(0);
  const requestSeqRef = useRef(0);

  const loadPosts = useCallback(
    async (page: number, replace: boolean) => {
      const requestSeq = ++requestSeqRef.current;
      if (replace) setPostDetailsPending(true);
      else setIsFetchingNextPage(true);

      try {
        const response = await defaultAxios.get<RestResponse<PageResponse<PostDetail>>>('/posts', {
          params: {
            page,
            size: POSTS_PAGE_SIZE,
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
          } as FindPostDetailsRequest & { page: number; size: number },
        });

        if (requestSeq !== requestSeqRef.current) return;

        const pageData = response.data.data;
        setPostDetails((prev) => (replace ? pageData.content : [...prev, ...pageData.content]));
        setHasNextPage(pageData.page + 1 < pageData.totalPages);
        nextPageRef.current = pageData.page + 1;
      } finally {
        if (requestSeq === requestSeqRef.current) {
          setPostDetailsPending(false);
          setIsFetchingNextPage(false);
        }
      }
    },
    [algorithm, finalFilteredCourseCodes, finalFilteredAuthorIds],
  );

  useEffect(() => {
    loadPosts(0, true);
  }, [loadPosts]);

  const fetchNextPage = useCallback(() => {
    if (postDetailsPending || isFetchingNextPage || !hasNextPage) return;
    loadPosts(nextPageRef.current, false);
  }, [postDetailsPending, isFetchingNextPage, hasNextPage, loadPosts]);

  const refetchPosts = useCallback(() => loadPosts(0, true), [loadPosts]);

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

    const same = ids.length === currentIds.length && ids.every((id) => currentIds.includes(id));
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
          postDetails={postDetails}
          postDetailsPending={postDetailsPending}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
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
