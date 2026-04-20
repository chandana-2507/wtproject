import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useRegisterMutation, useLazyGetMeQuery } from '../features/auth/authApi';
import { setUser } from '../features/auth/authSlice';
import { selectGuestCart } from '../features/cart/cartSlice';
import { registerSchema } from '../utils/validators';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const guestCart = useSelector(selectGuestCart);
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [getMe] = useLazyGetMeQuery();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      guestCartItems: guestCart.map((i) => ({ productId: i.productId, qty: i.qty })),
    };
    await registerUser(payload).unwrap();
    const me = await getMe().unwrap();
    dispatch(setUser(me.user));
    navigate('/', { replace: true });
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-8 px-4 py-14">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Join LuxeMart for faster checkout and personalized recommendations.
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.35 }}
        className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm"
      >
        <div className="space-y-4">
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />
        </div>
        <Button type="submit" variant="primary" className="mt-6 w-full" disabled={isLoading}>
          {isLoading ? 'Creating account…' : 'Create account'}
        </Button>
        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-indigo-700">
            Sign in
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
