import axios, { AxiosResponse } from "axios";
import QueryString from "qs";
import { LocalStorageKey } from "../constants/LocalStorageKey";
import { GlobalErrorCode } from "../types/GlobalErrorCode";
import { RestError } from "../types/Network";

const defaultAxios = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  validateStatus: () => true,
  paramsSerializer: (params) =>
    QueryString.stringify(params, { arrayFormat: "repeat", allowDots: true }),
});

defaultAxios.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem(LocalStorageKey.ACCESS_TOKEN);

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

defaultAxios.interceptors.response.use(
  (
    response: AxiosResponse<
      { ok: true; data: unknown } | { ok: false; errorCode: GlobalErrorCode; errorData?: unknown }
    >,
  ) => {
    if (!response.data.ok) {
      throw new RestError(response.data.errorCode, response.data.errorData);
    }
    return response;
  },
  (error) => {
    throw error;
  },
);

export default defaultAxios;
