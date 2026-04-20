import { useMemo, useState } from 'react';
import { useCreateCouponMutation, useDeleteCouponMutation, useListCouponsQuery } from '../../app/apiSlice';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

export default function AdminCoupons() {
  const { data, isLoading, refetch, isFetching } = useListCouponsQuery();
  const [createCoupon, { isLoading: creating }] = useCreateCouponMutation();
  const [deleteCoupon, { isLoading: deleting }] = useDeleteCouponMutation();

  const coupons = data?.coupons || [];

  const initial = useMemo(
    () => ({
      code: '',
      discountType: 'percent',
      discountValue: '',
      minOrderAmount: '',
      maxUsage: '1000',
      expiresAt: '',
      isActive: true,
    }),
    []
  );

  const [form, setForm] = useState(initial);

  const onCreate = async (e) => {
    e.preventDefault();
    await createCoupon({
      code: form.code,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrderAmount: Number(form.minOrderAmount || 0),
      maxUsage: Number(form.maxUsage || 1000),
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : '',
      isActive: form.isActive,
    }).unwrap();
    setForm(initial);
    await refetch();
  };

  const onDelete = async (id) => {
    if (!confirm('Delete coupon?')) return;
    await deleteCoupon(id).unwrap();
    await refetch();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Promotions</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Coupons</h1>
          <p className="mt-2 text-sm text-slate-600">Create and retire discount codes.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Create coupon</h2>
        <form onSubmit={onCreate} className="mt-4 grid gap-4 md:grid-cols-2">
          <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Discount type</label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm"
              value={form.discountType}
              onChange={(e) => setForm({ ...form, discountType: e.target.value })}
            >
              <option value="percent">Percent</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>
          <Input
            label="Discount value"
            type="number"
            value={form.discountValue}
            onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
            required
          />
          <Input
            label="Minimum order amount"
            type="number"
            value={form.minOrderAmount}
            onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
          />
          <Input
            label="Max usage"
            type="number"
            value={form.maxUsage}
            onChange={(e) => setForm({ ...form, maxUsage: e.target.value })}
          />
          <Input
            label="Expires at (ISO)"
            type="datetime-local"
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            required
          />
          <label className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            <span className="text-sm font-medium text-slate-800">Active</span>
          </label>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" variant="primary" disabled={creating}>
              {creating ? 'Creating…' : 'Create coupon'}
            </Button>
          </div>
        </form>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center">
                  <Spinner className="mx-auto h-8 w-8" />
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c._id}>
                  <td className="px-4 py-3 font-semibold">{c.code}</td>
                  <td className="px-4 py-3">{c.discountType}</td>
                  <td className="px-4 py-3">{c.discountValue}</td>
                  <td className="px-4 py-3">
                    {c.usedCount}/{c.maxUsage}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{new Date(c.expiresAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {c.isActive ? <Badge tone="success">Active</Badge> : <Badge tone="danger">Inactive</Badge>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button type="button" variant="danger" className="!px-3 !py-2" disabled={deleting} onClick={() => onDelete(c._id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
