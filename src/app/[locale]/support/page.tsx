'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { Header } from '../utils/Header'
import Footer from '../utils/Footer'

const FAQ = ({ locale }: { locale: string }) => {
  const t = useTranslations('FAQ')
  const { theme } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null) // State for selected category

  // Define FAQ categories and data
  const faqCategories = [
    {
      name: t('categoryAboutWebsite') || 'Về trang web', // Translated category names
      value: 'about_website'
    },
    {
      name: t('categoryAccount') || 'Về tài khoản',
      value: 'account'
    },
    {
      name: t('categoryConferenceJournal') || 'Về Hội nghị/tạp chí',
      value: 'conference_journal'
    },
    {
      name: t('categoryPostConference') || 'Về Đăng tải thông tin Hội nghị',
      value: 'post_conference'
    },
    {
      name: t('categoryFavorite') || 'Tính năng "Yêu thích" và thông báo',
      value: 'favorite_feature'
    },
    {
      name: t('categoryChatbot') || 'Về Chatbot',
      value: 'chatbot'
    }
  ]

  const faqData = [
    // Về trang web
    {
      category: 'about_website',
      question: 'Trang web này là gì?',
      answer:
        'HCMUS là nền tảng tổng hợp thông tin toàn diện về các hội nghị và tạp chí khoa học trên toàn thế giới. Mục đích của chúng tôi là giúp các nhà nghiên cứu, học giả và sinh viên dễ dàng tìm kiếm và tiếp cận các sự kiện và ấn phẩm khoa học phù hợp với lĩnh vực của mình.'
    },
    {
      category: 'about_website',
      question:
        'Trang web cung cấp thông tin về những loại hội nghị/tạp chí khoa học nào?',
      answer:
        'Chúng tôi tổng hợp thông tin từ nhiều lĩnh vực khoa học khác nhau, bao gồm khoa học tự nhiên, khoa học xã hội, kỹ thuật, y học, và nhiều lĩnh vực liên ngành khác. Mục tiêu là bao phủ đa dạng các lĩnh vực nghiên cứu.'
    },
    {
      category: 'about_website',
      question:
        'Thông tin trên trang web được cập nhật thường xuyên như thế nào?',
      answer:
        'Chúng tôi cập nhật thông tin hàng ngày để đảm bảo bạn luôn có được những thông tin mới nhất về các hội nghị và tạp chí khoa học. Thông tin được tự động tổng hợp liên tục từ các trang thông tin chính thức của các hội nghị/tạp chí mà chúng tôi phát hiện được.'
    },
    {
      category: 'about_website',
      question: 'Tôi có cần trả phí để sử dụng trang web này không?',
      answer:
        'Hiện tại, các tính năng của trang web là hoàn toàn miễn phí cho tất cả người dùng mà không cần phải đăng nhập. Tuy nhiên, một số tính năng nâng cao có thể yêu cầu đăng ký tài khoản để tăng giới hạn sử dụng. Chúng tôi có thể giới thiệu các gói thành viên trong tương lai để hỗ trợ phát triển trang web.'
    },
    {
      category: 'about_website',
      question:
        'Tôi có thể liên hệ với đội ngũ quản lý trang web bằng cách nào?',
      answer:
        'Bạn có thể liên hệ với chúng tôi qua trang "Liên hệ" trên website hoặc gửi email trực tiếp đến [địa chỉ email]. Chúng tôi luôn sẵn sàng lắng nghe phản hồi và giải đáp thắc mắc của bạn.'
    },

    // Về tài khoản
    {
      category: 'account',
      question: 'Làm thế nào để đăng ký tài khoản trên trang web?',
      answer:
        'Để đăng ký tài khoản, bạn chỉ cần nhấp vào nút "Đăng ký" ở góc trên bên phải màn hình và điền vào mẫu đăng ký với thông tin cần thiết (email, mật khẩu, tên người dùng...). Sau khi hoàn tất, bạn sẽ nhận được email xác nhận để kích hoạt tài khoản.'
    },
    {
      category: 'account',
      question: 'Những lợi ích nào có sẵn cho người dùng đã đăng ký tài khoản?',
      answer:
        'Có rất nhiều lợi ích dành cho những người dùng đã đăng ký:\n• Đăng tải thông tin hội nghị và chỉnh sửa thông tin của hội nghị đó.\n• Lưu lại các hội nghị/tạp chí mà mình quan tâm và được thông báo khi có thay đổi mới với những hội nghị đó.\n• Có thể tự cập nhật thông tin mới nhất về các hội nghị /tạp chí đang theo dõi.\n• Tăng giới hạn số lượt sử dụng chatbot tư vấn độc quyền của chúng tôi.\n• Được gợi ý nội dung phù hợp như các hội nghị diễn ra lân cận hoặc cùng thời điểm, các khách sạn gần nơi tổ chức hội nghị…'
    },
    {
      category: 'account',
      question: 'Làm thế nào để đăng nhập vào tài khoản của tôi?',
      answer:
        'Để đăng nhập, nhấp vào nút "Đăng nhập" ở góc trên bên phải màn hình và nhập email và mật khẩu bạn đã đăng ký.'
    },
    {
      category: 'account',
      question: 'Tôi quên mật khẩu đăng nhập, tôi phải làm gì?',
      answer:
        'Nếu bạn quên mật khẩu, hãy nhấp vào liên kết "Quên mật khẩu" trên trang đăng nhập. Chúng tôi sẽ gửi email hướng dẫn bạn đặt lại mật khẩu.'
    },
    {
      category: 'account',
      question:
        'Liệu tôi có thể thay đổi thông tin cá nhân cho tài khoản của mình?',
      answer:
        'Bạn hoàn toàn có thể cập nhật các thông tin cá nhân cho tài khoản của mình trong trang “Hồ sơ cá nhân” từ menu người dùng của bạn.'
    },
    {
      category: 'account',
      question: 'Tôi có thể xóa tài khoản của mình không?',
      answer:
        'Có, bạn có thể xóa tài khoản của mình bằng cách vào trang “Xóa tài khoản” từ menu người dùng của bạn và thực hiện theo hướng dẫn.'
    },

    // Về Hội nghị/tạp chí
    {
      category: 'conference_journal',
      question:
        'Nguồn thông tin hội nghị/tạp chí trên trang web được lấy từ đâu?',
      answer:
        'Chúng tôi tổng hợp danh sách các hội nghị/tạp chí hiện có từ CORE Portal (đối với hội nghị) và SCImago Journal Rank (đối với tạp chí) rồi thu thập thông tin từ trang web chính thức của các hội nghị/tạp chí (nếu có).'
    },
    {
      category: 'conference_journal',
      question:
        'Làm thế nào để tìm kiếm thông tin về một hội nghị/tạp chí cụ thể?',
      answer:
        'Bạn có thể sử dụng thanh tìm kiếm ở đầu trang và nhập tên hội nghị/tạp chí, từ khóa liên quan đến chủ đề, hoặc ISSN/ISBN (nếu biết). Bạn cũng có thể duyệt qua danh sách hội nghị/tạp chí theo lĩnh vực hoặc sử dụng các bộ lọc nâng cao.'
    },
    {
      category: 'conference_journal',
      question: 'Những thông tin gì được cung cấp cho mỗi hội nghị/tạp chí?',
      answer:
        'Đối với mỗi hội nghị/tạp chí, chúng tôi cung cấp các thông tin chính sau:\n• Tên đầy đủ và tên viết tắt (nếu có)\n• Lĩnh vực nghiên cứu\n• Thời gian và địa điểm (đối với hội nghị)\n• Thời hạn nộp bài (đối với hội nghị và tạp chí)\n• Các mốc thời gian quan trọng khác (đối với hội nghị): notification, camera-ready…\n• Hình thức tổ chức (đối với hội nghị): offline, online hoặc hybrid \n• Website chính thức\n• Chỉ số trích dẫn (nếu có, đối với tạp chí)\n• Mô tả ngắn gọn và các thông tin liên quan khác.'
    },
    {
      category: 'conference_journal',
      question:
        'Tôi có thể lọc và sắp xếp danh sách hội nghị/tạp chí theo tiêu chí nào?',
      answer:
        'Bạn có thể lọc và sắp xếp danh sách theo nhiều tiêu chí khác nhau, ví dụ:\n• Chủ đề nghiên cứu\n• Ngày tổ chức (đối với hội nghị)\n• Hạn nộp bài\n• Địa điểm, quốc gia, lục địa\n• Thứ tự chữ cái (A-Z, Z-A)'
    },
    {
      category: 'conference_journal',
      question:
        'Tôi có thể báo cáo vi phạm bản quyền hoặc thông tin sai trên trang web bằng cách nào?',
      answer:
        'Nếu bạn phát hiện bất kỳ thông tin sai hoặc vi phạm bản quyền nào trên trang web này, bạn có thể sử dụng tính năng Report để báo cáo cho chúng tôi.'
    },
    {
      category: 'conference_journal',
      question:
        'Trang web có đánh giá hoặc xếp hạng các hội nghị/tạp chí khoa học không?',
      answer:
        'Chúng tôi có cung cấp dữ liệu xếp hạng các hội nghị / tạp chí khoa học từ từ CORE Portal (đối với hội nghị) và SCImago Journal Rank (đối với tạp chí).'
    },
    {
      category: 'conference_journal',
      question:
        'Tôi có thể chia sẻ thông tin hội nghị/ tạp chí từ trang web này lên mạng xã hội không?',
      answer:
        'Trên hệ thống của chúng tôi có tích hợp tính năng chia sẻ thông tin hội nghị / tạp chí lên các mạng xã hội phổ biến như Facebook, Youtube, X (Twitter)…'
    },
    // Về Đăng tải thông tin Hội nghị
    {
      category: 'post_conference',
      question: 'Ai có thể đăng tải thông tin hội nghị lên trang web?',
      answer:
        'Hiện tại, chỉ người dùng đã đăng ký tài khoản trên trang web mới có thể đăng tải thông tin hội nghị. Điều này giúp chúng tôi quản lý chất lượng thông tin và hạn chế thông tin không chính xác.'
    },
    {
      category: 'post_conference',
      question:
        'Liệu các bạn có thể giúp tôi đăng hội nghị lên hệ thống không?',
      answer:
        'HCMUS là một nền tảng tổng hợp thông tin hội nghị, nghĩa là chúng tôi không tham gia vào việc tổ chức bất kỳ hội nghị nào được liệt kê trên trang web này.\n\nNếu bạn muốn đăng thông tin một hội nghị lên trang web này, bạn có thể sử dụng tài khoản của bạn truy cập tính năng Đăng tải hội nghị để thực hiện đăng thông tin hội nghị lên trang web của chúng tôi.'
    },
    {
      category: 'post_conference',
      question: 'Làm thế nào để đăng tải thông tin một hội nghị?',
      answer:
        'Sau khi đăng nhập, bạn sẽ thấy nút "Đăng tải hội nghị" ở trang chủ. Nhấp vào nút này và điền vào mẫu đăng tải hội nghị với đầy đủ thông tin yêu cầu.'
    },
    {
      category: 'post_conference',
      question: 'Những thông tin gì cần thiết để đăng tải một hội nghị?',
      answer:
        'Chúng tôi yêu cầu các thông tin sau để đăng tải hội nghị:\n• Tên hội nghị (tiếng Việt và tiếng Anh nếu có)\n• Lĩnh vực nghiên cúu\n• Thời gian và địa điểm diễn ra\n• Hạn nộp bài\n• Website chính thức của hội nghị\n• Mô tả ngắn gọn về hội nghị (tóm tắt chủ đề, mục tiêu...)\nNgoài ra bạn có thể cung cấp thêm một số thông tin khác (ví dụ: các mốc thời gian quan trọng…) để thông tin hội nghị được chi tiết hơn.'
    },
    {
      category: 'post_conference',
      question:
        'Tôi có thể chỉnh sửa thông tin hội nghị sau khi đã đăng tải không?',
      answer:
        'Có, bạn có thể chỉnh sửa thông tin hội nghị mà bạn đã đăng tải. Sau khi đăng nhập, bạn có thể tìm thấy danh sách các hội nghị bạn đã đăng tải trong trang "Quản lý nội dung". Tại đó, bạn có thể chỉnh sửa hoặc xóa thông tin.'
    },
    {
      category: 'post_conference',
      question:
        'Có quy định hoặc hướng dẫn nào cho việc đăng tải thông tin hội nghị không?',
      answer:
        'Chúng tôi khuyến khích bạn cung cấp thông tin đầy đủ và chính xác nhất có thể. Vui lòng kiểm tra kỹ thông tin trước khi đăng tải. Tránh đăng tải thông tin sai lệch, spam hoặc nội dung không phù hợp. Chúng tôi có quyền từ chối hoặc chỉnh sửa các thông tin đăng tải không đáp ứng yêu cầu.'
    },
    {
      category: 'post_conference',
      question: 'Liệu tôi có thể đăng tải thông tin tạp chí không?',
      answer:
        'Hiện tại chúng tôi chưa cho phép đăng tải thông tin tạp chí vì thông tin tạp chí rất khó kiểm soát chất lượng.'
    },

    // Tính năng "Yêu thích" và thông báo
    {
      category: 'favorite_feature',
      question: 'Làm thế nào để thêm một hội nghị vào danh sách theo dõi?',
      answer:
        'Khi bạn xem thông tin chi tiết của một hội nghị, bạn sẽ thấy nút "Yêu thích”. Nhấp vào biểu tượng này để thêm hội nghị vào danh sách theo dõi của bạn.'
    },
    {
      category: 'favorite_feature',
      question: 'Làm thế nào để xem danh sách "Yêu thích" của tôi?',
      answer:
        'Sau khi đăng nhập, bạn có thể truy cập danh sách "Yêu thích" của mình thông qua menu người dùng.'
    },
    {
      category: 'favorite_feature',
      question: 'Tính năng thông báo hoạt động như thế nào?',
      answer:
        'Khi bạn thêm một hội nghị vào danh sách "Yêu thích", hệ thống sẽ tự động theo dõi các thông tin liên quan đến hội nghị đó (ví dụ: thời hạn, địa điểm, cập nhật thông tin mới...) từ trang web chính thức của hội nghị đó. Nếu có bất kỳ thay đổi nào, bạn sẽ nhận được thông báo qua email và/hoặc thông báo trên trang web (tùy thuộc vào cài đặt thông báo của bạn).'
    },
    {
      category: 'favorite_feature',
      question:
        'Tôi sẽ nhận được thông báo về những thay đổi nào của hội nghị trong danh sách "Yêu thích"?',
      answer:
        'Bạn sẽ nhận được thông báo về các thay đổi quan trọng sau:\n• Thay đổi thời hạn nộp bài\n• Thay đổi địa điểm tổ chức\n• Cập nhật chương trình hội nghị\n• Các thay đổi liên quan đến các mốc thời gian quan trọng'
    },
    {
      category: 'favorite_feature',
      question: 'Tôi có thể tùy chỉnh cài đặt thông báo không?',
      answer:
        'Có, bạn có thể tùy chỉnh cài đặt thông báo trong trang "Cài đặt tài khoản". \nBạn có thể chọn loại thông báo bạn muốn nhận (ví dụ: chỉ nhận thông báo qua email, hoặc cả email và thông báo trên web) và tần suất thông báo.'
    },

    //Về Chatbot
    {
      category: 'chatbot',
      question: 'Chatbot có thể giúp tôi những gì?',
      answer:
        'Chatbot của chúng tôi được thiết kế để tư vấn cho bạn nhanh chóng về các vấn đề liên quan đến hội nghị và tạp chí khoa học. Bạn có thể hỏi chatbot về:\n• Thông tin chung về một hội nghị/tạp chí cụ thể\n• Các hội nghị/tạp chí trong một lĩnh vực nhất định\n• Hạn nộp bài của hội nghị\n• Các vấn đề liên quan đến đăng tải hội nghị (nếu bạn đã đăng ký)\n• Các câu hỏi liên quan đến thống kê hội nghị / tạp chí (Đặc biệt: Có hỗ trợ vẽ biểu đồ)\n• ... và nhiều câu hỏi khác liên quan đến nội dung trang web.\n\nĐặc biệt, chatbot của chúng tôi còn có khả năng tư vấn cho bạn về hội nghị phù hợp với bài báo, nhu cầu của bạn. Chỉ cần bạn upload bài báo của bạn lên hệ thống và chatbot sẽ tư vấn cho bạn mọi vấn đề mà bạn thắc mắc.'
    },
    {
      category: 'chatbot',
      question: 'Làm thế nào để sử dụng chatbot?',
      answer:
        'Biểu tượng chatbot nằm ở góc dưới bên phải của trang web. Nhấp vào biểu tượng đó để mở trang web chat và bắt đầu trò chuyện với chatbot. Bạn có thể nhập câu hỏi của mình vào khung chat và chatbot sẽ cố gắng trả lời bạn ngay lập tức. \nChatbot của chúng tôi có hỗ trợ xử lí file văn bản, hình ảnh, video. Chúng tôi đang phát triển tính năng giao tiếp trực tiếp với chatbot thông qua giọng nói để tăng cường trải nghiệm của người dùng.'
    },
    {
      category: 'chatbot',
      question: 'Tôi có thể tải lên những loại file nào cho chatbot?',
      answer:
        'Hiện tại chúng tôi đang hỗ trợ các loại file sau:\n• Văn bản: PDF, TXT, CSV\n• Video: MP4\n• Hình ảnh: JPG, PNG\nChúng tôi đang nỗ lực để hỗ trợ thêm nhiều định dạng file khác trong tương lai.'
    },
    {
      category: 'chatbot',
      question:
        'Người dùng không đăng nhập được sử dụng chatbot bao nhiêu lần?',
      answer:
        'Người dùng không đăng ký tài khoản vẫn có thể sử dụng chatbot với một số giới hạn sau:\n• Số lượt hỏi giới hạn, hiện tại là 5 lượt/ngày.\n• Được up 1 tập tin/ngày và không quá … (không hỗ trợ upload video).\n• Không được thay đổi model trả lời câu hỏi.\n• Lịch sử chat không được lưu lại.\nChúng tôi khuyến khích bạn đăng ký tài khoản để trải nghiệm đầy đủ các tính năng, bao gồm cả việc sử dụng chatbot với nhiều giới hạn hơn.'
    },
    {
      category: 'chatbot',
      question:
        'Có những lợi ích gì dành cho người dùng đã đăng ký tài khoản trong việc sử dụng chatbot không?',
      answer:
        'Những lợi ích dành cho người dùng đã đăng ký tài khoản trong việc sử dụng chatbot:\n• Nhiều lượt hỏi hơn (tối đa … lần/ ngày)\n• Mở rộng giới hạn upload tập tin (cho phép upload video lên hệ thống)\n• Được thay đổi tùy ý giữa 3 loại model mà chúng tôi hỗ trợ.\n• Lịch sử chat được lưu lại tự động.'
    },
    {
      category: 'chatbot',
      question:
        'Kết quả trả lời từ chatbot có chính xác và đáng tin cậy không?',
      answer:
        'Chatbot của chúng tôi được huấn luyện với dữ liệu lớn và sử dụng các thuật toán tiên tiến để đưa ra gợi ý phù hợp nhất. Tuy nhiên, đây vẫn là một công cụ hỗ trợ và gợi ý. Bạn nên xem xét kỹ lưỡng các hội nghị được gợi ý và tự đánh giá mức độ phù hợp với nhu cầu của mình trước khi đưa ra quyết định cuối cùng.'
    },
    {
      category: 'chatbot',
      question:
        'Dữ liệu tôi tải lên có được bảo mật không? Trang web có lưu trữ dữ liệu của tôi không?',
      answer:
        'Chúng tôi cam kết bảo mật thông tin cá nhân và dữ liệu của người dùng. Các tập tin dữ liệu bạn tải lên chỉ được sử dụng cho mục đích phân tích và trả lời câu hỏi trong phiên chat hiện tại. Chúng tôi không lưu trữ chúng sau khi phiên chat kết thúc.'
    },
    {
      category: 'chatbot',
      question:
        'Nếu chatbot không thể trả lời câu hỏi của tôi, tôi nên làm gì?',
      answer:
        'Chatbot của chúng tôi vẫn đang trong quá trình phát triển và có thể chưa thể trả lời mọi câu hỏi. Nếu chatbot không thể giúp bạn, bạn có thể:\n• Tìm kiếm thông tin trên trang web bằng thanh tìm kiếm.\n• Xem trang FAQ để tìm câu trả lời cho các câu hỏi thường gặp.\n• Liên hệ với bộ phận hỗ trợ khách hàng của chúng tôi qua email … để được hỗ trợ trực tiếp.'
    }
  ]

  const filteredFaqData = faqData.filter(
    item =>
      (selectedCategory === null || item.category === selectedCategory) && // Filter by category
      (searchTerm === '' ||
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())) // Filter by search term
  )

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setExpandedIndex(null) // Collapse all accordions when searching
  }

  const handleCategoryClick = (categoryValue: string | null) => {
    setSelectedCategory(categoryValue)
    setExpandedIndex(null) // Collapse all accordions when category changes
    setSearchTerm('') // Clear search term when category changes
  }

  return (
    <>
      <Header locale={locale} />
      <div className='w-full bg-gradient-to-r from-background to-background-secondary p-14'>
        {' '}
        {/* Added padding */}
        <div className='container relative grid grid-cols-1 items-center gap-4 md:grid-cols-5'>
          <div className='relative mt-6 h-[200px] animate-float-up-down max-lg:hidden md:col-span-1 md:h-[200px]'>
            {' '}
            {/* Image left - fixed height */}
            {/* <Image
              src='/s1.png'
              alt='Background image left'
              layout='fill' // Use fill layout
              objectFit='contain'
              className='object-contain'
            /> */}
          </div>
          <div className='flex flex-col items-center md:col-span-3'>
            {' '}
            {/* Title and search bar column */}
            <h2 className='pt-28 text-center text-3xl font-bold'>
              {t('How can we help you?')}
            </h2>{' '}
            {/* Removed pt-40 */}
          </div>
          <div className='relative mt-10 h-[200px] animate-float-up-down max-lg:hidden md:col-span-1 md:h-[200px]'>
            {' '}
            {/* Image left - fixed height */}
            {/* <Image
              src='/s2.png'
              alt='Background image left'
              layout='fill' // Use fill layout
              objectFit='contain'
              className='object-contain'
            /> */}
          </div>
        </div>
        {/* Search Bar */}
        <div className='relative mx-20 mb-12 md:mx-40 lg:mx-60 '>
          {' '}
          {/* Increased mb for spacing */}
          <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
            <svg
              className='h-5 w-5 '
              viewBox='0 0 20 20'
              fill='currentColor'
              aria-hidden='true'
            >
              <path
                fillRule='evenodd'
                d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <input
            type='text'
            className='block w-full rounded-full border border-background-secondary bg-background py-6 pl-10 pr-3 shadow-sm focus:border-background-secondary focus:outline-none focus:ring-1 focus:ring-background-secondary sm:text-sm' // Increased py-3 for taller search bar
            placeholder={t('searchPlaceholder') || 'Describe your issue'}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        {/* Two-Column Layout */}
        <div className='mx-12 flex gap-4'>
          {' '}
          {/* Using grid for 2-column layout */}
          {/* Left Column - Categories */}
          <div className='w-full rounded-lg  p-4 shadow-lg md:w-1/3'>
            {' '}
            {/* Adjusted width for smaller screens */}
            <h3 className='mb-4 text-lg font-semibold'>
              {t('categoriesTitle') || 'Categories'}
            </h3>
            <ul className='space-y-2'>
              <li
                key='all'
                className={`cursor-pointer py-1  ${selectedCategory === null ? 'font-bold ' : ''}`}
                onClick={() => handleCategoryClick(null)}
              >
                {t('categoryAll') || 'All'}
              </li>
              {faqCategories.map(category => (
                <li
                  key={category.value}
                  className={`cursor-pointer py-1  ${selectedCategory === category.value ? 'font-bold ' : ''}`}
                  onClick={() => handleCategoryClick(category.value)}
                >
                  {category.name}
                </li>
              ))}
            </ul>
          </div>
          {/* Right Column - Questions and Answers */}
          <div className='w-full rounded-lg  p-4 shadow-xl md:w-2/3'>
            {' '}
            {/* Adjusted width for smaller screens */}
            <div className='space-y-4'>
              {filteredFaqData.map((item, index) => (
                <div key={index} className='rounded-lg border shadow-sm'>
                  <div
                    className='flex cursor-pointer items-center justify-between px-4 py-3'
                    onClick={() => toggleAccordion(index)}
                  >
                    <h3 className='text-lg font-semibold'>{item.question}</h3>
                    <svg
                      className={`h-5 w-5 transition-transform duration-200 ${expandedIndex === index ? 'rotate-180' : ''}`}
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M19 9l-7 7-7-7'
                      ></path>
                    </svg>
                  </div>
                  {expandedIndex === index && (
                    <div className='px-4 pb-4 pt-0'>
                      <p className=''>{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
              {filteredFaqData.length === 0 && (
                <p className='text-gray-500'>
                  {t('noResultsFound') ||
                    'No questions found in this category or matching your search.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default FAQ
