import { useCallback, useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { Link } from "react-router-dom";
import {
  Search,
  Mail,
  User as UserIcon,
  Filter,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  X,
  AlertCircle,
} from "lucide-react";
import CreateUserModal from "./CreateUser";

// Badge hiển thị Trạng thái
const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      active
        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
        : "bg-rose-50 text-rose-700 border-rose-100"
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        active ? "bg-emerald-500" : "bg-rose-500"
      }`}
    ></span>
    {active ? "Active" : "Inactive"}
  </span>
);

// Badge hiển thị Role
const RoleBadge = ({ role }) => {
  const roleName = role.replace("ROLE_", "");
  const styles = {
    ADMIN: "bg-purple-50 text-purple-700 border-purple-100",
    BUSINESS: "bg-blue-50 text-blue-700 border-blue-100",
    CUSTOMER: "bg-amber-50 text-amber-700 border-amber-100",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider ${
        styles[roleName] || "bg-gray-50"
      }`}
    >
      {roleName}
    </span>
  );
};

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  // States cho Search & Filter
  const [emailInput, setEmailInput] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { callApi } = useApi();

  // 1. Logic Debounce cho Email (500ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedEmail(emailInput);
      setPage(1); // Reset về trang 1 khi search
    }, 500);
    return () => clearTimeout(handler);
  }, [emailInput]);

  // 2. Fetch data với Search Params
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
      });
      if (selectedRole) params.append("role", selectedRole);
      if (debouncedEmail) params.append("email", debouncedEmail);
      const res = await callApi("get", `/users?${params.toString()}`);
      if (res.success) {
        setUsers(res.data.result || []);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedEmail, selectedRole, callApi]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id) => {
    const response = await callApi("delete", `users/${id}`);
    if (response.success) {
      setConfirmDelete(null);
      fetchUsers();
    } else {
      alert(response.message);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            User Management
          </h1>
          <p className="text-slate-500 text-sm">
            Quản lý phân quyền và thông tin tài khoản hệ thống
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-sm shadow-blue-200"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add New User
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by email..."
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm"
          />
        </div>

        <div className="relative min-w-[180px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm appearance-none cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Administrator</option>
            <option value="BUSINESS">Business Partner</option>
            <option value="CUSTOMER">Customer</option>
          </select>
        </div>

        {(emailInput || selectedRole) && (
          <button
            onClick={() => {
              setEmailInput("");
              setSelectedRole("");
            }}
            className="text-sm text-rose-600 font-medium hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  User Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-6 py-4">
                      <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-20">
                    <div className="flex flex-col items-center">
                      <Search className="w-12 h-12 text-slate-200 mb-2" />
                      <p className="text-slate-500 font-medium">
                        No users found matching your criteria
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                          {user.fullName?.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">
                            {user.fullName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono italic">
                      {user.username}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles.map((role) => (
                          <RoleBadge key={role} role={role} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge active={user.active} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/admin/users/${user.id}/edit`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit User"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setConfirmDelete(user)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Showing page{" "}
            <span className="font-bold text-slate-900">{page}</span> of{" "}
            {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-rose-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Xác nhận xoá
              </h2>
              <p className="text-slate-500 text-sm">
                Bạn có chắc chắn muốn xoá người dùng{" "}
                <span className="font-bold text-slate-700">
                  {confirmDelete.fullName}
                </span>
                ? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="bg-slate-50 p-4 flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                className="flex-1 py-2 text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-xl transition-colors shadow-lg shadow-rose-200"
              >
                Xoá ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <CreateUserModal
          onClose={() => setShowModal(false)}
          onSuccess={() => fetchUsers()}
        />
      )}
    </div>
  );
}
