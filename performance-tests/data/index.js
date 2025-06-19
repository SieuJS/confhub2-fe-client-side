// performance-tests/data/index.js
import { SharedArray } from 'k6/data';

// Load dữ liệu user vào một SharedArray và export nó ra.
// Bằng cách này, bất kỳ module nào cũng có thể import và sử dụng trực tiếp.
export const users = new SharedArray('users data', function () {
  // Chúng ta có thể thêm log ở đây để chắc chắn nó được chạy
  console.log('Loading users from users.json...');
  return JSON.parse(open('./users.json'));
});