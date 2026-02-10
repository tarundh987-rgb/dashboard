import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/auth",
    credentials: "include",
  }),
  endpoints: (builder) => ({
    register: builder.mutation<any, any>({
      query: (data) => ({
        url: "/register",
        method: "POST",
        body: data,
      }),
    }),

    login: builder.mutation<any, any>({
      query: (data) => ({
        url: "/login",
        method: "POST",
        body: data,
      }),
    }),

    me: builder.query<any, void>({
      query: () => "/me",
    }),

    deleteAccount: builder.mutation<void, void>({
      query: () => ({
        url: "/delete-account",
        method: "DELETE",
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    }),

    update: builder.mutation<any, any>({
      query: (data) => ({
        url: "/update",
        method: "PATCH",
        body: data,
      }),
    }),

    updatePassword: builder.mutation<any, any>({
      query: (data) => ({
        url: "/change-password",
        method: "PATCH",
        body: data,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useMeQuery,
  useLogoutMutation,
  useUpdateMutation,
  useUpdatePasswordMutation,
  useDeleteAccountMutation,
} = authApi;
