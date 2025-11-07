import { useCallback, useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { Link } from "react-router-dom";
import CreateUserModal from "./CreateUser";

const StatusBadge = ({ active }) => (
  <span
    className={`px-3 py-1 text-xs font-semibold rounded-full ${
      active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }`}
  >
    {active ? "Active" : "Inactive"}
  </span>
);

const RoleBadge = ({ role }) => (
  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
    {role.replace("ROLE_", "")}
  </span>
);

const SkeletonRow = () => (
  <tr>
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
      </td>
    ))}
  </tr>
);

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { callApi } = useApi();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await callApi("get", `/users?page=${page}&limit=${limit}`);
      const data = res.data;
      setUsers(data.result || []);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  }, [page, limit, callApi]);

  // ✅ Gọi khi page hoặc limit thay đổi
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePrev = () => page > 1 && setPage(page - 1);
  const handleNext = () => page < totalPages && setPage(page + 1);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500">Dashboard / Users</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          + Add User
        </button>
      </div>

      {/* Table */}
      <div className="relative bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-10">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                #
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Full Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Username
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Roles
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: limit }).map((_, i) => (
                <SkeletonRow key={i} />
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    {(page - 1) * limit + index + 1}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {user.fullName}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{user.username}</td>
                  <td className="px-6 py-4 text-gray-700">{user.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <RoleBadge key={role} role={role} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge active={user.active} />
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <Link
                      to={`/admin/users/${user.id}/edit`}
                      className="text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
                    >
                      ✏️
                      <span>Edit</span>
                    </Link>
                    <button
                      className="text-red-600 hover:text-red-800 transition"
                      onClick={() => alert(`Delete ${user.fullName}`)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <p className="text-gray-600">
          Page <span className="font-semibold">{page}</span> of{" "}
          <span className="font-semibold">{totalPages}</span>
        </p>
        <div className="space-x-3">
          <button
            onClick={handlePrev}
            disabled={page === 1 || loading}
            className={`px-4 py-2 rounded-md border transition ${
              page === 1 || loading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-100 text-gray-700"
            }`}
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            disabled={page === totalPages || loading}
            className={`px-4 py-2 rounded-md border transition ${
              page === totalPages || loading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-100 text-gray-700"
            }`}
          >
            Next →
          </button>
        </div>
      </div>
      {showModal && (
        <CreateUserModal
          onClose={() => setShowModal(false)}
          onSuccess={() => fetchUsers()}
        />
      )}
    </div>
  );
};

export default UserList;
