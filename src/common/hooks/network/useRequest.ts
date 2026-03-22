import defaultAxios from '@/common/services/defaultAxios';
import { RestError, RestResponse } from '@/common/types/Network';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useCallback, useState } from 'react';

type UseRequestState<T> = {
  isPending?: boolean;
  data?: RestResponse<T>;
  error?: RestError;
};

export default function useRequest<T = unknown, D = unknown>() {
  const [state, setState] = useState<UseRequestState<T>>({ isPending: false });

  const request = useCallback(async (config: AxiosRequestConfig<D>) => {
    setState({ isPending: true });

    try {
      const response = (
        await defaultAxios.request<T, AxiosResponse<RestResponse<T>>, D>({
          ...config,
        })
      ).data;

      setState({ isPending: false, data: response });

      return response;
    } catch (e) {
      if (e instanceof RestError) {
        setState({ isPending: false, error: e });
      }

      throw e;
    }
  }, []);

  return {
    request,
    ...state,
  };
}
