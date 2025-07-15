# Sử dụng Node.js LTS làm base image
FROM node:18

# Tạo thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json trước để cache layer cài đặt
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci --omit=dev

# Copy toàn bộ mã nguồn vào image
COPY . .

# Expose port (Render sẽ tự động map port này)
EXPOSE 6789

# Lệnh chạy ứng dụng (sửa lại nếu entrypoint khác)
CMD ["npm", "start"] 