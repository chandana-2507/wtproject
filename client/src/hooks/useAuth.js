import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLazyGetMeQuery, useLogoutMutation } from '../features/auth/authApi';
import { logoutUser, setAuthLoading, setUser } from '../features/auth/authSlice';

export function useAuthBootstrap() {
  const dispatch = useDispatch();
  const [triggerMe] = useLazyGetMeQuery();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      dispatch(setAuthLoading(true));
      try {
        const res = await triggerMe().unwrap();
        if (!cancelled && res?.user) dispatch(setUser(res.user));
        else if (!cancelled) dispatch(setUser(null));
      } catch {
        if (!cancelled) dispatch(setUser(null));
      } finally {
        if (!cancelled) dispatch(setAuthLoading(false));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch, triggerMe]);
}

export function useAuth() {
  const { user, isAuthenticated, loading } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const [logoutApi] = useLogoutMutation();

  const logout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      /* ignore */
    }
    dispatch(logoutUser());
  };

  return {
    user,
    isAuthenticated,
    loading,
    logout,
    isAdmin: user?.role === 'admin',
  };
}
