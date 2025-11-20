import { defineConfig } from "vite";

export default defineConfig({
  root: ".", // Thư mục gốc dự án
  server: {
    port: 5173,
    open: true, // Tự mở trình duyệt khi chạy npm run dev
  },

  // Multi-Page support
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        login: "src/pages/login.html",
        register: "src/pages/register.html",
        search: "src/pages/search.html",
      },
    },
  },
});
