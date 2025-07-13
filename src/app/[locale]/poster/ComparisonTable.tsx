'use client'

import React from 'react'

const ComparisonTable: React.FC = () => {
  // Dữ liệu không đổi
  const competitors = [
    'WIKICFP',
    'CORE PORTAL',
    'WORLD CONF.\nALERTS',
    'INTER. CONF.\nALERTS',
    '10TIMES',
    'CONFHUB',
    'GLOBAL CONFERENCE\n& JOURNAL HUB'
  ]

  // Dữ liệu so sánh được cập nhật
  const comparisonData = [
    // --- DỮ LIỆU CÓ SẴN ---
    {
      category: 'Tìm kiếm hội nghị',
      features: [
        // {
        //   name: 'Theo lĩnh vực',
        //   values: [true, true, true, true, true, true, true]
        // },
        {
          name: 'Theo hình thức',
          values: [true, false, false, false, true, true, true]
        },
        {
          name: 'Theo địa điểm',
          values: [true, false, true, true, true, true, true]
        },
        {
          name: 'Theo ngày nộp bài',
          values: [false, false, true, true, true, true, true]
        },
        {
          name: 'Theo ngày tổ chức',
          values: [true, false, true, true, true, true, true]
        },
        {
          name: 'Theo rank',
          values: [false, true, false, false, false, true, true]
        }
      ]
    },
    {
      category: 'Cập nhật hội nghị',
      features: [
        { name: '', values: [false, false, false, false, false, true, true] }
      ]
    },
    {
      category: 'Nhận thông báo',
      features: [
        { name: '', values: [false, false, false, false, true, true, true] }
      ]
    },
    {
      category: 'Theo dõi hội nghị',
      features: [
        { name: '', values: [true, false, true, true, true, true, true] }
      ]
    },
    {
      category: 'Bình luận, đánh giá',
      features: [
        { name: '', values: [false, false, false, false, true, true, true] }
      ]
    },
    {
      category: 'Đăng hội nghị',
      features: [
        { name: '', values: [true, false, true, true, true, true, true] }
      ]
    },
    {
      category: 'Định vị hội nghị',
      features: [
        { name: '', values: [false, false, true, false, true, false, true] }
      ]
    },
    {
      category: 'Chia sẻ hội nghị',
      features: [
        { name: '', values: [false, false, false, false, true, false, true] }
      ]
    },
    {
      category: 'Danh sách đen',
      features: [
        { name: '', values: [false, false, false, false, false, false, true] }
      ]
    },
    {
      category: 'Tìm kiếm tạp chí khoa học',
      features: [
        {
          name: 'Theo quốc gia',
          values: [false, false, false, true, false, false, true]
        },
        {
          name: 'Theo lĩnh vực',
          values: [false, false, false, true, false, false, true]
        },
        {
          name: 'Theo nhà xuất bản',
          values: [false, false, false, false, false, false, true]
        }
      ]
    },
    {
      category: 'Theo dõi tạp chí',
      features: [
        { name: '', values: [false, false, false, false, false, false, true] }
      ]
    },
    {
      category: 'Chatbot',
      features: [
        { name: '', values: [false, false, false, false, false, false, true] }
      ]
    },
    {
      category: 'Vẽ biểu đồ',
      features: [
        { name: '', values: [false, false, false, false, false, false, true] }
      ]
    },
    // --- BẮT ĐẦU DỮ LIỆU MỚI TỪ ẢNH ---
    {
      category: 'Crawl thông tin hội nghị',
      features: [
        {
          name: 'Link chính',
          values: [false, false, false, false, false, true, true]
        },
        {
          name: 'Các ngày quan trọng',
          values: [false, false, false, false, false, true, true]
        },
        {
          name: 'Địa điểm',
          values: [false, false, false, false, false, true, true]
        },
        {
          name: 'Chủ đề',
          values: [false, false, false, false, false, false, true]
        },
        {
          name: 'Nhà xuất bản',
          values: [false, false, false, false, false, false, true]
        },
        {
          name: 'Call for paper',
          values: [false, false, false, false, false, true, true]
        }
      ]
    },
    {
      category: 'Phân tích kết quả crawl',
      features: [
        {
          name: 'Thời gian crawl',
          values: [false, false, false, false, false, false, true]
        },
        {
          name: 'Số lượng thành công',
          values: [false, false, false, false, false, false, true]
        },
        {
          name: 'Số lượng thất bại',
          values: [false, false, false, false, false, false, true]
        },
        {
          name: 'Số lược call API',
          values: [false, false, false, false, false, false, true]
        },
        {
          name: 'Tổng token',
          values: [false, false, false, false, false, false, true]
        },
        {
          name: 'Lọc theo thời gian',
          values: [false, false, false, false, false, false, true]
        }
      ]
    },
    {
      category: 'Tự động cập nhật',
      features: [
        {
          name: 'Theo ngày/tháng',
          values: [false, false, false, false, false, true, true]
        }
      ]
    },
    {
      category: 'Crawl tạp chí',
      features: [
        {
          name: 'Thông tin tạp chí',
          values: [false, false, false, false, false, false, true]
        },
        {
          name: 'Ảnh tạp chí',
          values: [false, false, false, false, false, false, true]
        },
        {
          name: 'Bảng phân vị',
          values: [false, false, false, false, false, false, true]
        }
      ]
    },
    {
      category: 'Duyệt hội nghị',
      features: [
        { name: '', values: [false, false, false, false, false, true, true] }
      ]
    },
    {
      category: 'Quản lí hội nghị',
      features: [
        { name: '', values: [false, false, false, false, false, true, true] }
      ]
    },
    {
      category: 'Quản lí người dùng',
      features: [
        { name: '', values: [false, false, false, false, false, true, true] }
      ]
    }
  ]

  // Mảng chứa độ rộng tùy chỉnh cho từng cột (bao gồm cả 2 cột đầu tiên)
  // Bạn có thể điều chỉnh các giá trị này theo ý muốn
  const columnWidths = ['23%', '22%', '5%', '5%', '8%', '8%', '7%', '7%', '12%']; 
  // Đảm bảo tổng các giá trị này là 100% hoặc sử dụng các đơn vị khác như 'px'

  const CheckMark = ({ isOurProduct }: { isOurProduct: boolean }) => (
    <span
      className={`font-black text-8xl ${isOurProduct ? 'text-blue-700' : 'text-purple-600'}`}
    >
      ✓
    </span>
  )

  return (
    // Bỏ border ở div ngoài, chỉ giữ lại bo góc và overflow-hidden
    <div className='overflow-hidden rounded-[31px]'>
      <table
        // Thêm border-separate, border-spacing và màu nền cho "đường kẻ"
        className='w-full border-separate border-spacing-1 bg-gray-400 text-center'
        style={{ fontSize: '90px' }}
      >
        <thead className='font-bold'>
          <tr>
            <th className='bg-purple-300 px-2 py-0' colSpan={2}></th>
            {competitors.map((name, index) => (
              <th
                key={index}
                // Bỏ border-l-2 border-white
                className={`whitespace-pre-line px-3 py-1 align-middle text-white ${
                  index === competitors.length - 1
                    ? 'bg-purple-600'
                    : 'bg-sky-500'
                }`}
                style={{ fontSize: '70px', width: columnWidths[index + 2] }} // Áp dụng độ rộng cho các cột đối thủ
              >
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='text-gray-800'>
          {comparisonData.map(group => (
            <React.Fragment key={group.category}>
              {group.features.map((feature, featureIndex) => (
                <tr
                  key={`${group.category}-${feature.name || featureIndex}`}
                  // Bỏ border-t-2 border-white
                >
                  {featureIndex === 0 && (
                    <td
                      rowSpan={group.features.length}
                      // Bỏ border-r-2 border-white
                      className='bg-purple-300 px-3 py-0 font-semibold text-purple-900'
                      style={{ width: columnWidths[0] }} // Áp dụng độ rộng cho cột "Category"
                    >
                      {group.category}
                    </td>
                  )}
                  {/* Bỏ border-r-2 border-white */}
                  <td 
                    className='bg-purple-300 px-3 pl-16 py-0 text-left font-medium text-purple-900'
                    style={{ width: columnWidths[1] }} // Áp dụng độ rộng cho cột "Feature Name"
                  >
                    {feature.name}
                  </td>
                  {feature.values.map((hasFeature, valueIndex) => (
                    <td
                      key={valueIndex}
                      // Bỏ border-l-2 border-white
                      className={`py-0 align-middle text-9xl ${
                        valueIndex === competitors.length - 1
                          ? 'bg-purple-300'
                          : 'bg-sky-100'
                      }`}
                      style={{ width: columnWidths[valueIndex + 2] }} // Áp dụng độ rộng cho các cột giá trị
                    >
                      {hasFeature ? (
                        <CheckMark
                          isOurProduct={valueIndex === competitors.length - 1}
                        />
                      ) : (
                        ''
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ComparisonTable