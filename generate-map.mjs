// scripts/generate-map.mjs

// Import các module cần thiết của Node.js
import fs from 'fs/promises'; // Module để làm việc với file hệ thống (bản bất đồng bộ)
import path from 'path';     // Module để làm việc với đường dẫn file

// --- CẤU HÌNH ---
// Đường dẫn tương đối đến file chứa dữ liệu countriesData
// const DATA_SOURCE_PATH = './src/hooks/home/constants.ts'; 
// Đường dẫn đến nơi bạn muốn lưu file SVG đầu ra
const OUTPUT_SVG_PATH = './public/world-map.svg';
// ViewBox chính xác cho SVG của bạn
const SVG_VIEWBOX = '0 0 1070 815';

// --- HÀM CHÍNH ĐỂ THỰC HIỆN CÔNG VIỆC ---
async function generateSvgFile() {
  try {
    console.log('Bắt đầu quá trình tạo file SVG...');

    // 1. ĐỌC DỮ LIỆU TỪ FILE constants.ts
    // ------------------------------------
    // console.log(`Đang đọc dữ liệu từ: ${DATA_SOURCE_PATH}`);
    // fs.readFile sẽ đọc file dưới dạng buffer, nên cần chuyển sang chuỗi utf8
    const fileContent = await fs.readFile("D:/confhub2-fe-client-side/src/hooks/home/constants.ts", 'utf8');

    // 2. TRÍCH XUẤT MẢNG countriesData TỪ NỘI DUNG FILE
    // ------------------------------------------------
    // Đây là một mẹo nhỏ: chúng ta sẽ tìm đoạn text bắt đầu bằng `export const countriesData`
    // và kết thúc bằng dấu `;` để lấy ra chuỗi JSON.
    // Điều này không an toàn 100% nếu file của bạn có cấu trúc phức tạp,
    // nhưng nó hoạt động tốt với cấu trúc dữ liệu đơn giản.
// Mới - Dấu chấm phẩy (;) trở thành tùy chọn (optional)
const match = fileContent.match(/export const countriesData:.*? = (\[.*?\]);?/s);
    if (!match || !match[1]) {
      throw new Error('Không thể tìm thấy mảng "countriesData" trong file. Hãy kiểm tra lại cấu trúc file constants.ts');
    }
    
    // Dùng Function constructor để thực thi chuỗi JS và lấy về mảng.
    // Đây là cách an toàn hơn eval().
    const countriesData = new Function(`return ${match[1]}`)();
    console.log(`Đã tìm thấy và xử lý ${countriesData.length} quốc gia.`);

    // 3. GỘP TẤT CẢ CÁC PATH LẠI
    // ---------------------------
    const combinedPathData = countriesData.map(country => country.d).join(' ');
    console.log('Đã gộp tất cả các path thành một chuỗi duy nhất.');

    // 4. TẠO NỘI DUNG CHO FILE SVG
    // -----------------------------
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${SVG_VIEWBOX}">\n  <path d="${combinedPathData}" />\n</svg>`;
    console.log('Đã tạo nội dung SVG.');

    // 5. GHI NỘI DUNG RA FILE
    // -----------------------
    await fs.writeFile(path.resolve(OUTPUT_SVG_PATH), svgContent, 'utf8');
    console.log(`✅ Thành công! Đã tạo file SVG tại: ${OUTPUT_SVG_PATH}`);

  } catch (error) {
    console.error('❌ Đã xảy ra lỗi:', error.message);
    process.exit(1); // Thoát script với mã lỗi
  }
}

// Chạy hàm chính
generateSvgFile();