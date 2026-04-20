import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Breadcrumb from '../components/ui/Breadcrumb';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useGetMeQuery, useUpdateProfileMutation, useChangePasswordMutation } from '../features/auth/authApi';
import { useDispatch } from 'react-redux';
import { setUser } from '../features/auth/authSlice';
import Spinner from '../components/ui/Spinner';

const profileSchema = z.object({
  name: z.string().min(1),
  avatar: z.any().optional(),
});

const pwSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { data, isLoading } = useGetMeQuery();
  const [updateProfile, { isLoading: savingProfile }] = useUpdateProfileMutation();
  const [changePw, { isLoading: savingPw }] = useChangePasswordMutation();

  const user = data?.user;

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    values: user ? { name: user.name } : { name: '' },
  });

  const pwForm = useForm({
    resolver: zodResolver(pwSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  });

  const onProfile = async (vals) => {
    const fd = new FormData();
    fd.append('name', vals.name);
    const file = vals.avatar && vals.avatar[0];
    if (file) fd.append('avatar', file);
    const res = await updateProfile(fd).unwrap();
    dispatch(setUser(res.user));
  };

  const onPw = async (vals) => {
    await changePw(vals).unwrap();
    pwForm.reset();
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Profile' }]} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
          <img
            src={user.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
            alt=""
            className="mx-auto h-28 w-28 rounded-full object-cover ring-4 ring-indigo-50"
          />
          <p className="mt-4 font-semibold text-slate-900">{user.name}</p>
          <p className="text-sm text-slate-500">{user.email}</p>
          <p className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
            {user.role}
          </p>
        </div>

        <div className="space-y-8">
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Profile details</h2>
            <form onSubmit={profileForm.handleSubmit(onProfile)} className="mt-4 space-y-4">
              <Input label="Name" {...profileForm.register('name')} error={profileForm.formState.errors.name?.message} />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Avatar</label>
                <input type="file" accept="image/*" {...profileForm.register('avatar')} className="text-sm" />
              </div>
              <Button type="submit" variant="primary" disabled={savingProfile}>
                {savingProfile ? 'Saving…' : 'Save changes'}
              </Button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Change password</h2>
            <form onSubmit={pwForm.handleSubmit(onPw)} className="mt-4 space-y-4">
              <Input
                label="Current password"
                type="password"
                {...pwForm.register('currentPassword')}
                error={pwForm.formState.errors.currentPassword?.message}
              />
              <Input
                label="New password"
                type="password"
                {...pwForm.register('newPassword')}
                error={pwForm.formState.errors.newPassword?.message}
              />
              <Button type="submit" variant="outline" disabled={savingPw}>
                {savingPw ? 'Updating…' : 'Update password'}
              </Button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
