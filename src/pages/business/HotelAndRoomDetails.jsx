import { useState, useEffect, useMemo, useCallback } from "react";
import RoomListTable from "./RoomListTable";
import RoomFormModal from "./RoomFormModal";
import RoomFilter from "./RoomFilter";
import HotelEditModal from "./HotelEditModal";
import {
  RoomStatus,
  RoomType,
  STAR_RATINGS,
  VIETNAM_PROVINCES,
} from "../../utils/contain";
import { useApi } from "../../hooks/useApi";
import { useNavigate, useParams } from "react-router-dom";
import HotelDetailSection from "./HotelDetailSection";

const ITEMS_PER_PAGE = 10;

const HotelAndRoomDetail = () => {
  const [hotelData, setHotelData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { id } = useParams();
  const { callApi } = useApi();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const fetchHotelData = useCallback(async () => {
    setIsLoading(true);
    const response = await callApi("get", `/hotels/${id}`);
    if (!response.success) {
      alert(response.message);
      setIsLoading(false);
      return;
    }
    setHotelData(response.data);
    setIsLoading(false);
  }, [callApi, id]);

  useEffect(() => {
    fetchHotelData();
  }, [fetchHotelData]);

  const handleUpdateHotel = async (updatedData) => {
    setIsSaving(true);
    const { newImages, ...hotelDetails } = updatedData;

    const data = {
      hotelName: hotelDetails.name,
      hotelStar: STAR_RATINGS.find((s) => s.value === hotelDetails.stars)
        .element,
      hotelCity: hotelDetails.province,
      hotelAddress: hotelDetails.address,
      hotelDescription: hotelDetails.description,
      imagesOld: hotelDetails.oldImageUrls,
    };

    console.log({ data, newImages });

    const formData = new FormData();

    formData.append(
      "data",
      new Blob(
        [
          JSON.stringify({
            ...data,
          }),
        ],
        { type: "application/json" }
      )
    );

    newImages.forEach((file) => {
      formData.append("images", file);
    });

    const response = await callApi("put", `/hotels/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (!response.success) {
      alert(response.message);
      setIsSaving(false);
      return;
    }
    alert("Cập nhật thông tin khách sạn thành công!");
    setIsHotelModalOpen(false);
    setIsSaving(false);
    fetchHotelData();
  };

  const handleAddRooms = async (newRoomData) => {
    setIsSaving(true);
    const response = await callApi("post", `/hotels/${id}/rooms`, newRoomData);
    if (!response.success) {
      alert(response.message);
      setIsSaving(false);
      return;
    }
    alert(response.message);
    setIsModalOpen(false);
    setIsSaving(false);
    fetchHotelData();
  };

  const handleEditRoom = async (updatedRoom, roomId) => {
    setIsSaving(true);
    console.log({ updatedRoom, roomId });
    const response = await callApi(
      "put",
      `/hotels/${id}/room/${roomId}`,
      updatedRoom
    );
    if (!response.success) {
      alert(response.message);
      setIsSaving(false);
      return;
    }
    alert(response.message);
    setIsModalOpen(false);
    setEditingRoom(null);
    setIsSaving(false);
    fetchHotelData();
  };

  const handleDeleteRoom = async (roomId) => {
    setIsSaving(true);
    try {
      // 🚨 GỌI API XÓA PHÒNG THẬT SỰ
      // const response = await callApi(`/api/room/${roomId}`, { method: 'DELETE' });
      // if (response.success) {
      //     fetchHotelData();
      // }

      // Giữ logic mock tạm thời:
      setHotelData((prevData) => {
        /* ... logic cũ ... */
      });
      setIsSaving(false);
    } catch (e) {
      setIsSaving(false);
    }
  };

  const openAddModal = () => {
    setEditingRoom(null);
    setIsModalOpen(true);
  };
  const openEditModal = (room) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const filteredRooms = useMemo(() => {
    if (!hotelData) return [];
    let rooms = hotelData.rooms;
    if (filterType !== "ALL") {
      rooms = rooms.filter((room) => room.roomType === filterType);
    }
    if (filterStatus !== "ALL") {
      rooms = rooms.filter((room) => room.status === filterStatus);
    }
    return rooms;
  }, [hotelData, filterType, filterStatus]);

  const totalRooms = filteredRooms.length;
  const totalPages = Math.ceil(totalRooms / ITEMS_PER_PAGE);

  const paginatedRooms = useMemo(() => {
    if (filteredRooms.length === 0) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredRooms.slice(startIndex, endIndex);
  }, [filteredRooms, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handleFilterChange = (type, value) => {
    setCurrentPage(1);
    if (type === "type") {
      setFilterType(value);
    } else if (type === "status") {
      setFilterStatus(value);
    }
  };

  if (isLoading || !hotelData) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center py-10 text-xl font-medium text-gray-600">
          {isLoading
            ? "Đang tải dữ liệu khách sạn..."
            : "Không tìm thấy dữ liệu khách sạn."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleGoBack}
            className="bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold py-2 px-4 rounded transition duration-150 shadow-sm flex items-center h-10"
            title="Trở về trang trước"
          >
            &larr; Trở về
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            🏨 Chi tiết Khách sạn & Quản lý Phòng
          </h1>
        </div>
        <button
          onClick={() => setIsHotelModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-150 shadow-md h-10 flex items-center"
        >
          ⚙️ Chỉnh Sửa Khách sạn
        </button>
      </div>

      <HotelDetailSection hotelData={hotelData} />
      <hr className="my-8" />

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">
            Danh sách Phòng (Tìm thấy: **{totalRooms}**)
          </h2>
          <button
            onClick={openAddModal}
            disabled={isSaving}
            className={`font-bold py-2 px-4 rounded transition duration-150 shadow-md ${
              isSaving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            ➕ Thêm Phòng Mới
          </button>
        </div>

        <RoomFilter
          filterType={filterType}
          filterStatus={filterStatus}
          onFilterChange={handleFilterChange}
          roomTypes={Object.values(RoomType)}
          roomStatuses={Object.values(RoomStatus)}
        />

        <RoomListTable
          rooms={paginatedRooms}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onEdit={openEditModal}
          onDelete={handleDeleteRoom}
        />
      </div>

      <RoomFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRoom(null);
        }}
        isEditing={!!editingRoom}
        initialData={editingRoom}
        onCreate={handleAddRooms}
        onUpdate={handleEditRoom}
        isSaving={isSaving}
      />

      <HotelEditModal
        isOpen={isHotelModalOpen}
        onClose={() => setIsHotelModalOpen(false)}
        initialData={hotelData}
        onSave={handleUpdateHotel}
        starRatings={STAR_RATINGS.filter((r) => r.value > 0)}
        provinces={VIETNAM_PROVINCES}
        isSaving={isSaving}
      />
    </div>
  );
};

export default HotelAndRoomDetail;
