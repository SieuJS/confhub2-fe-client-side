// jest.config.ts
import type { Config } from 'jest';
import nextJest from 'next/jest.js'; // Sử dụng .js ở cuối cho tương thích ESM

const createJestConfig = nextJest({
  // Cung cấp đường dẫn đến ứng dụng Next.js của bạn để tải next.config.js và .env
  dir: './',
});

// Cấu hình Jest tùy chỉnh
const customJestConfig: Config = {
  // Môi trường test giống trình duyệt (cần cho React Testing Library)
  testEnvironment: 'jest-environment-jsdom',

  // Chạy file này sau khi môi trường test được thiết lập (để thêm jest-dom matchers)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // Đảm bảo đường dẫn đúng

  // Xử lý Path Aliases (quan trọng nếu bạn dùng '@/' trong tsconfig.json)
  moduleNameMapper: {
    // Ánh xạ alias từ tsconfig.json
    '^@/(.*)$': '<rootDir>/$1',
    // Bạn có thể cần thêm các mapper khác nếu dùng CSS Modules hoặc file tĩnh,
    // nhưng next/jest thường xử lý nhiều thứ cho bạn.
  },

  // !! QUAN TRỌNG: Xử lý lỗi "ERR_REQUIRE_ESM" !!
  // Nói Jest KHÔNG bỏ qua việc biến đổi (transform) các package ESM này.
  // Jest cần biến đổi chúng thành CommonJS để có thể chạy đúng.
  transformIgnorePatterns: [
    '/node_modules/(?!(string-width|strip-ansi|ansi-regex)/)', // Chỉ tập trung vào 3 cái này trước
    '^.+\\.module\\.(css|sass|scss)$',
],

  // Không cần thêm 'preset: 'ts-jest'' vì next/jest đã xử lý việc biên dịch TS/TSX
};

// Export cấu hình cuối cùng bằng cách gọi hàm createJestConfig
export default createJestConfig(customJestConfig);