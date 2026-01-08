# 1. Sử dụng node phiên bản nhẹ
FROM node:18-alpine

# 2. Tạo thư mục làm việc
WORKDIR /app

# 3. Copy file cấu hình trước để tối ưu cache khi build
COPY package*.json ./

# 4. Cài đặt thư viện
RUN npm install

# 5. Copy toàn bộ code vào container
COPY . .

# 6. Build ứng dụng (Vite cần bước build này để tạo ra thư mục dist)
RUN npm run build

# 7. Render thường dùng port 10000 hoặc port từ biến môi trường
EXPOSE 10000

# 8. Chạy lệnh preview để khởi động server thực tế
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "10000"]