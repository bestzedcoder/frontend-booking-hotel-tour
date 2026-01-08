# 🏨 Travel & Hotel Booking - Client Side

![React](https://img.shields.io/badge/React-18.x-blue.svg?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg?logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC.svg?logo=tailwind-css)
![Status](https://img.shields.io/badge/status-development-yellow.svg)

> **Môn học:** Project 3 - HUST  
> **Sinh viên:** Quách Hải Linh (20225206)  
> **Mô tả:** Giao diện người dùng cho hệ thống đặt phòng và tour du lịch, được tối ưu hóa hiệu năng với Vite.

---

## 🌟 Giới thiệu

Đây là Client-side của hệ thống, nơi người dùng tương tác để tìm kiếm và đặt dịch vụ. Dự án được xây dựng theo tiêu chí: **Nhanh (Vite)**, **Responsive (TailwindCSS)** và **Trải nghiệm mượt mà (React SPA)**.

Ứng dụng kết nối với Backend Spring Boot để thực hiện các nghiệp vụ đặt phòng và nhận thông báo thời gian thực.

## 🛠️ Tech Stack

- **Core:** ReactJS (Hooks, Context API).
- **Build Tool:** Vite (Tốc độ build và HMR cực nhanh).
- **Styling:** TailwindCSS (Utility-first CSS framework).
- **Routing:** React Router DOM v6.
- **HTTP Client:** Axios / Fetch API.
- **Icons:** React Icons / Heroicons.

## 📸 Giao diện (Screenshots)

_(Dành chỗ để bạn chèn 1-2 ảnh giao diện chính như Trang chủ hoặc Trang đặt phòng)_
![Home Page](assets/home-demo.png)

## 🚀 Cài đặt và Chạy (Getting Started)

### Yêu cầu

- Node.js (phiên bản 18+ khuyến nghị).
- Npm hoặc Yarn.

### Các bước thực hiện

1.  **Clone dự án:**

    ```bash
    git clone [https://github.com/username/project-frontend.git](https://github.com/username/project-frontend.git)
    cd project-frontend
    ```

2.  **Cài đặt thư viện:**

    ```bash
    npm install
    # Hoặc nếu dùng yarn:
    yarn install
    ```

3.  **Cấu hình môi trường (.env):**
    Tạo file `.env` tại thư mục gốc và thêm đường dẫn API Backend (Local hoặc Render):

    ```env
    VITE_API_URL=http://localhost:8080/api/v1
    # Nếu chạy với server Render:
    # VITE_API_URL=[https://your-backend.onrender.com/api/v1](https://your-backend.onrender.com/api/v1)
    ```

4.  **Chạy dưới môi trường Dev:**

    ```bash
    npm run dev
    ```

    Truy cập tại: `http://localhost:5173`

5.  **Build Production:**
    ```bash
    npm run build
    ```
