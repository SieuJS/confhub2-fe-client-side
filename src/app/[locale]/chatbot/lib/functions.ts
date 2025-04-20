import {
    FunctionDeclaration,
    SchemaType,
} from "@google/generative-ai";


// English
export const english_getConferencesDeclaration: FunctionDeclaration = {
    name: "getConferences",
    // Mô tả rõ mục đích là tạo query string
    description: "Generates a URL-encoded query string to search for conferences based on user-specified criteria. This query string will be used to fetch data from the backend API." +
        " It is crucial that *all* values in the query string are properly URL-encoded to ensure the backend API correctly interprets the search criteria. Failure to properly encode values can lead to incorrect search results or errors." +
        " Be mindful of the maximum length of a URL, as excessively long query strings may be truncated by browsers or servers. Consider limiting the number of `topics` or `researchFields` parameters if necessary." +
        " The backend API may be case-sensitive for certain parameters (e.g., `country`, `continent`). Ensure the casing of the values matches the expected format." +
        " A comprehensive example combining multiple criteria: `title=International+Conference+on+AI&topics=AI&topics=Machine+Learning&country=USA&fromDate=2024-01-01&toDate=2024-12-31&rank=A*`",
    parameters: {
        type: SchemaType.OBJECT, // Vẫn là OBJECT theo cấu trúc chung
        properties: {
            // Định nghĩa một tham số duy nhất để chứa query string
            searchQuery: {
                type: SchemaType.STRING,
                // Hướng dẫn chi tiết cách tạo query string
                description: "A URL-encoded query string constructed from the user's search criteria for conferences. Format as key=value pairs separated by '&'. " +
                    "Available keys based on potential user queries include: " +
                    "`title` (string):  The full, formal name of the conference.(e.g., International Conference on Management of Digital EcoSystems) " +
                    "`acronym` (string): The abbreviated name of the conference, often represented by capital letters (e.g., ICCCI, SIGGRAPH, ABZ). " +
                    "`fromDate` (string, e.g., YYYY-MM-DD), " +
                    "`toDate` (string, e.g., YYYY-MM-DD), " +
                    "`topics` (string, repeat key for multiple values, e.g., topics=AI&topics=ML), " +
                    "`cityStateProvince` (string), " +
                    "`country` (string), " +
                    "`continent` (string), " +
                    "`address` (string), " +
                    "`researchFields` (string, repeat key for multiple values), " +
                    "`rank` (string), " +
                    "`source` (string), " +
                    "`accessType` (string), " +
                    "`keyword` (string), " +
                    "`subFromDate` (string), `subToDate` (string), " +
                    "`cameraReadyFromDate` (string), `cameraReadyToDate` (string), " +
                    "`notificationFromDate` (string), `notificationToDate` (string), " +
                    "`registrationFromDate` (string), `registrationToDate` (string), " +
                    "`mode` (string): If the user requests detailed information, the value is always `detail`. " +
                    "`perPage` (number):  The number of conferences to return per page. If the user specifies a number, use that value. If the user doesn't specify a number, default to 5." +
                    "`page` (number):  The page number of the results to return. If the user wants to see the next set of conferences, use page=2, page=3, etc. If the user doesn't specify a page number, default to 1." +
                    "Ensure all values are properly URL-encoded (e.g., spaces become + or +). " +

                    "**Distinguishing between Title and Acronym:** It is crucial to correctly identify whether the user is providing the full conference title or the acronym.  Here's how to differentiate them:" +
                    "* **Title:** This is the complete, unabbreviated name of the conference.  It is typically a phrase or sentence that describes the conference's focus. Example: 'International Conference on Machine Learning'.  Use the `title` parameter for this." +
                    "* **Acronym:** This is a short, usually capitalized, abbreviation of the conference name. Example: 'ICML' (for International Conference on Machine Learning).  Use the `acronym` parameter for this." +

                    "**Examples:**" +
                    "* User query: 'Find conferences about ICML'.  `searchQuery=acronym=ICML&perPage=5&page=1` (Default perPage and page)" +
                    "* User query: 'Search for the International Conference on Management of Digital EcoSystems'. `searchQuery=title=International+Conference+on+Management+of+Digital+EcoSystems&perPage=5&page=1` (Default perPage and page)" +
                    "* User query: 'Find MEDES conferences'. `searchQuery=acronym=MEDES&perPage=5&page=1` (Default perPage and page)" +
                    "* User query: 'Search for conferences with the full name International Conference on Recent Trends in Image Processing, Pattern Recognition and Machine Learning'. `searchQuery=title=International+Conference+on+Recent+Trends+in+Image+Processing,+Pattern+Recognition+and+Machine+Learning&perPage=5&page=1` (Default perPage and page)" +
                    "* User query 1: 'Find 3 conferences in USA'. `searchQuery=country=USA&perPage=3&page=1` User query 2: 'Find 5 different conferences in USA'. `searchQuery=country=USA&perPage=5&page=2`" +

                    "For example, if a topic contains both spaces and special characters, like 'Data Science & Analysis', it should be encoded as 'Data+Science+&+Analysis'. " +
                    "If a user doesn't specify a value for a particular key, it should be omitted entirely from the query string.  Do not include keys with empty values (e.g., `title=`). " +
                    "To specify multiple topics or research fields, repeat the key for each value. For example: `topics=AI&topics=Machine+Learning&researchFields=Computer+Vision&researchFields=Natural+Language+Processing`. " +
                    "Always URL-encode special characters in values. For example, use `+` for spaces, `&` for ampersands, `=` for equals signs, and `+` for plus signs. " +
                    "To search for conferences between two dates, use `fromDate` and `toDate`. For example, to search for conferences happening between January 1, 2023, and December 31, 2023, use `fromDate=2023-01-01&toDate=2023-12-31`. " +
                    "If the user requests *detailed* information about the conferences (e.g., full descriptions, specific dates, call for papers, summary, etc.), include the parameter `mode=detail` in the query string."
            }
        },
        // Đảm bảo Gemini luôn cung cấp tham số này
        required: ["searchQuery"]
    }
};

export const english_getJournalsDeclaration: FunctionDeclaration = {
    name: "getJournals",
    description: "Retrieves information about journals based on filtering criteria.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            "Rank": {
                "type": SchemaType.ARRAY,
                "description": "List of journal ranks to filter by.",
                "items": {
                    "type": SchemaType.NUMBER
                }
            },
            "Title": {
                "type": SchemaType.ARRAY,
                "description": "List of journal titles to filter by.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Issn": {
                "type": SchemaType.ARRAY,
                "description": "List of journal ISSNs to filter by.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "SJR": {
                "type": SchemaType.ARRAY,
                "description": "List of journal SJR values to filter by.",
                "items": {
                    "type": SchemaType.NUMBER
                }
            },
            "SJRBestQuartile": {
                "type": SchemaType.ARRAY,
                "description": "List of journal SJR Best Quartile values to filter by.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "HIndex": {
                "type": SchemaType.INTEGER,
                "description": "Journal H index to filter by."
            },
            "Country": {
                "type": SchemaType.ARRAY,
                "description": "List of countries to filter journals by.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Region": {
                "type": SchemaType.ARRAY,
                "description": "List of regions to filter journals by.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Publisher": {
                "type": SchemaType.ARRAY,
                "description": "List of publishers to filter journals by.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Areas": {
                "type": SchemaType.ARRAY,
                "description": "List of areas to filter journals by.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Categories": {
                "type": SchemaType.ARRAY,
                "description": "List of categories to filter journals by.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Overton": {
                "type": SchemaType.ARRAY,
                "description": "List of Overton values to filter journals by.",
                "items": {
                    "type": SchemaType.NUMBER
                }
            },
            "SDG": {
                "type": SchemaType.ARRAY,
                "description": "List of SDGs to filter journals by.",
                "items": {
                    "type": SchemaType.STRING
                }
            }
        }
    },
};

export const english_getWebsiteInformationDeclaration: FunctionDeclaration = {
    name: "getWebsiteInformation",
    description: "Retrieves information about websites. This function don't need parameters, just call it"
};

export const english_drawChartDeclaration: FunctionDeclaration = {
    name: "drawChart",
    description: "Draws a chart based on the provided data.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            chartType: {
                type: SchemaType.STRING,
                description: "The type of chart (e.g., bar, line, pie).",
            }
        },
        required: ["chartType"],
    },
};

// --- NEW Navigation Declaration ---
// List of allowed internal paths (for the model's description)
const internalPaths = [
    '/',
    '/conferences',
    '/dashboard',
    '/journals',
    '/chatbot',
    '/visualization',
    '/chatbot/chat',
    '/chatbot/livechat',
    '/support',
    '/other',
    '/addconference',
    '/conferences/detail', // Base path, model might need to know how to get full ID path if needed
    '/journals/detail',    // Base path
    '/auth/login',
    '/auth/register',
    '/auth/verify-email',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/updateconference' // Base path
];

export const english_navigationDeclaration: FunctionDeclaration = {
    name: "navigation",
    description: `Navigates the user to a specified page within this website or to an external conference/journal website by opening a new browser tab.
    - For INTERNAL navigation: Provide the relative path starting with '/'. The system will automatically add the base URL and locale. Allowed internal paths are: ${internalPaths.join(', ')}. Example: {"url": "/conferences"}
    - For EXTERNAL conference/journal sites: Provide the full, valid URL starting with 'http://' or 'https://'. The model should typically obtain this URL from functions like 'getConferences' or 'getJournals' before calling 'navigation'. Example: {"url": "https://2025.inlgmeeting.org/"}`,
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            url: {
                type: SchemaType.STRING,
                description: `The internal path (starting with '/', e.g., '/dashboard') or the full external URL (starting with 'http://' or 'https://', e.g., 'https://some-journal.com/article') to navigate to.`
            }
        },
        required: ["url"]
    }
};


// Vietnamese
export const vietnam_getConferencesDeclaration: FunctionDeclaration = {
    name: "getConferences",
    // Mô tả rõ mục đích là tạo query string
    description: "Tạo một chuỗi truy vấn được mã hóa URL để tìm kiếm hội nghị dựa trên tiêu chí do người dùng chỉ định. Chuỗi truy vấn này sẽ được sử dụng để lấy dữ liệu từ API backend." +
        " Điều cực kỳ quan trọng là *tất cả* các giá trị trong chuỗi truy vấn phải được mã hóa URL đúng cách để đảm bảo API backend diễn giải chính xác các tiêu chí tìm kiếm. Việc không mã hóa đúng cách các giá trị có thể dẫn đến kết quả tìm kiếm sai hoặc lỗi." +
        " Lưu ý về độ dài tối đa của URL, vì các chuỗi truy vấn quá dài có thể bị cắt bớt bởi trình duyệt hoặc máy chủ. Cân nhắc giới hạn số lượng tham số `topics` hoặc `researchFields` nếu cần." +
        " API backend có thể phân biệt chữ hoa chữ thường đối với một số tham số (ví dụ: `country`, `continent`). Đảm bảo kiểu chữ hoa/thường của các giá trị khớp với định dạng mong đợi." +
        " Một ví dụ toàn diện kết hợp nhiều tiêu chí: `title=International+Conference+on+AI&topics=AI&topics=Machine+Learning&country=USA&fromDate=2024-01-01&toDate=2024-12-31&rank=A*`",
    parameters: {
        type: SchemaType.OBJECT, // Vẫn là OBJECT theo cấu trúc chung
        properties: {
            // Định nghĩa một tham số duy nhất để chứa query string
            searchQuery: {
                type: SchemaType.STRING,
                // Hướng dẫn chi tiết cách tạo query string
                description: "Một chuỗi truy vấn được mã hóa URL được xây dựng từ tiêu chí tìm kiếm hội nghị của người dùng. Định dạng dưới dạng các cặp key=value được phân tách bằng dấu '&'. " +
                    "Các khóa (key) có sẵn dựa trên các truy vấn tiềm năng của người dùng bao gồm: " +
                    "`title` (string): Tên đầy đủ, chính thức của hội nghị (ví dụ: International Conference on Management of Digital EcoSystems). " +
                    "`acronym` (string): Tên viết tắt của hội nghị, thường được biểu thị bằng chữ in hoa (ví dụ: ICCCI, SIGGRAPH, ABZ). " +
                    "`fromDate` (string, ví dụ: YYYY-MM-DD - Năm-Tháng-Ngày), " +
                    "`toDate` (string, ví dụ: YYYY-MM-DD - Năm-Tháng-Ngày), " +
                    "`topics` (string, lặp lại khóa cho nhiều giá trị, ví dụ: topics=AI&topics=ML - chủ đề=AI&chủ đề=ML), " +
                    "`cityStateProvince` (string): Thành phố/Bang/Tỉnh, " +
                    "`country` (string): Quốc gia, " +
                    "`continent` (string): Lục địa, " +
                    "`address` (string): Địa chỉ, " +
                    "`researchFields` (string, lặp lại khóa cho nhiều giá trị): Lĩnh vực nghiên cứu, " +
                    "`rank` (string): Hạng (ví dụ: A*, A, B, C), " +
                    "`source` (string): Nguồn (ví dụ: CORE, Scopus), " +
                    "`accessType` (string): Loại truy cập (ví dụ: Open Access), " +
                    "`keyword` (string): Từ khóa, " +
                    "`subFromDate` (string): Ngày bắt đầu nộp bài, `subToDate` (string): Ngày kết thúc nộp bài, " +
                    "`cameraReadyFromDate` (string): Ngày bắt đầu nộp bản hoàn chỉnh, `cameraReadyToDate` (string): Ngày kết thúc nộp bản hoàn chỉnh, " +
                    "`notificationFromDate` (string): Ngày bắt đầu thông báo chấp nhận, `notificationToDate` (string): Ngày kết thúc thông báo chấp nhận, " +
                    "`registrationFromDate` (string): Ngày bắt đầu đăng ký, `registrationToDate` (string): Ngày kết thúc đăng ký, " +
                    "`mode` (string): Nếu người dùng yêu cầu thông tin chi tiết, giá trị luôn là `detail`. " +
                    "`perPage` (number): Số lượng hội nghị trả về mỗi trang. Nếu người dùng chỉ định một số, hãy sử dụng giá trị đó. Nếu người dùng không chỉ định số, mặc định là 5." +
                    "`page` (number): Số trang của kết quả trả về. Nếu người dùng muốn xem bộ hội nghị tiếp theo, sử dụng page=2, page=3, v.v. Nếu người dùng không chỉ định số trang, mặc định là 1." +
                    "Đảm bảo tất cả các giá trị được mã hóa URL đúng cách (ví dụ: dấu cách trở thành + hoặc +). " +

                    "**Phân biệt giữa Tiêu đề (Title) và Tên viết tắt (Acronym):** Điều quan trọng là phải xác định chính xác liệu người dùng đang cung cấp tiêu đề đầy đủ của hội nghị hay tên viết tắt. Dưới đây là cách phân biệt chúng:" +
                    "* **Tiêu đề (Title):** Đây là tên đầy đủ, không viết tắt của hội nghị. Nó thường là một cụm từ hoặc câu mô tả trọng tâm của hội nghị. Ví dụ: 'International Conference on Machine Learning'. Sử dụng tham số `title` cho trường hợp này." +
                    "* **Tên viết tắt (Acronym):** Đây là một chữ viết tắt ngắn gọn, thường được viết hoa, của tên hội nghị. Ví dụ: 'ICML' (cho International Conference on Machine Learning). Sử dụng tham số `acronym` cho trường hợp này." +

                    "**Ví dụ:**" +
                    "* Truy vấn người dùng: 'Tìm hội nghị về ICML'. `searchQuery=acronym=ICML&perPage=5&page=1` (Mặc định perPage và page)" +
                    "* Truy vấn người dùng: 'Tìm kiếm International Conference on Management of Digital EcoSystems'. `searchQuery=title=International+Conference+on+Management+of+Digital+EcoSystems&perPage=5&page=1` (Mặc định perPage và page)" +
                    "* Truy vấn người dùng: 'Tìm hội nghị MEDES'. `searchQuery=acronym=MEDES&perPage=5&page=1` (Mặc định perPage và page)" +
                    "* Truy vấn người dùng: 'Tìm kiếm hội nghị có tên đầy đủ là International Conference on Recent Trends in Image Processing, Pattern Recognition and Machine Learning'. `searchQuery=title=International+Conference+on+Recent+Trends+in+Image+Processing,+Pattern+Recognition+and+Machine+Learning&perPage=5&page=1` (Mặc định perPage và page)" +
                    "* Truy vấn người dùng 1: 'Tìm 3 hội nghị ở Mỹ'. `searchQuery=country=USA&perPage=3&page=1` Truy vấn người dùng 2: 'Tìm 5 hội nghị khác ở Mỹ'. `searchQuery=country=USA&perPage=5&page=2`" +

                    "Ví dụ: nếu một chủ đề chứa cả dấu cách và ký tự đặc biệt, như 'Data Science & Analysis', nó nên được mã hóa thành 'Data+Science+&+Analysis'. " +
                    "Nếu người dùng không chỉ định giá trị cho một khóa cụ thể, nó nên được bỏ hoàn toàn khỏi chuỗi truy vấn. Không bao gồm các khóa có giá trị rỗng (ví dụ: `title=`). " +
                    "Để chỉ định nhiều chủ đề hoặc lĩnh vực nghiên cứu, hãy lặp lại khóa cho mỗi giá trị. Ví dụ: `topics=AI&topics=Machine+Learning&researchFields=Computer+Vision&researchFields=Natural+Language+Processing`. " +
                    "Luôn mã hóa URL các ký tự đặc biệt trong giá trị. Ví dụ: sử dụng `+` cho dấu cách, `&` cho dấu và, `=` cho dấu bằng, và `+` cho dấu cộng. " +
                    "Để tìm kiếm hội nghị giữa hai ngày, hãy sử dụng `fromDate` và `toDate`. Ví dụ, để tìm kiếm các hội nghị diễn ra từ ngày 1 tháng 1 năm 2023 đến ngày 31 tháng 12 năm 2023, sử dụng `fromDate=2023-01-01&toDate=2023-12-31`. " +
                    "Nếu người dùng yêu cầu thông tin *chi tiết* về các hội nghị (ví dụ: mô tả đầy đủ, ngày cụ thể, lời mời nộp bài, tóm tắt, v.v.), hãy bao gồm tham số `mode=detail` trong chuỗi truy vấn."
            }
        },
        // Đảm bảo Gemini luôn cung cấp tham số này
        required: ["searchQuery"]
    }
};

export const vietnam_getJournalsDeclaration: FunctionDeclaration = {
    name: "getJournals",
    description: "Truy xuất thông tin về các tạp chí dựa trên tiêu chí lọc.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            "Rank": {
                "type": SchemaType.ARRAY,
                "description": "Danh sách các hạng tạp chí để lọc theo.",
                "items": {
                    "type": SchemaType.NUMBER
                }
            },
            "Title": {
                "type": SchemaType.ARRAY,
                "description": "Danh sách các tiêu đề tạp chí để lọc theo.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Issn": {
                "type": SchemaType.ARRAY,
                "description": "Danh sách các mã ISSN của tạp chí để lọc theo.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "SJR": {
                "type": SchemaType.ARRAY,
                "description": "Danh sách các giá trị SJR của tạp chí để lọc theo.",
                "items": {
                    "type": SchemaType.NUMBER
                }
            },
            "SJRBestQuartile": {
                "type": SchemaType.ARRAY,
                "description": "Danh sách các giá trị Phân vị Tốt nhất SJR (SJR Best Quartile) của tạp chí để lọc theo.",
                "items": {
                    "type": SchemaType.STRING // Có thể là Q1, Q2, Q3, Q4
                }
            },
            "HIndex": {
                "type": SchemaType.INTEGER,
                "description": "Chỉ số H (H index) của tạp chí để lọc theo."
            },
            "Country": {
                "type": SchemaType.ARRAY,
                "description": "Danh sách các quốc gia để lọc tạp chí theo.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Region": {
                "type": SchemaType.ARRAY,
                "description": "Danh sách các khu vực để lọc tạp chí theo.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Publisher": {
                "type": SchemaType.ARRAY,
                "description": "Danh sách các nhà xuất bản để lọc tạp chí theo.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Areas": {
                "type": SchemaType.ARRAY,
                "description": "Danh sách các lĩnh vực (areas) để lọc tạp chí theo.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Categories": {
                "type": SchemaType.ARRAY,
                "description": "Danh sách các danh mục (categories) để lọc tạp chí theo.",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Overton": {
                "type": SchemaType.ARRAY,
                "description": "Danh sách các giá trị Overton để lọc tạp chí theo.",
                "items": {
                    "type": SchemaType.NUMBER
                }
            },
            "SDG": {
                "type": SchemaType.ARRAY,
                "description": "Danh sách các Mục tiêu Phát triển Bền vững (SDGs) để lọc tạp chí theo.",
                "items": {
                    "type": SchemaType.STRING // Thường là số hoặc mã của SDG
                }
            }
        }
    },
};

export const vietnam_getWebsiteInformationDeclaration: FunctionDeclaration = {
    name: "getWebsiteInformation",
    description: "Truy xuất thông tin về trang web. Hàm này không cần tham số, chỉ cần gọi nó."
};

export const vietnam_drawChartDeclaration: FunctionDeclaration = {
    name: "drawChart",
    description: "Vẽ biểu đồ dựa trên dữ liệu được cung cấp.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            chartType: {
                type: SchemaType.STRING,
                description: "Loại biểu đồ (ví dụ: bar (cột), line (đường), pie (tròn)).",
            }
        },
        required: ["chartType"],
    },
};

// Chinese
export const china_getConferencesDeclaration: FunctionDeclaration = {
    name: "getConferences",
    // 描述：清晰说明目的是创建查询字符串
    description: "根据用户指定的标准生成用于搜索会议的 URL 编码查询字符串。此查询字符串将用于从后端 API 获取数据。" +
        " 至关重要的是，查询字符串中的 *所有* 值都必须经过正确的 URL 编码，以确保后端 API 正确解释搜索条件。未能正确编码值可能导致错误的搜索结果或错误。" +
        " 请注意 URL 的最大长度，因为过长的查询字符串可能会被浏览器或服务器截断。如有必要，请考虑限制 `topics` 或 `researchFields` 参数的数量。" +
        " 后端 API 对某些参数（例如 `country`、`continent`）可能区分大小写。请确保值的字母大小写与预期格式匹配。" +
        " 一个结合多个标准的综合示例：`title=International+Conference+on+AI&topics=AI&topics=Machine+Learning&country=USA&fromDate=2024-01-01&toDate=2024-12-31&rank=A*`",
    parameters: {
        type: SchemaType.OBJECT, // 仍然是 OBJECT 以符合通用结构
        properties: {
            // 定义一个单一参数来包含查询字符串
            searchQuery: {
                type: SchemaType.STRING,
                // 描述：关于如何创建查询字符串的详细说明
                description: "根据用户的会议搜索标准构建的 URL 编码查询字符串。格式为以 '&' 分隔的 key=value 对。" +
                    "基于潜在用户查询的可用键包括：" +
                    "`title` (string): 会议的完整正式名称（例如：International Conference on Management of Digital EcoSystems）。" +
                    "`acronym` (string): 会议的缩写名称，通常用大写字母表示（例如：ICCCI, SIGGRAPH, ABZ）。" +
                    "`fromDate` (string, 例如：YYYY-MM-DD - 年-月-日), " +
                    "`toDate` (string, 例如：YYYY-MM-DD - 年-月-日), " +
                    "`topics` (string, 对于多个值重复键，例如：topics=AI&topics=ML - 主题=AI&主题=ML), " +
                    "`cityStateProvince` (string): 城市/州/省, " +
                    "`country` (string): 国家, " +
                    "`continent` (string): 大洲, " +
                    "`address` (string): 地址, " +
                    "`researchFields` (string, 对于多个值重复键): 研究领域, " +
                    "`rank` (string): 排名 (例如: A*, A, B, C), " +
                    "`source` (string): 来源 (例如: CORE, Scopus), " +
                    "`accessType` (string): 访问类型 (例如: Open Access - 开放获取), " +
                    "`keyword` (string): 关键词, " +
                    "`subFromDate` (string): 投稿开始日期, `subToDate` (string): 投稿截止日期, " +
                    "`cameraReadyFromDate` (string): 终稿提交开始日期, `cameraReadyToDate` (string): 终稿提交截止日期, " +
                    "`notificationFromDate` (string): 录用通知开始日期, `notificationToDate` (string): 录用通知截止日期, " +
                    "`registrationFromDate` (string): 注册开始日期, `registrationToDate` (string): 注册截止日期, " +
                    "`mode` (string): 如果用户请求详细信息，值始终为 `detail`。" +
                    "`perPage` (number): 每页返回的会议数量。如果用户指定了数量，则使用该值。如果用户未指定数量，则默认为 5。" +
                    "`page` (number): 要返回的结果页码。如果用户想查看下一组会议，请使用 page=2, page=3 等。如果用户未指定页码，则默认为 1。" +
                    "确保所有值都经过正确的 URL 编码（例如，空格变成 + 或 +）。" +

                    "**区分标题 (Title) 和缩写 (Acronym):** 正确识别用户提供的是完整的会议标题还是缩写至关重要。区分方法如下：" +
                    "* **标题 (Title):** 这是会议的完整、未缩写的名称。它通常是一个描述会议重点的短语或句子。示例：'International Conference on Machine Learning'。对此使用 `title` 参数。" +
                    "* **缩写 (Acronym):** 这是会议名称的简短、通常大写的缩写。示例：'ICML' (代表 International Conference on Machine Learning)。对此使用 `acronym` 参数。" +

                    "**示例:**" +
                    "* 用户查询：'查找关于 ICML 的会议'。 `searchQuery=acronym=ICML&perPage=5&page=1` (默认 perPage 和 page)" +
                    "* 用户查询：'搜索 International Conference on Management of Digital EcoSystems'。 `searchQuery=title=International+Conference+on+Management+of+Digital+EcoSystems&perPage=5&page=1` (默认 perPage 和 page)" +
                    "* 用户查询：'查找 MEDES 会议'。 `searchQuery=acronym=MEDES&perPage=5&page=1` (默认 perPage 和 page)" +
                    "* 用户查询：'搜索全称为 International Conference on Recent Trends in Image Processing, Pattern Recognition and Machine Learning 的会议'。 `searchQuery=title=International+Conference+on+Recent+Trends+in+Image+Processing,+Pattern+Recognition+and+Machine+Learning&perPage=5&page=1` (默认 perPage 和 page)" +
                    "* 用户查询 1: '查找美国的 3 个会议'。 `searchQuery=country=USA&perPage=3&page=1` 用户查询 2: '查找美国的另外 5 个会议'。 `searchQuery=country=USA&perPage=5&page=2`" +

                    "例如，如果一个主题同时包含空格和特殊字符，如 'Data Science & Analysis'，则应编码为 'Data+Science+&+Analysis'。" +
                    "如果用户未为特定键指定值，则应将其完全从查询字符串中省略。不要包含值为空的键（例如 `title=`）。" +
                    "要指定多个主题或研究领域，请为每个值重复该键。例如：`topics=AI&topics=Machine+Learning&researchFields=Computer+Vision&researchFields=Natural+Language+Processing`。" +
                    "始终对值中的特殊字符进行 URL 编码。例如，使用 `+` 表示空格，`&` 表示 & 符号，`=` 表示等号，`+` 表示加号。" +
                    "要搜索两个日期之间的会议，请使用 `fromDate` 和 `toDate`。例如，要搜索 2023 年 1 月 1 日至 2023 年 12 月 31 日之间举行的会议，请使用 `fromDate=2023-01-01&toDate=2023-12-31`。" +
                    "如果用户请求有关会议的 *详细* 信息（例如，完整描述、具体日期、征稿启事、摘要等），请在查询字符串中包含参数 `mode=detail`。"
            }
        },
        // 描述：确保 Gemini 始终提供此参数
        required: ["searchQuery"]
    }
};

export const china_getJournalsDeclaration: FunctionDeclaration = {
    name: "getJournals",
    description: "根据筛选条件检索期刊信息。",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            "Rank": {
                "type": SchemaType.ARRAY,
                "description": "用于筛选的期刊排名列表。",
                "items": {
                    "type": SchemaType.NUMBER
                }
            },
            "Title": {
                "type": SchemaType.ARRAY,
                "description": "用于筛选的期刊标题列表。",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Issn": {
                "type": SchemaType.ARRAY,
                "description": "用于筛选的期刊 ISSN 列表。",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "SJR": {
                "type": SchemaType.ARRAY,
                "description": "用于筛选的期刊 SJR 值列表。",
                "items": {
                    "type": SchemaType.NUMBER
                }
            },
            "SJRBestQuartile": {
                "type": SchemaType.ARRAY,
                "description": "用于筛选的期刊 SJR 最佳分区 (SJR Best Quartile) 值列表。",
                "items": {
                    "type": SchemaType.STRING // 可能是 Q1, Q2, Q3, Q4
                }
            },
            "HIndex": {
                "type": SchemaType.INTEGER,
                "description": "用于筛选的期刊 H 指数 (H index)。"
            },
            "Country": {
                "type": SchemaType.ARRAY,
                "description": "用于筛选期刊的国家列表。",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Region": {
                "type": SchemaType.ARRAY,
                "description": "用于筛选期刊的地区列表。",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Publisher": {
                "type": SchemaType.ARRAY,
                "description": "用于筛选期刊的出版商列表。",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Areas": {
                "type": SchemaType.ARRAY,
                "description": "用于筛选期刊的领域 (areas) 列表。",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Categories": {
                "type": SchemaType.ARRAY,
                "description": "用于筛选期刊的类别 (categories) 列表。",
                "items": {
                    "type": SchemaType.STRING
                }
            },
            "Overton": {
                "type": SchemaType.ARRAY,
                "description": "用于筛选期刊的 Overton 值列表。",
                "items": {
                    "type": SchemaType.NUMBER
                }
            },
            "SDG": {
                "type": SchemaType.ARRAY,
                "description": "用于筛选期刊的可持续发展目标 (SDGs) 列表。",
                "items": {
                    "type": SchemaType.STRING // 通常是 SDG 的编号或代码
                }
            }
        }
    },
};

export const china_getWebsiteInformationDeclaration: FunctionDeclaration = {
    name: "getWebsiteInformation",
    description: "检索有关网站的信息。此函数不需要参数，直接调用即可。"
};

export const china_drawChartDeclaration: FunctionDeclaration = {
    name: "drawChart",
    description: "根据提供的数据绘制图表。",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            chartType: {
                type: SchemaType.STRING,
                description: "图表的类型（例如：bar (柱状图), line (折线图), pie (饼图)）。",
            }
        },
        required: ["chartType"],
    },
};

