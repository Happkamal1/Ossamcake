import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminUsers, updateUserStatus, updateUserRole } from "@/features/admin/adminSlice";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { toast } from "sonner";
import { Search, RefreshCw, Shield } from "lucide-react";

export default function AdminUsers() {
  const dispatch = useDispatch();
  const { users, loading } = useSelector(s => s.admin);
  const currentUser = useSelector(s => s.auth.user);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [confirmTarget, setConfirmTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminUsers({ search: search || undefined, role: roleFilter !== "all" ? roleFilter : undefined }));
  }, [dispatch, search, roleFilter]);

  const handleStatusChange = async (user, status) => {
    const res = await dispatch(updateUserStatus({ id: user._id, accountStatus: status }));
    if (res.meta.requestStatus === "fulfilled") toast.success(`User ${status}`);
    else toast.error(res.payload || "Failed to update status");
    setConfirmTarget(null);
  };

  const handleRoleChange = async (user, role) => {
    const res = await dispatch(updateUserRole({ id: user._id, role }));
    if (res.meta.requestStatus === "fulfilled") toast.success("Role updated");
    else toast.error(res.payload || "Failed to update role");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Users</h2>
          <p className="text-sm text-slate-500">{users.length} users</p>
        </div>
        <button onClick={() => dispatch(fetchAdminUsers({}))} className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500">
          <option value="all">All Roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["User", "Email", "Role", "Status", "Joined", "Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-slate-500 px-5 py-3.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="py-12 text-center text-slate-400"><RefreshCw className="animate-spin mx-auto" size={20} /></td></tr>}
              {!loading && users.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-slate-400">No users found</td></tr>}
              {users.map(user => (
                <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{user.email}</td>
                  <td className="px-5 py-4">
                    {currentUser?.role === "super_admin" && user._id !== currentUser._id ? (
                      <select value={user.role} onChange={e => handleRoleChange(user, e.target.value)}
                        className="border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold bg-white capitalize focus:outline-none focus:ring-1 focus:ring-pink-500">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize
                        ${user.role === "super_admin" ? "bg-violet-100 text-violet-700" : user.role === "admin" ? "bg-pink-100 text-pink-700" : "bg-slate-100 text-slate-600"}`}>
                        {user.role === "admin" || user.role === "super_admin" ? <Shield size={10} /> : null}
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={user.accountStatus || "active"} /></td>
                  <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {user.accountStatus !== "suspended" ? (
                        <button onClick={() => setConfirmTarget({ user, action: "suspended" })}
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition-colors">
                          Suspend
                        </button>
                      ) : (
                        <button onClick={() => handleStatusChange(user, "active")}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs font-semibold transition-colors">
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        open={!!confirmTarget}
        title="Suspend User?"
        message={`Are you sure you want to suspend ${confirmTarget?.user?.name}? They won't be able to log in.`}
        confirmLabel="Suspend"
        onConfirm={() => handleStatusChange(confirmTarget.user, confirmTarget.action)}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
