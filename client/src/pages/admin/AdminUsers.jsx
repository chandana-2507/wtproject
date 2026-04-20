import { useAdminDeleteUserMutation, useAdminUpdateRoleMutation, useAdminUsersQuery } from '../../app/apiSlice';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

export default function AdminUsers() {
  const { data, isLoading, refetch, isFetching } = useAdminUsersQuery();
  const [updateRole, { isLoading: saving }] = useAdminUpdateRoleMutation();
  const [deleteUser, { isLoading: deleting }] = useAdminDeleteUserMutation();

  const users = data?.users || [];

  const toggle = async (u) => {
    const next = u.role === 'admin' ? 'user' : 'admin';
    await updateRole({ id: u._id, role: next }).unwrap();
    await refetch();
  };

  const remove = async (u) => {
    if (!confirm(`Delete ${u.email}?`)) return;
    await deleteUser(u._id).unwrap();
    await refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">People</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Users</h1>
          <p className="mt-2 text-sm text-slate-600">Toggle admin access and remove accounts.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center">
                  <Spinner className="mx-auto h-8 w-8" />
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {u.role === 'admin' ? <Badge tone="info">admin</Badge> : <Badge tone="neutral">user</Badge>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      className="mr-2 !px-3 !py-2"
                      disabled={saving}
                      onClick={() => toggle(u)}
                    >
                      Toggle role
                    </Button>
                    <Button type="button" variant="danger" className="!px-3 !py-2" disabled={deleting} onClick={() => remove(u)}>
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
