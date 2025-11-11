const RoomListTable = ({
  rooms,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-700";
      case "BOOKED":
        return "bg-red-100 text-red-700";
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 mx-1 rounded-md text-sm font-medium transition ${
            i === currentPage
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {i}
        </button>
      );
    }
    return (
      <div className="flex justify-center mt-4 mb-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 mx-1 rounded-md text-sm font-medium bg-gray-200 text-gray-700 disabled:opacity-50"
        >
          &laquo;
        </button>
        {pages}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 mx-1 rounded-md text-sm font-medium bg-gray-200 text-gray-700 disabled:opacity-50"
        >
          &raquo;
        </button>
      </div>
    );
  };

  return (
    <div className="shadow-lg rounded-lg border">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal">
            <tr>
              <th className="py-3 px-4 text-left">Tên Phòng</th>
              <th className="py-3 px-4 text-left">Loại</th>
              <th className="py-3 px-4 text-right">Giá/Giờ</th>
              <th className="py-3 px-4 text-right">Giá/Ngày</th>
              <th className="py-3 px-4 text-center">Trạng thái</th>
              <th className="py-3 px-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm font-light">
            {rooms.map((room) => (
              <tr
                key={room.roomId}
                className="border-b border-gray-200 hover:bg-gray-50 transition duration-100"
              >
                <td className="py-3 px-4 text-left whitespace-nowrap font-medium">
                  {room.roomName}
                </td>
                <td className="py-3 px-4 text-left">{room.roomType}</td>
                <td className="py-3 px-4 text-right">
                  {formatPrice(room.pricePerHour)}
                </td>
                <td className="py-3 px-4 text-right">
                  {formatPrice(room.pricePerDay)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`py-1 px-3 rounded-full text-xs font-semibold ${getStatusStyle(
                      room.status
                    )}`}
                  >
                    {room.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex item-center justify-center space-x-2">
                    <button
                      onClick={() => onEdit(room)}
                      className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition"
                      title="Sửa"
                    >
                      <span role="img" aria-label="edit">
                        ✏️
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Bạn có chắc chắn muốn xóa phòng ${room.roomName}?`
                          )
                        ) {
                          onDelete(room.roomId);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition"
                      title="Xóa"
                    >
                      <span role="img" aria-label="delete">
                        🗑️
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rooms.length === 0 && (
        <p className="text-center py-6 text-lg text-gray-500">
          Chưa có phòng nào trong danh sách.
        </p>
      )}
      {/* Thanh Phân Trang */}
      {renderPagination()}
    </div>
  );
};

export default RoomListTable;
