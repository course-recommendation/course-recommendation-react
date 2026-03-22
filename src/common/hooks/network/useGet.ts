import defaultAxios from '@/common/services/defaultAxios';
import { RestError, RestResponse } from '@/common/types/Network';
import { useDeepCompareEffect } from 'ahooks';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useCallback, useState } from 'react';

type UseGetState<T> = {
  isPending: boolean;
  data?: RestResponse<T>;
  error?: RestError;
  isRefetching: boolean;
};

export default function useGet<T, D = unknown>(url: string, config?: AxiosRequestConfig<D>) {
  const [state, setState] = useState<UseGetState<T>>({ isPending: true, isRefetching: false });

  useDeepCompareEffect(() => {
    let ignore = false;

    setState({ isPending: true, isRefetching: false });

    (async () => {
      try {
        const response = (
          await defaultAxios.request<T, AxiosResponse<RestResponse<T>>, D>({
            url,
            ...config,
          })
        ).data;

        if (!ignore) {
          setState({ isPending: false, data: response, isRefetching: false });
        }

        return response;
      } catch (e) {
        if (e instanceof RestError) {
          if (!ignore) {
            setState({ isPending: false, error: e, isRefetching: false });
          }
        }

        throw e;
      }
    })();

    return () => {
      ignore = true;
    };
  }, [config, url]);

  const refetch = useCallback(async () => {
    setState((prev) => ({ ...prev, isRefetching: true }));

    try {
      const response = (
        await defaultAxios.request<T, AxiosResponse<RestResponse<T>>, D>({
          url,
          ...config,
        })
      ).data;

      setState({ isPending: false, isRefetching: false, data: response });

      return response;
    } catch (e) {
      if (e instanceof RestError) {
        setState((prev) => ({ data: prev.data, isPending: false, error: e, isRefetching: false }));
      }

      throw e;
    }
  }, [config, url]);

  return {
    ...state,
    refetch,
  };
}
