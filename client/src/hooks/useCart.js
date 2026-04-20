import { useDispatch, useSelector } from 'react-redux';
import {
  useAddToCartMutation,
  useClearCartMutation,
  useGetCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from '../features/cart/cartApi';
import {
  guestAddItem,
  guestClear,
  guestRemoveItem,
  guestUpdateQty,
  selectGuestCart,
} from '../features/cart/cartSlice';

export function useCart() {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const guestItems = useSelector(selectGuestCart);
  const dispatch = useDispatch();

  const {
    data: cartData,
    isLoading: cartLoading,
    isFetching,
    refetch,
    error,
  } = useGetCartQuery(undefined, { skip: !isAuthenticated });

  const [addApi] = useAddToCartMutation();
  const [updateApi] = useUpdateCartItemMutation();
  const [removeApi] = useRemoveCartItemMutation();
  const [clearApi] = useClearCartMutation();

  const cart = isAuthenticated ? cartData?.cart : null;

  const items = isAuthenticated
    ? cart?.items?.map((line) => ({
        productId: line.product?._id || line.product,
        qty: line.qty,
        price: line.price,
        product: line.product,
      })) || []
    : guestItems.map((g) => ({
        productId: g.productId,
        qty: g.qty,
        price: g.price,
        product: {
          _id: g.productId,
          name: g.name,
          images: [{ url: g.image }],
          price: g.price,
        },
      }));

  const itemCount = items.reduce((n, i) => n + i.qty, 0);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const discount = isAuthenticated ? cart?.discount || 0 : 0;

  const addItem = async (product, qty = 1) => {
    if (isAuthenticated) {
      await addApi({ productId: product._id, qty }).unwrap();
      await refetch();
    } else {
      dispatch(guestAddItem({ product, qty }));
    }
  };

  const updateQty = async (productId, qty) => {
    if (isAuthenticated) {
      await updateApi({ productId, qty }).unwrap();
      await refetch();
    } else {
      dispatch(guestUpdateQty({ productId, qty }));
    }
  };

  const removeItem = async (productId) => {
    if (isAuthenticated) {
      await removeApi(productId).unwrap();
      await refetch();
    } else {
      dispatch(guestRemoveItem(productId));
    }
  };

  const clear = async () => {
    if (isAuthenticated) {
      await clearApi().unwrap();
      await refetch();
    } else {
      dispatch(guestClear());
    }
  };

  return {
    items,
    itemCount,
    subtotal,
    discount,
    coupon: isAuthenticated ? cart?.couponApplied : null,
    loading: isAuthenticated && (cartLoading || isFetching),
    error,
    addItem,
    updateQty,
    removeItem,
    clear,
    refetchCart: refetch,
    rawCart: cart,
  };
}
