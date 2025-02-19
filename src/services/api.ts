import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError, BaseQueryApi } from '@reduxjs/toolkit/query/react';
import { RootState } from '../app/store';
import { logout, setCredentials } from '../features/auth/authSlice';
import { Mutex } from 'async-mutex';
import { BASE_URL } from '../utils/helpers';

// Create a mutex to handle token refresh
const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Function to refresh token
const refreshToken = async (api: BaseQueryApi) => {
  try {
    const refreshResult = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Include HTTP-only cookies
    });

    if (!refreshResult.ok) throw new Error('Token refresh failed');

    const data = await refreshResult.json();
    
    if (data?.token) {
      api.dispatch(setCredentials({ token: data.token, user: data.user }));
      return data.token;
    }
  } catch (error) {
    console.error('Failed to refresh token:', error);
  }
  return null;
};

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const newToken = await refreshToken(api);
        if (newToken) {
          if (typeof args !== 'string') {
            result = await baseQuery(
              {
                ...args,
                headers: { ...args.headers, Authorization: `Bearer ${newToken}` },
              },
              api,
              extraOptions
            );
          }
        } else {
          api.dispatch(logout());
          window.location.href = '/signin';
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
});
