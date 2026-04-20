import { useMemo, useState } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import {
  useAdminCreateProductMutation,
  useAdminDeleteProductMutation,
  useAdminUpdateProductMutation,
  useGetProductsQuery,
} from '../../features/products/productsApi';
import Spinner from '../../components/ui/Spinner';
import { formatPrice } from '../../utils/formatPrice';

export default function AdminProducts() {
  const [keyword, setKeyword] = useState('');
  const { data, isLoading, refetch } = useGetProductsQuery({ limit: 50, keyword: keyword || undefined });
  const [createProduct, { isLoading: creating }] = useAdminCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useAdminUpdateProductMutation();
  const [deleteProduct, { isLoading: deleting }] = useAdminDeleteProductMutation();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const products = data?.products || [];

  const initialForm = useMemo(
    () => ({
      name: '',
      description: '',
      price: '',
      comparePrice: '',
      category: '',
      brand: '',
      stock: '',
      isFeatured: false,
      variants: '[]',
    }),
    []
  );

  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);

  const resetForm = () => {
    setEditId(null);
    setForm(initialForm);
    setFiles([]);
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (p) => {
    setEditId(p._id);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      comparePrice: String(p.comparePrice || ''),
      category: p.category,
      brand: p.brand,
      stock: String(p.stock ?? ''),
      isFeatured: !!p.isFeatured,
      variants: JSON.stringify(p.variants || []),
    });
    setFiles([]);
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('description', form.description);
    fd.append('price', form.price);
    fd.append('comparePrice', form.comparePrice || '0');
    fd.append('category', form.category);
    fd.append('brand', form.brand);
    fd.append('stock', form.stock || '0');
    fd.append('isFeatured', form.isFeatured ? 'true' : 'false');
    fd.append('variants', form.variants || '[]');
    files.forEach((f) => fd.append('images', f));

    if (editId) {
      await updateProduct({ id: editId, formData: fd }).unwrap();
    } else {
      await createProduct(fd).unwrap();
    }
    setOpen(false);
    resetForm();
    await refetch();
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this product permanently?')) return;
    await deleteProduct(id).unwrap();
    await refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Catalog</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Products</h1>
          <p className="mt-2 text-sm text-slate-600">Search, create, edit, and remove catalog items.</p>
        </div>
        <Button variant="primary" type="button" onClick={openCreate}>
          Add product
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search…" className="max-w-md" />
        <Button type="button" variant="outline" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <Spinner className="mx-auto h-8 w-8" />
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images?.[0]?.url || 'https://placehold.co/80x80'}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    {p.isFeatured ? <Badge tone="info">Yes</Badge> : <Badge tone="neutral">No</Badge>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button type="button" variant="outline" className="mr-2 !px-3 !py-2" onClick={() => openEdit(p)}>
                      Edit
                    </Button>
                    <Button type="button" variant="danger" className="!px-3 !py-2" disabled={deleting} onClick={() => onDelete(p._id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'Edit product' : 'Create product'} size="lg">
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required />
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <Input label="Price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <Input
            label="Compare price"
            type="number"
            step="0.01"
            value={form.comparePrice}
            onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
          />
          <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <Input label="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Variants JSON</label>
            <textarea
              rows={3}
              value={form.variants}
              onChange={(e) => setForm({ ...form, variants: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-mono text-xs shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <label className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
            />
            <span className="text-sm font-medium text-slate-800">Featured</span>
          </label>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Images</label>
            <input type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
            <p className="mt-2 text-xs text-slate-500">
              Required for create. Optional on edit — new images append to existing gallery.
            </p>
          </div>
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={creating || updating}>
              {creating || updating ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
