import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema } from '../../utils/validators';
import Button from '../ui/Button';

const schema = addressSchema;

export default function AddressForm({ defaultValues, onSubmit, submitting }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Label</label>
        <input
          {...register('label')}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
        <input
          {...register('fullName')}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
        <input
          {...register('phone')}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
      </div>
      <div className="md:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Street</label>
        <input
          {...register('street')}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        {errors.street && <p className="mt-1 text-xs text-red-600">{errors.street.message}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">City</label>
        <input
          {...register('city')}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">State</label>
        <input
          {...register('state')}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state.message}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Postal code</label>
        <input
          {...register('postalCode')}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        {errors.postalCode && <p className="mt-1 text-xs text-red-600">{errors.postalCode.message}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Country</label>
        <input
          {...register('country')}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        {errors.country && <p className="mt-1 text-xs text-red-600">{errors.country.message}</p>}
      </div>
      <label className="flex items-center gap-2 md:col-span-2">
        <input
          type="checkbox"
          {...register('isDefault', { valueAsBoolean: true })}
          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
        />
        <span className="text-sm text-slate-700">Use as default address for this order</span>
      </label>
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Saving...' : 'Continue to payment'}
        </Button>
      </div>
    </form>
  );
}
