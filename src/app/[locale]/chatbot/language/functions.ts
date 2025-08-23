import {
    FunctionDeclaration,
    Type,
} from "@google/genai";



export const websiteInfo = `Guide to Using the FIT-Conference Hub (GCJH)

## PART 1: GENERAL WEBSITE OVERVIEW

**1. Website Name:** FIT-Conference Hub (GCJH)

**2. Website Overview:**
GCJH is a comprehensive online platform designed to connect researchers, academics, and professionals with relevant conferences and journals across all disciplines globally. We provide a centralized, searchable database with detailed information to facilitate efficient research and networking opportunities. Our goal is to simplify the process of discovering and participating in relevant academic events and accessing high-quality scholarly publications.

**3. Key Features:**
*   **Comprehensive Database:** Includes thousands of conferences and journals covering diverse fields and geographic locations, updated regularly.
    *   **Conferences:** Name, dates, location, organizers, submission deadlines, registration fees, call for papers, speakers, accepted papers, contact info, official website link.
    *   **Journals:** Name, ISSN, publisher, impact factor, subject areas, open access status, indexing databases (Scopus, WoS), call for papers/submissions, editorial board info, official website link.
*   **Advanced Search Functionality:** Search by keywords, subject area, dates, location, publication type, supports Boolean operators (AND, OR, NOT). (See details in Section 4.4)
*   **Personalized Profile (for registered users):** Save search preferences, follow conferences/journals, receive notifications. (See Sections 4.9 and 4.8)
*   **Calendar Integration:** Add conference dates to personal calendars (Google Calendar, Outlook, etc.). (See Section 4.5.3)
*   **Alert System:** Set up alerts to receive notifications about new relevant conferences/journals. (Accessed via Notifications - Section 4.8.7, Settings - Section 4.8.9)
*   **AI-Powered Chatbot:** Integrated virtual assistant providing instant support.
    *   **Capabilities:** Answer FAQs, assist with searches (understand intent, suggest keywords/filters, handle Boolean operators), extract specific information (e.g., keynote speakers), summarize content (with disclaimers), provide multilingual support, offer personalized recommendations. (See chatbot usage guide in Section 4.12)
*   **Data Visualization and Analysis (Dashboard):** For registered users, accessed via 'Analysis' (Section 4.8.2). Provides data visualization tools:
    *   Conference trends (by time, field, location).
    *   Journal impact (impact factor, citation trends).
    *   Research field analysis (interactive maps, charts).
    *   Personalized statistics (saved items, search history, alerts).
    *   Customizable dashboard. (See usage guide for Visualize/Analysis page in Section 4.11)
*   **Data Contribution:** Users can add new conference information. (See Section 4.10)
*   **Contribution Management:** Users manage submitted conferences and track review status. (See Section 4.8.4)
*   **Conference Following:** Save and manage a list of interesting conferences. (See Section 4.8.5)
*   **Personal Schedule:** View important dates of followed conferences on a calendar. (See Section 4.8.6)
*   **Community Forum (future development):** A place to connect, discuss, share information.

## PART 2: DETAILED WEBSITE USAGE GUIDE

**4. How to Use the Website:**

    **4.1. Login (For users with an existing account)**
        1.  Access Homepage: Open the FIT-Conference Hub website.
        2.  Click Login Button: Find and click the 'Login' button in the top-right corner of the screen.
        3.  Login Page: On the 'Welcome to FIT-Conference Hub' page, choose one of the methods:
            *   **Login with Google:** Click the 'Continue with Google' button.
            *   **Login with Email:**
                *   Enter your Email address in the corresponding field.
                *   Enter your Password in the field below.
                *   Click the 'Sign In' button.
            *   **Forgot Password?:** Click the 'Forgot Password?' link.

    **4.2. Register a New Account (For users without an account)**
        1.  Access Homepage: Open the FIT-Conference Hub website.
        2.  Click Login Button: Click the 'Login' button in the top-right corner.
        3.  Go to Registration Page: On the login page, find and click the 'Sign Up Now' link at the bottom.
        4.  Fill Registration Information: On the 'Create your account' page, fill in all required information (fields marked with * are mandatory):
            *   First Name *
            *   Last Name *
            *   Date of Birth *
            *   Email *
            *   Password *
            *   Confirm Password *
        5.  Create Account: Click the 'Create account' button.
        6.  Verify Email:
            *   Check your email for a 6-digit verification code (check Spam/Junk folders too).
            *   Enter the code into the 'Verification Code' field.
            *   Click the 'Verify Account' button.
            *   If you didn't receive the code, click 'Resend code'.
        7.  Complete Verification:
            *   You will see a 'User verified' message.
            *   Click the 'Return to home page' button.
        8.  Login: Use the email and password you just created to log in following Section 4.1.

    **4.3. General Navigation:** The website has a user-friendly interface and intuitive navigation. Browse by subject area, location, or use the search bar.

    **4.4. Searching for Conferences:**
        *   **4.4.1. Basic Search:**
            *   **Main Search Bar:** Enter conference name, acronym, or field keywords into the 'Type a command or search...' box.
            *   **Dates:** Select start (Start) and end (End) dates.
            *   **Location:** Enter country/city into the 'Location' box.
            *   **Type:** Select the event type (if available).
            *   **Start Search:** Press the 'Search' button.
            *   **Clear Filters:** Press the 'Clear' button.
            *   **Results:** A list of conferences ('Conference Results') will be displayed.
        *   **4.4.2. Advanced Search:**
            *   **Show Filters:** Click the 'Show/Hide advanced search options' link.
            *   **Fill Advanced Filters:** Submission Date, Publisher, Rank, Source, Avg. Score, Topics, Field of Research.
            *   **Start Advanced Search:** Press the 'Search' button.
            *   **Results:** The list will be filtered more precisely.

    **4.5. Viewing Conference/Journal Details:**
        *   **4.5.1. Accessing Detail Page:** Click on the conference/journal name from the search results list.
        *   **4.5.2. Conference Detail Page Content:**
            *   Warnings (if any).
            *   Basic Information: Full name, image, rating, status.
            *   Topics.
            *   Information Tabs: Overview, Important Dates, Call for papers, Category and Topics, Source Rank, Map, Conference Feedback.
        *   **4.5.3. Using Functions on Detail Page (Right Side):**
            *   **Calendar:** Click to add events/deadlines to your personal calendar.
            *   **Follow:** Click to add the conference to your 'Followed' list (See Section 4.8.5), receive updates.
            *   **Update:** Click to request information refresh or suggest updates.
            *   **Website:** Click to visit the conference's official homepage.
            *   **Post Feedback:**
                *   Scroll down to the 'Conference Feedback' section.
                *   Select a star rating (1-5) under 'Rate the Conference:'.
                *   Enter your feedback text into the empty box.
                *   Click the 'Post Feedback' button.

    **4.6. Saving & Following:** Use the 'Follow' button on the detail page (Section 4.5.3) and manage the list in your account menu (Section 4.8.5).

    **4.7. Alerts:** Set up email alerts in 'Settings' (Section 4.8.9) and view notifications in 'Notifications' (Section 4.8.7).

    **4.8. Navigating Your Personal Account (When Clicking Avatar):**
    Dropdown menu when clicking your avatar in the top-right, or corresponding items in the left sidebar (if present):
        *   4.8.1. **Hello [Username]:** Greeting.
        *   4.8.2. **Analysis:** Access the data aggregation, analysis, and visualization page. (See detailed guide in Section 4.11).
        *   4.8.3. **Profile:** View and edit personal information, password. (See details in Section 4.9).
        *   4.8.4. **My Conferences:** This page is used to manage the conferences that you have added or submitted to the FIT-Conference Hub system. This is where you track the review status of the conferences you contributed.
            *   **Access:** Click on 'My Conferences' in the navigation bar or from the avatar menu.
            *   **Add New Conference:** Click the blue 'Add Conference' button to start the process of submitting new conference information (See Section 4.10).
            *   **View Conference Status:**
                *   Use the filter tabs: Pending, Approved, Rejected to view the list of conferences you added according to each status.
                *   If there are no conferences in the selected status, you will see the message 'You do not have any conferences in this category yet.'
            *   **Refresh Data:** Click the 'Refetch Data' link if you want to update the list.
        *   4.8.5. **Followed:** This page displays the list of conferences you have chosen to 'follow' or 'save' on the website for easy updates.
            *   **Access:** Click on 'Followed' in the navigation bar or from the avatar menu.
            *   **View List:** Browse the list of conferences you are following. Each item usually includes an avatar, conference name, dates, location.
            *   **View Details:** Click the 'Detail' button next to a conference to go to its full information page. On the detail page, you can find more information and possibly an option to unfollow.
            *   **Refresh List:** Click the refresh icon (circular arrow) in the top-right corner to update the list.
            *   **How to Add to List:** To add a conference to this list, you need to find and click the 'Follow' button on the general conference list or the detail page of that conference (See Section 4.5.3).
        *   4.8.6. **Note:** This page functions as a personal calendar, automatically aggregating and displaying important dates (conference dates, submission deadlines, registration deadlines, etc.) of the conferences you are interested in or following.
            *   **Access:** Click on 'Note' in the navigation bar or from the avatar menu.
            *   **View Legend:** The top section explains the meaning of colors or markers on the calendar, corresponding to different types of dates (Conference, Submission, Notification, Camera Ready, Registration, Other, Your notes).
            *   **View Upcoming Notes:** This area lists the nearest upcoming events or deadlines from the conferences you follow. Each item may show the conference name, location, date, and a button for more details.
            *   **View Calendar:**
                *   Displays the calendar monthly.
                *   Days with conference-related events or deadlines will be marked.
                *   Use the arrow buttons to switch between months/years or the button to return to the current day.
                *   Use the search events field to find specific events in the calendar.
        *   4.8.7. **Notifications:** View system notifications (e.g., updates on followed conferences).
        *   4.8.8. **Blacklisted:** Manage the list of blocked/hidden conferences/journals.
        *   4.8.9. **Setting:** Change password, email preferences, notification settings.
        *   4.8.10. **Logout:** Log out of your account.

    **4.9. Managing Profile:**
        *   **4.9.1. Access:** Click Avatar -> Select 'Profile'.
        *   **4.9.2. Edit Profile:**
            *   Click the 'Edit Profile' button.
            *   Change: Avatar, Background, First Name/Last Name, Date of Birth, Phone, Address, About me, Interested Topics.
            *   Click 'Save' to save or 'Cancel' to discard changes.
        *   **4.9.3. Change Password:**
            *   Click the 'Change Password' button.
            *   Enter 'Current Password', click 'Confirm'.
            *   If correct, enter 'New Password' and 'Confirm New Password'.
            *   Click the final 'Confirm' or 'Save'. Click 'Cancel' to abort.

    **4.10. Add New Conference:**
    3-step process to contribute conference information:
        *   **Step 1: Enter Conference Information:**
            Fill form: Conference name*, Acronym*, Link*, Type*, Location* (required if Offline/Hybrid), Important Dates (use 'Add Date' button), Topics (use 'Add' button), Image URL, Description. (* denotes required).
        *   **Step 2: Review Information:**
            Check the summary. Click 'Back' to edit, 'Next' to continue.
        *   **Step 3: Confirmation and Terms Agreement:**
            Read Terms. Check the 'I agree...' box. Click 'Back' if needed. Click 'Add Conference' to submit.

    **4.11. Using the Data Visualization Page (Visualize / Analysis):**
    This page (accessed via Avatar menu -> Analysis) allows creating custom charts.
        *   **Interface:**
            *   **Left Pane (FIELDS):** Contains data fields (Dimensions and Measures).
            *   **Center Pane:** Displays the chart.
            *   **Right Pane (CONFIGURATION):** Configure the chart (Chart Type, X-Axis*, Y-Axis*, Color/Group, Chart Options).
        *   **How to Create a Basic Chart (Example: Record Count by Continent):**
            1.  Select Chart Type.
            2.  Drag 'Continent' (Dimensions) to 'X-Axis'.
            3.  Drag 'Record Count' (Measures) to 'Y-Axis'.
            4.  The chart will appear.
            5.  (Optional) Drag another field to 'Color / Group'.
            6.  (Optional) Change 'Chart Title', adjust display options.

    **4.12. Using the Chatbot:**
        *   **4.12.1. Chatbot Introduction Page:**
            *   Purpose: General introduction.
            *   Options: 'Chat Now' (text chat), 'Live Chat' (live/voice chat).
        *   **4.12.2. Text Chat Page:**
            *   Purpose: Interact by typing text.
            *   Interface: Chat history frame, bot greeting/suggestions, input field, send button.
            *   Functionality: Type questions/requests, bot responds in text.
        *   **4.12.3. Live / Voice Chat Page:**
            *   Purpose: Real-time interaction, possibly via voice.
            *   Interface: Sidebar (Navigation, Output format: Audio/Text), Main Area (Microphone button, text input, send button).
            *   Functionality: Speak requests (press microphone) or type text. Choose bot response format.

    **4.13. Using the Contact Us / Support Page:**
    Send requests, questions, feedback.
        1.  **Subject *:** Enter a brief, clear title. (Required).
        2.  **Request type *:** Select from the list. (Required).
        3.  **Your message *:** Write detailed content. (Required).
        4.  **Terms Agreement Checkbox:** Check the 'I agree...' box. (Required).
        5.  **Send message:** Click this button to send.

## PART 3: ACCOUNT INFORMATION AND OTHERS

**5. Account Registration (Requirements Summary):**
*   Free.
*   Required: Email*, Password*.
*   Optional: Name, Affiliation, Research Interests.

**6. Account Benefits:**
*   Personalized search results.
*   Followed list for conferences/journals (Section 4.8.5).
*   Email alerts (Sections 4.8.7 & 4.8.9).
*   Personal calendar integration (Sections 4.5.3 & 4.8.6).
*   Personal profile management (Section 4.9).
*   Personalized AI Chatbot support (Section 4.12).
*   Access to Data Visualization Dashboard (Sections 4.8.2 & 4.11).
*   Ability to contribute new conference data (Section 4.10) and manage them (Section 4.8.4).

**7. Additional Information:**
*   **Contact Us:** Dedicated page with email, contact form (See Section 4.13).
*   **FAQ:** Section with frequently asked questions.
*   **Terms of Service:** This document outlines the legally binding conditions between you (the user) and GCJH when using the website and related services. Key contents include:
    *   User rights and obligations (e.g., compliance with rules, providing accurate information).
    *   GCJH rights and obligations (e.g., providing services, right to modify/discontinue services).
    *   Content regulations (including user-generated content, copyright responsibility).
    *   Intellectual property rights regarding the GCJH platform and content.
    *   Limitation of GCJH's liability for information, events, or potential losses.
    *   Applicable law and dispute resolution methods.
    *   Acceptance of these terms is a condition for using the website. You should read them carefully before using or registering an account.
*   **Privacy Policy:** This document explains how GCJH collects, uses, stores, shares, and protects your personal information when you use the website. Key contents include:
    *   Types of personal information collected (e.g., account registration info, contact info, browsing data, cookies, information you provide using features).
    *   Purposes of collecting and using information (e.g., to provide and improve services, personalize experience, send notifications, analyze trends, ensure security).
    *   How information is shared (e.g., with service providers, partners, or when legally required).
    *   Security measures implemented to protect your data.
    *   Your rights regarding your personal information (e.g., right to access, correct, delete data).
    *   Information about the use of cookies and similar tracking technologies.
    *   GCJH is committed to protecting your privacy and complying with data protection laws. You should read this policy carefully to understand your rights and how your information is handled.
*   **About Us:** Information about the mission, vision, development team, and partners (if any) of GCJH.
*   **AI Limitations:** A clear statement outlining the limitations of the AI chatbot. This includes the possibility that the chatbot may provide information that is not entirely accurate or complete, especially with AI-generated summaries. Always emphasize the importance of consulting and verifying information from official sources (conference/journal websites, organizers).`


export const englishGetConferencesDeclaration: FunctionDeclaration = {
    name: "getConferences",
    // Mô tả rõ mục đích là tạo query string
    description: `*   **Finding Conference Information or Quantity (Number of conferences)**
        *   **When to use:** Use this function if the task is to find any information about conferences, such as links, location, dates, summary, call for papers, etc. (e.g., "Find information about the X conference", "Details about Y conference", "Tìm thông tin về hội nghị X", "Conférences sur l'intelligence artificielle en France").
        *   **How to use:** You must construct a single URL-encoded query string for the 'searchQuery' parameter. This query string is built from key=value pairs separated by '&'.
        *   **CRITICAL TRANSLATION RULE:** All values used in the query string MUST be in English. For example: "Trí tuệ nhân tạo" MUST become "Artificial+Intelligence", "Việt Nam" MUST become "Vietnam", "Mỹ" MUST become "United+States", and "Allemagne" MUST become "Germany".`,
    parameters: {
        type: Type.OBJECT, // Vẫn là OBJECT theo cấu trúc chung
        properties: {
            // Định nghĩa một tham số duy nhất để chứa query string
            searchQuery: {
                type: Type.STRING,
                // Hướng dẫn chi tiết cách tạo query string
                description: `*   **Available Keys for the Query String:**
            *   'title' (string): The full, formal name of the conference (e.g., International Conference on Management of Digital EcoSystems, Conference on Theory and Applications of Models of Computation).
            *   'acronym' (string): The abbreviated name of the conference (e.g., ICCCI, SIGGRAPH, ABZ, DaWaK).
            *   'fromDate' (string, YYYY-MM-DD): Start date of the conference.
            *   'toDate' (string, YYYY-MM-DD): End date of the conference.
            *   'topics' (string): A topic of interest. Repeat this key for multiple topics (e.g., 'topics=AI&topics=ML').
            *   'cityStateProvince' (string): The city, state, or province.
            *   'country' (string): The country name (in English).
            *   'continent' (string): The continent name (in English).
            *   'address' (string): The specific address.
            *   'rank' (string): The conference ranking (e.g., A*).
            *   'source' (string): The source of the ranking (e.g., CORE2023).
            *   'accessType' (string): The access type (Offline, Online, Hybrid).
            *   'publisher' (string): The publisher name (e.g., IEEE, Springer).
            *   'keyword' (string): A general keyword for searching.
            *   'subFromDate', 'subToDate' (string, YYYY-MM-DD): Submission deadline range.
            *   'cameraReadyFromDate', 'cameraReadyToDate' (string, YYYY-MM-DD): Camera-ready deadline range.
            *   'notificationFromDate', 'notificationToDate' (string, YYYY-MM-DD): Notification date range.
            *   'registrationFromDate', 'registrationToDate' (string, YYYY-MM-DD): Registration date range.
            *   'mode' (string): Use 'mode=detail' if the user requests detailed information (full descriptions, specific dates, call for papers, summary, etc.). Place it at the beginning of the query string.
            *   'perPage' (number): The number of results per page. Default to 5 if not specified by the user.
            *   'page' (number): The page number of results. Default to 1. Use subsequent numbers for follow-up requests (e.g., "find 5 more").
        *   **Specific Construction Rules:**
            *   **URL Encoding:** All values must be URL-encoded. Spaces MUST be replaced with '+'. Special characters must be encoded (e.g., 'Data Science & Analysis' becomes 'Data+Science+&+Analysis').
            *   **Title vs. Acronym:** It is crucial to differentiate. 'International Conference on Machine Learning' uses 'title'. 'ICML' uses 'acronym'.
            *   **Date Ranges:** For any date parameter, if the user gives a single date (e.g., 'on March 15, 2024'), set both the 'From' and 'To' parameters to that same date (e.g., 'fromDate=2024-03-15&toDate=2024-03-15'). If a range is given, use both parameters accordingly.
            *   **Omit Empty Keys:** If a user doesn't specify a value for a key, omit it entirely from the query string. Do not include keys with empty values (e.g., 'title=').
        *   **Comprehensive Examples:**
            *   User: "Tìm hội nghị về ICML" -> 'searchQuery: "acronym=ICML"'
            *   User: "Tìm hội nghị tại Việt Nam trong năm nay" -> 'searchQuery: "country=Vietnam&fromDate=2025-01-01&toDate=2025-12-31"'
            *   User: "Có bao nhiêu hội nghị tổ chức trực tiếp" -> 'searchQuery: "accessType=Offline"
            *   User: "Cherche des conférences en Allemagne" -> 'searchQuery: "country=Germany"'
            *   User: "Search for the International Conference on Management of Digital EcoSystems" -> 'searchQuery: "title=International+Conference+on+Management+of+Digital+EcoSystems"'
            *   User 1: "Find 3 conferences in United States" -> 'searchQuery: "country=United+States&perPage=3&page=1"'
            *   User 2 (follow-up): "Find 5 different conferences in USA" -> 'searchQuery: "country=United+States&perPage=5&page=2"'
            *   User: "Tìm hội nghị có hạn nộp bài từ ngày 1 đến ngày 31 tháng 1 năm 2025" -> 'searchQuery: "subFromDate=2025-01-01&subToDate=2025-01-31"'
            *   User: "Find details for AAAI conference" -> 'searchQuery: "mode=detail&acronym=AAAI"'
            *   User: "Conferences on AI and Machine Learning in Vietnam" -> 'searchQuery: "topics=AI&topics=Machine+Learning&country=Vietnam"`
            }
        },
        // Đảm bảo Gemini luôn cung cấp tham số này
        required: ["searchQuery"]
    }
};

export const englishGetWebsiteInfoDeclaration: FunctionDeclaration = {
    name: "getWebsiteInfo",
    description: "Retrieves information about websites. This function don't need parameters, just call it"
};

export const englishDrawChartDeclaration: FunctionDeclaration = {
    name: "drawChart",
    description: "Draws a chart based on the provided data.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            chartType: {
                type: Type.STRING,
                description: "The type of chart (e.g., bar, line, pie).",
            }
        },
        required: ["chartType"],
    },
};

const internalPaths = [
    '/',
    '/conferences',
    '/dashboard',
    '/journals',
    '/chatbot/landing',
    '/chatbot/regularchat',
    '/chatbot/livechat',
    '/chatbot/history',
    '/visualization/landingvisualization',
    '/visualization',
    '/support',
    '/other',
    '/addconference',
    '/conferences/detail',
    '/journals/detail',
    '/auth/login',
    '/auth/register',
    '/auth/verify-email',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/updateconference'
];

export const englishNavigationDeclaration: FunctionDeclaration = {
    name: "navigation",
    description: `Navigates the user to a specified page within this website or to an external conference website by opening a new browser tab.
    - For INTERNAL navigation: Provide the relative path starting with '/'. The system will automatically add the base URL and locale. Allowed internal paths are: ${internalPaths.join(', ')}.
    - Specifically for the '/dashboard' path, you can navigate to specific tabs by appending '?tab=' followed by the tab name. Allowed dashboard tabs are: 'profile', 'myconferences', 'followed', 'note', 'notifications', 'blacklisted', 'setting'. Example for navigating to the profile tab: {"url": "/dashboard?tab=profile"}.
    - For EXTERNAL conference sites: Provide the full, valid URL starting with 'http://' or 'https://'.`,
    parameters: {
        type: Type.OBJECT,
        properties: {
            url: {
                type: Type.STRING,
                description: `The internal path (starting with '/', e.g., '/dashboard?tab=profile') or the full external URL (starting with 'http://' or 'https://', e.g., 'https://some-conference.com/article') to navigate to.`
            }
        },
        required: ["url"]
    }
};

export const englishOpenGoogleMapDeclaration: FunctionDeclaration = {
    name: "openGoogleMap",
    description: "Opens Google Maps in a new browser tab directed to a specific location string (e.g., city, address, landmark).",
    parameters: {
        type: Type.OBJECT,
        properties: {
            location: {
                type: Type.STRING,
                description: "The geographical location string to search for on Google Maps (e.g., 'Delphi, Greece', 'Eiffel Tower, Paris', '1600 Amphitheatre Parkway, Mountain View, CA').",
            },
        },
        required: ["location"],
    },
};

export const englishManageFollowDeclaration: FunctionDeclaration = {
    name: "manageFollow", // Hoặc tên hàm thực tế của bạn
    description: "Follows, unfollows, or lists followed conferences for the user.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            itemType: {
                type: Type.STRING,
                description: "The type of item.",
                format: 'enum',
                enum: ["conference"]
            },
            action: {
                type: Type.STRING,
                description: "The desired action: 'follow', 'unfollow', or 'list'.",
                format: 'enum',
                enum: ["follow", "unfollow", "list"] // Thêm 'list'
            },
            identifier: { // Optional when action is 'list'
                type: Type.STRING,
                description: "A unique identifier for the item (e.g., acronym, title, ID). Required for 'follow'/'unfollow'.",
            },
            identifierType: { // Optional when action is 'list'
                type: Type.STRING,
                description: "The type of the identifier. Required for 'follow'/'unfollow'.",
                format: 'enum',
                enum: ["acronym", "title", "id"],
            },
        },
        // Điều chỉnh 'required' dựa trên 'action' có thể phức tạp trong định nghĩa JSON Schema đơn giản.
        // Một cách là làm cho identifier và identifierType không bắt buộc ở đây
        // và dựa vào logic của agent để cung cấp chúng khi cần (cho follow/unfollow).
        required: ["itemType", "action"],
    },
};

export const englishManageCalendarDeclaration: FunctionDeclaration = {
    name: "manageCalendar", // Hoặc tên hàm thực tế của bạn
    description: "Adds, removes, or lists conferences in the user's calendar.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            itemType: {
                type: Type.STRING,
                description: "The type of item. Must be 'conference' for calendar actions.",
                format: 'enum',
                enum: ["conference"]
            },
            action: {
                type: Type.STRING,
                description: "The desired action: 'add', 'remove', or 'list'.",
                format: 'enum',
                enum: ["add", "remove", "list"] // Thêm 'list'
            },
            identifier: { // Optional when action is 'list'
                type: Type.STRING,
                description: "A unique identifier for the conference. Required for 'add'/'remove'.",
            },
            identifierType: { // Optional when action is 'list'
                type: Type.STRING,
                description: "The type of the identifier. Required for 'add'/'remove'.",
                format: 'enum',
                enum: ["acronym", "title", "id"],
            },
        },
        required: ["itemType", "action"],
    },
};


export const englishManageBlacklistDeclaration: FunctionDeclaration = {
    name: "manageBlacklist",
    description: "Adds, removes, or lists conferences in the user's blacklist.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            itemType: {
                type: Type.STRING,
                description: "The type of item. Must be 'conference' for blacklist actions.",
                enum: ["conference"]
            },
            action: {
                type: Type.STRING,
                description: "The desired action: 'add', 'remove', or 'list'.",
                enum: ["add", "remove", "list"]
            },
            identifier: { // Optional when action is 'list'
                type: Type.STRING,
                description: "A unique identifier for the conference. Required for 'add'/'remove'.",
            },
            identifierType: { // Optional when action is 'list'
                type: Type.STRING,
                description: "The type of the identifier. Required for 'add'/'remove'.",
                enum: ["acronym", "title", "id"],
            },
        },
        required: ["itemType", "action"],
    },
};

export const englishSendEmailToAdminDeclaration: FunctionDeclaration = {
    name: "sendEmailToAdmin",
    description: "Sends an email to the website administrator on behalf of the user. Use this function when the user explicitly wants to contact the admin, report an issue, provide feedback, or request specific help that requires admin intervention. You should help the user formulate the subject, message, and confirm the request type ('contact' or 'report') before calling this function.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            subject: {
                type: Type.STRING,
                description: "The subject line for the email to the admin. Should be concise and reflect the email's purpose.",
            },
            requestType: {
                type: Type.STRING,
                description: "The type of request. Use 'contact' for general inquiries, feedback, or contact requests. Use 'report' for reporting issues, errors, or problems with the website or its content.",
                format: 'enum',
                enum: ["contact", "report"], // Specify allowed values
            },
            message: {
                type: Type.STRING,
                description: "The main body/content of the email message detailing the user's request, report, or feedback.",
            },
        },
        required: ["subject", "requestType", "message"], // All fields are mandatory
    },
};