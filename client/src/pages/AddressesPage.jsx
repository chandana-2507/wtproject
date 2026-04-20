import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Breadcrumb from '../components/ui/Breadcrumb';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import {
  useAddAddressMutation,
  useDeleteAddressMutation,
  useGetAddressesQuery,
  useUpdateAddressMutation,
} from '../features/auth/authApi';
import { addressSchema } from '../utils/validators';

export default function AddressesPage() {
  const { data, isLoading, refetch } = useGetAddressesQuery();
  const [addAddress, { isLoading: adding }] = useAddAddressMutation();
  const [updateAddress, { isLoading: updating }] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();

  const addresses = data?.addresses || [];

  const form = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: 'Home',
      fullName: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      isDefault: false,
    },
  });

  const sorted = useMemo(() => [...addresses].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)), [addresses]);

  const onCreate = async (vals) => {
    await addAddress(vals).unwrap();
    form.reset();
    await refetch();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Addresses' }]} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Saved addresses</h1>
          <p className="mt-2 text-sm text-slate-600">Manage shipping destinations for faster checkout.</p>

          <div className="mt-8 space-y-4">
            {isLoading ? (
              <p className="text-sm text-slate-600">Loading…</p>
            ) : sorted.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-600">
                No addresses saved yet.
              </div>
            ) : (
              sorted.map((a) => (
                <div key={a._id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">{a.label}</p>
                        {a.isDefault && <Badge tone="info">Default</Badge>}
                      </div>
                      <p className="mt-2 text-sm text-slate-800">{a.fullName}</p>
                      <p className="text-sm text-slate-700">{a.street}</p>
                      <p className="text-sm text-slate-700">
                        {a.city}, {a.state} {a.postalCode}
                      </p>
                      <p className="text-sm text-slate-700">{a.country}</p>
                      <p className="mt-2 text-xs text-slate-500">{a.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          await deleteAddress(a._id).unwrap();
                          await refetch();
                        }}
                      >
                        Delete
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={async () => {
                          await updateAddress({
                            id: a._id,
                            ...a,
                            isDefault: true,
                          }).unwrap();
                          await refetch();
                        }}
                      >
                        Make default
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Add address</h2>
          <form onSubmit={form.handleSubmit(onCreate)} className="mt-4 space-y-3">
            <Input label="Label" {...form.register('label')} />
            <Input label="Full name" {...form.register('fullName')} error={form.formState.errors.fullName?.message} />
            <Input label="Phone" {...form.register('phone')} error={form.formState.errors.phone?.message} />
            <Input label="Street" {...form.register('street')} error={form.formState.errors.street?.message} />
            <Input label="City" {...form.register('city')} error={form.formState.errors.city?.message} />
            <Input label="State" {...form.register('state')} error={form.formState.errors.state?.message} />
            <Input
              label="Postal code"
              {...form.register('postalCode')}
              error={form.formState.errors.postalCode?.message}
            />
            <Input label="Country" {...form.register('country')} error={form.formState.errors.country?.message} />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" {...form.register('isDefault', { valueAsBoolean: true })} /> Default address
            </label>
            <Button type="submit" variant="primary" className="w-full" disabled={adding || updating}>
              {adding ? 'Saving…' : 'Save address'}
            </Button>
          </form>
        </aside>
      </div>
    </div>
  );
}
