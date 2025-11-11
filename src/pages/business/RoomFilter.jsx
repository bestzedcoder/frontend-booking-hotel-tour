import React from "react";
// Đảm bảo import RoomType và RoomStatus từ file utils/contain của bạn
import { RoomType, RoomStatus } from "../../utils/contain";

const RoomFilter = ({ filterType, filterStatus, onFilterChange }) => {
  const allRoomTypes = ["ALL", ...Object.values(RoomType)];
  const allRoomStatuses = ["ALL", ...Object.values(RoomStatus)];

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-inner flex flex-wrap gap-4">
      {/* Lọc theo Loại phòng */}
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Loại Phòng:</label>
        <select
          value={filterType}
          onChange={(e) => onFilterChange("type", e.target.value)}
          className="p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          {allRoomTypes.map((type) => (
            <option key={type} value={type}>
              {type === "ALL" ? "Tất cả" : type}
            </option>
          ))}
        </select>
      </div>

      {/* Lọc theo Trạng thái */}
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
        <select
          value={filterStatus}
          onChange={(e) => onFilterChange("status", e.target.value)}
          className="p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          {allRoomStatuses.map((status) => (
            <option key={status} value={status}>
              {status === "ALL" ? "Tất cả" : status}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default RoomFilter;
