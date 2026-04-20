import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../utils/axiosBaseQuery';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Auth', 'Products', 'Product', 'Cart', 'Orders', 'Reviews', 'Coupons', 'Admin'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({
        url: '/api/auth/login',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Auth', 'Cart'],
    }),
    register: builder.mutation({
      query: (body) => ({
        url: '/api/auth/register',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Auth', 'Cart'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/api/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'Cart', 'Orders'],
    }),
    getMe: builder.query({
      query: () => ({
        url: '/api/auth/me',
      }),
      providesTags: ['Auth'],
    }),
    updateProfile: builder.mutation({
      query: (formData) => ({
        url: '/api/auth/update-profile',
        method: 'PUT',
        data: formData,
      }),
      invalidatesTags: ['Auth'],
    }),
    changePassword: builder.mutation({
      query: (body) => ({
        url: '/api/auth/change-password',
        method: 'PUT',
        data: body,
      }),
    }),
    getAddresses: builder.query({
      query: () => ({
        url: '/api/auth/addresses',
      }),
      providesTags: ['Auth'],
    }),
    addAddress: builder.mutation({
      query: (body) => ({
        url: '/api/auth/addresses',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Auth'],
    }),
    updateAddress: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/auth/addresses/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Auth'],
    }),
    deleteAddress: builder.mutation({
      query: (id) => ({
        url: `/api/auth/addresses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Auth'],
    }),
    toggleWishlistApi: builder.mutation({
      query: (productId) => ({
        url: '/api/auth/wishlist',
        method: 'POST',
        data: { productId },
      }),
      invalidatesTags: ['Auth'],
    }),

    getProducts: builder.query({
      query: (params) => ({
        url: '/api/products',
        params,
      }),
      providesTags: (result) =>
        result?.products?.length
          ? [
              ...result.products.map(({ _id }) => ({ type: 'Products', id: _id })),
              { type: 'Products', id: 'LIST' },
            ]
          : [{ type: 'Products', id: 'LIST' }],
    }),
    getFeaturedProducts: builder.query({
      query: () => ({
        url: '/api/products/featured',
      }),
      providesTags: [{ type: 'Products', id: 'FEATURED' }],
    }),
    getCategories: builder.query({
      query: () => ({
        url: '/api/products/categories',
      }),
    }),
    getBrands: builder.query({
      query: () => ({
        url: '/api/products/brands',
      }),
    }),
    getProductById: builder.query({
      query: (id) => ({
        url: `/api/products/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    adminCreateProduct: builder.mutation({
      query: (formData) => ({
        url: '/api/products',
        method: 'POST',
        data: formData,
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }, { type: 'Products', id: 'FEATURED' }],
    }),
    adminUpdateProduct: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/api/products/${id}`,
        method: 'PUT',
        data: formData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Products', id: 'LIST' },
        { type: 'Product', id: arg.id },
      ],
    }),
    adminDeleteProduct: builder.mutation({
      query: (id) => ({
        url: `/api/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }, { type: 'Products', id: 'FEATURED' }],
    }),

    getCart: builder.query({
      query: () => ({
        url: '/api/cart',
      }),
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation({
      query: (body) => ({
        url: '/api/cart/add',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: builder.mutation({
      query: (body) => ({
        url: '/api/cart/update',
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Cart'],
    }),
    removeCartItem: builder.mutation({
      query: (id) => ({
        url: `/api/cart/remove/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation({
      query: () => ({
        url: '/api/cart/clear',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    applyCoupon: builder.mutation({
      query: (code) => ({
        url: '/api/cart/apply-coupon',
        method: 'POST',
        data: { code },
      }),
      invalidatesTags: ['Cart'],
    }),

    createOrder: builder.mutation({
      query: (body) => ({
        url: '/api/orders',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Orders', 'Cart'],
    }),
    getMyOrders: builder.query({
      query: () => ({
        url: '/api/orders/my-orders',
      }),
      providesTags: ['Orders'],
    }),
    getOrderById: builder.query({
      query: (id) => ({
        url: `/api/orders/${id}`,
      }),
      providesTags: (r, e, id) => [{ type: 'Orders', id }],
    }),
    cancelOrder: builder.mutation({
      query: (id) => ({
        url: `/api/orders/${id}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: ['Orders'],
    }),

    getReviews: builder.query({
      query: ({ productId, ...params }) => ({
        url: `/api/reviews/product/${productId}`,
        params,
      }),
      providesTags: (r, e, { productId }) => [{ type: 'Reviews', id: productId }],
    }),
    createReview: builder.mutation({
      query: ({ productId, ...body }) => ({
        url: `/api/reviews/product/${productId}`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: (r, e, arg) => [
        { type: 'Reviews', id: arg.productId },
        { type: 'Product', id: arg.productId },
      ],
    }),
    deleteReview: builder.mutation({
      query: (id) => ({
        url: `/api/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reviews', 'Product'],
    }),

    adminStats: builder.query({
      query: () => ({
        url: '/api/admin/stats',
      }),
      providesTags: ['Admin'],
    }),
    adminOrders: builder.query({
      query: (params) => ({
        url: '/api/admin/orders',
        params,
      }),
      providesTags: ['Orders', 'Admin'],
    }),
    adminUpdateOrder: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/admin/orders/${id}`,
        method: 'PUT',
        data: { status },
      }),
      invalidatesTags: ['Orders', 'Admin'],
    }),
    adminUsers: builder.query({
      query: () => ({
        url: '/api/admin/users',
      }),
      providesTags: ['Admin'],
    }),
    adminDeleteUser: builder.mutation({
      query: (id) => ({
        url: `/api/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Admin'],
    }),
    adminUpdateRole: builder.mutation({
      query: ({ id, role }) => ({
        url: `/api/admin/users/${id}/role`,
        method: 'PUT',
        data: { role },
      }),
      invalidatesTags: ['Admin'],
    }),

    listCoupons: builder.query({
      query: () => ({
        url: '/api/coupons',
      }),
      providesTags: ['Coupons'],
    }),
    createCoupon: builder.mutation({
      query: (body) => ({
        url: '/api/coupons',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Coupons'],
    }),
    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `/api/coupons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Coupons'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useToggleWishlistApiMutation,

  useGetProductsQuery,
  useGetFeaturedProductsQuery,
  useGetCategoriesQuery,
  useGetBrandsQuery,
  useGetProductByIdQuery,
  useAdminCreateProductMutation,
  useAdminUpdateProductMutation,
  useAdminDeleteProductMutation,

  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useApplyCouponMutation,

  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useCancelOrderMutation,

  useGetReviewsQuery,
  useCreateReviewMutation,
  useDeleteReviewMutation,

  useAdminStatsQuery,
  useAdminOrdersQuery,
  useAdminUpdateOrderMutation,
  useAdminUsersQuery,
  useAdminDeleteUserMutation,
  useAdminUpdateRoleMutation,

  useListCouponsQuery,
  useCreateCouponMutation,
  useDeleteCouponMutation,
} = apiSlice;