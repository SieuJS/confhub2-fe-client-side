import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Correct import for App Router
import { AuthResponse, UserResponse } from '@/src/models/response/user.response'; // Adjust path as needed
import { appConfig } from '@/src/middleware';

// --- Helper Functions (ngoài component để tránh tạo lại và chạy ở client) ---

/**
 * Đọc và parse thông tin user từ localStorage một cách an toàn.
 * Chỉ chạy ở client-side.
 * @returns {UserResponse | null} User object nếu hợp lệ, null nếu không.
 */
const getInitialUser = (): UserResponse | null => {
  // Chỉ chạy ở client-side nơi có window và localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedUser = localStorage.getItem('user');
    // Chỉ parse nếu user tồn tại và loginStatus là 'true'
    if (storedUser && localStorage.getItem('loginStatus') === 'true') {
      try {
        // TODO: Thêm bước xác thực cấu trúc dữ liệu nếu cần (ví dụ dùng Zod)
        return JSON.parse(storedUser) as UserResponse;
      } catch (e) {
        console.error("[useAuthApi - Init] Error parsing initial user from localStorage. Clearing invalid data.", e);
        // Xóa dữ liệu hỏng để tránh lỗi lặp lại
        localStorage.removeItem('user');
        localStorage.removeItem('loginStatus');
        return null;
      }
    }
  }
  // Trả về null nếu không ở client, không có user, hoặc loginStatus không phải 'true'
  return null;
};

export const login = (user : AuthResponse) => {
  // Lưu thông tin user vào localStorage
  localStorage.setItem('user', JSON.stringify(user.user));
  localStorage.setItem('loginStatus', 'true');
  // Lưu thông tin token vào localStorage
  localStorage.setItem('token', user.token);
  // Lưu thông tin returnUrl vào localStorage nếu cần
  const returnUrl = localStorage.getItem('returnUrl') || '/';
  localStorage.removeItem('returnUrl'); // Xóa sau khi đọc
  return returnUrl;
}

export const getToken = () => {
  return localStorage.getItem('token');
}

/**
 * Lấy trạng thái đăng nhập ban đầu từ localStorage.
 * Chỉ chạy ở client-side.
 * @returns {boolean} True nếu đã đăng nhập, False nếu không.
 */
const getInitialLoginStatus = (): boolean => {
  if (typeof window !== 'undefined' && window.localStorage) {
    // Chỉ coi là logged in nếu cả user và loginStatus='true' đều có vẻ hợp lệ ban đầu
    // (getInitialUser sẽ trả về null nếu một trong hai không hợp lệ)
    return !!getInitialUser() && localStorage.getItem('loginStatus') === 'true';
  }
  return false;
};

/**
 * Lấy giá trị từ cookie theo tên.
 * @param {string} name Tên cookie.
 * @returns {string | null} Giá trị cookie hoặc null.
 */
const getCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') return null; // Chỉ chạy ở client
  const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
  return cookieValue ? decodeURIComponent(cookieValue) : null;
};

// --- Auth Hook Interface ---

interface AuthApiResult {
  /**
   * Thực hiện đăng nhập bằng email/password.
   * @param {Record<string, string>} credentials Thông tin đăng nhập.
   * @returns {Promise<void>}
   */
  signIn: (credentials: Record<string, string>) => Promise<void>;
  /**
   * Trạng thái loading (cho các thao tác bất đồng bộ như signIn, logout, initial load).
   */
  isLoading: boolean;
  /**
   * Thông báo lỗi nếu có.
   */
  error: string | null;
  /**
   * Thông tin user hiện tại nếu đã đăng nhập.
   */
  user: UserResponse | null;
  /**
   * Chuyển hướng đến trang đăng nhập Google. Lưu lại URL hiện tại để quay về.
   * @returns {Promise<void>}
   */
  googleSignIn: () => Promise<void>;
  /**
   * Thực hiện đăng xuất.
   * @returns {Promise<void>}
   */
  logout: () => Promise<void>;
  /**
   * Trạng thái đăng nhập (true/false).
   */
  isLoggedIn: boolean;
}

// --- useAuthApi Hook Implementation ---

const useAuthApi = (): AuthApiResult => {
  // --- State Initialization ---
  // Khởi tạo state trực tiếp từ localStorage để tránh vấn đề với StrictMode
  const [user, setUser] = useState<UserResponse | null>(getInitialUser);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(getInitialLoginStatus);
  // Ban đầu coi là loading cho đến khi kiểm tra xong localStorage/cookie
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Hooks ---
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook để lấy query params

  // --- Core Logic Functions ---

  /**
   * Đồng bộ trạng thái từ localStorage và cookie (nếu cần).
   * Chủ yếu dùng cho fallback từ cookie nếu localStorage trống ban đầu,
   * và có thể dùng để đồng bộ giữa các tab (nếu dùng event listener).
   * Hàm này cũng chịu trách nhiệm set isLoading = false sau khi kiểm tra xong.
   */
  const syncStateFromStorage = useCallback(() => {
    console.log("[useAuthApi - syncState] Running state sync from storage...");

    // Đọc lại trạng thái hiện tại từ localStorage phòng trường hợp tab khác thay đổi
    const currentStoredUser = getInitialUser();
    const currentStoredLoginStatus = !!currentStoredUser && localStorage.getItem('loginStatus') === 'true';

    let stateNeedsUpdate = false;

    // 1. Kiểm tra localStorage và cập nhật state nếu có sự khác biệt
    // So sánh bằng JSON.stringify để đơn giản hóa việc so sánh object
    if (JSON.stringify(user) !== JSON.stringify(currentStoredUser) || isLoggedIn !== currentStoredLoginStatus) {
        console.log("[useAuthApi - syncState] Discrepancy detected or initial load. Syncing state from localStorage.", { storedUser: !!currentStoredUser, storedStatus: currentStoredLoginStatus });
        setUser(currentStoredUser);
        setIsLoggedIn(currentStoredLoginStatus);
        stateNeedsUpdate = true; // Đánh dấu state đã thay đổi
    }

    // 2. Fallback kiểm tra cookie CHỈ KHI localStorage không có thông tin đăng nhập hợp lệ
    if (!currentStoredLoginStatus) {
        console.log("[useAuthApi - syncState] localStorage empty/invalid. Attempting cookie fallback...");
        const cookieUserStr = getCookieValue('user');
        const cookieLoginStatus = getCookieValue('loginStatus');
        console.log("[useAuthApi - syncState] Read cookie:", { cookieUser: !!cookieUserStr, cookieLoginStatus });

        if (cookieLoginStatus === 'true' && cookieUserStr) {
            try {
                const parsedCookieUser = JSON.parse(cookieUserStr) as UserResponse;
                 // TODO: Thêm xác thực cấu trúc dữ liệu cookie nếu cần
                console.log("[useAuthApi - syncState] User loaded successfully from cookie:", parsedCookieUser);

                // Cập nhật state VÀ đồng bộ ngược lại vào localStorage từ cookie
                setUser(parsedCookieUser);
                setIsLoggedIn(true);
                localStorage.setItem('user', JSON.stringify(parsedCookieUser));
                localStorage.setItem('loginStatus', 'true');
                console.log("[useAuthApi - syncState] Synced cookie data back to localStorage.");
                stateNeedsUpdate = true; // Đánh dấu state đã thay đổi

            } catch (e) {
                console.error("[useAuthApi - syncState] Error parsing user cookie. Clearing invalid cookie.", e);
                // Xóa cookie hỏng
                document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.cookie = "loginStatus=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                // Đảm bảo state là logged out nếu cookie hỏng và localStorage cũng trống
                if (!currentStoredLoginStatus) { // Kiểm tra lại đề phòng race condition
                    setUser(null);
                    setIsLoggedIn(false);
                    stateNeedsUpdate = true;
                }
            }
        } else {
            console.log("[useAuthApi - syncState] No valid login info found in cookies either.");
            // Nếu state hiện tại đang là logged in (ví dụ do lỗi trước đó), nhưng storage/cookie đều không có -> logout
             if (isLoggedIn) {
                setUser(null);
                setIsLoggedIn(false);
                stateNeedsUpdate = true;
             }
        }
    }

    // Kết thúc loading sau khi mọi kiểm tra hoàn tất
    console.log("[useAuthApi - syncState] Sync process complete.");
    setIsLoading(false);

  }, [user, isLoggedIn]); // Phụ thuộc vào state hiện tại để so sánh

  // --- Effects ---

  /**
   * Effect chạy một lần sau khi component mount ở client-side.
   * Gọi syncStateFromStorage để xử lý cookie fallback và kết thúc trạng thái loading ban đầu.
   */
  useEffect(() => {
    console.log("[useAuthApi - Initial Effect] Component mounted. Running initial sync/load.");
    syncStateFromStorage();

    // --- Listener tùy chọn cho đồng bộ hóa giữa các tab ---
    // const handleStorageChange = (event: StorageEvent) => {
    //   if (event.key === 'loginStatus' || event.key === 'user') {
    //     console.log('[useAuthApi - Storage Listener] Storage changed in another tab. Re-syncing...');
    //     syncStateFromStorage();
    //   }
    // };
    // window.addEventListener('storage', handleStorageChange);

    return () => {
      console.log("[useAuthApi - Initial Effect] Component unmounting.");
      // window.removeEventListener('storage', handleStorageChange);
    };
    // Chạy một lần sau mount ban đầu
  }, [syncStateFromStorage]); // Chỉ chạy lại nếu syncStateFromStorage thay đổi (thường là không)

  /**
   * Effect đồng bộ state `user` và `isLoggedIn` vào localStorage BẤT KỲ KHI NÀO chúng thay đổi.
   * Điều này giữ cho localStorage luôn cập nhật với trạng thái React.
   */
  useEffect(() => {
    // Chỉ chạy ở client
    if (typeof window !== 'undefined' && window.localStorage) {
      console.log("[useAuthApi - Sync Effect] State changed. Syncing TO localStorage...", { user: !!user, isLoggedIn });
      if (isLoggedIn && user) {
        try{
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('loginStatus', 'true');
        } catch (e) {
            console.error("[useAuthApi - Sync Effect] Error stringifying user for localStorage.", e);
            // Xử lý lỗi nếu user data không thể stringify (hiếm khi xảy ra)
        }
      } else {
        // Nếu không loggedIn hoặc không có user -> xóa khỏi localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('loginStatus');
        console.log("[useAuthApi - Sync Effect] Cleared localStorage due to logged out state.");
      }
    }
  }, [user, isLoggedIn]); // Chạy mỗi khi user hoặc isLoggedIn thay đổi

  // --- API Call Functions ---

  const signIn = async (credentials: Record<string, string>): Promise<void> => {
    console.log("[useAuthApi - signIn] Attempting sign-in...");
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...credentials , mode : "user"}),
      });

      const data = await response.json();
      console.log("[useAuthApi - signIn] Server response:", { status: response.status, ok: response.ok, data });

      if (response.ok && data.user) {
        const loggedInUser = data.user as UserResponse;
        console.log("[useAuthApi - signIn] Sign-in successful for user:", loggedInUser.email);

        // 1. Cập nhật localStorage TRƯỚC khi cập nhật state
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        localStorage.setItem('loginStatus', 'true');
        localStorage.setItem('token', data.token); // Lưu token nếu cần
        // 2. Cập nhật Cookie (vẫn hữu ích cho một số trường hợp và server-side)
        document.cookie = `loginStatus=true; path=/; SameSite=Lax; max-age=2592000`; // max-age=30 days
        // Lưu ý: Không nên lưu toàn bộ user object vào cookie nếu nó quá lớn hoặc chứa thông tin nhạy cảm không cần thiết ở cookie.
        // Có thể chỉ lưu ID hoặc token nếu cần. Ở đây tạm giữ nguyên để giống code gốc.
        try {
            document.cookie = `user=${encodeURIComponent(JSON.stringify(loggedInUser))}; path=/; SameSite=Lax; max-age=2592000`;
        } catch (e) {
             console.error("[useAuthApi - signIn] Error encoding user for cookie.", e);
        }


        // 3. Cập nhật State (sẽ kích hoạt effect [user, isLoggedIn] nhưng không sao)
        setUser(loggedInUser);
        setIsLoggedIn(true);
        setIsLoading(false); // Kết thúc loading

        // 4. Xử lý chuyển hướng
        const returnUrl = localStorage.getItem('returnUrl') || '/';
        localStorage.removeItem('returnUrl'); // Xóa ngay sau khi đọc
        console.log("[useAuthApi - signIn] Redirecting to:", returnUrl);
        router.push(returnUrl);

      } else {
        console.error("[useAuthApi - signIn] Sign-in failed:", data.message || 'Unknown error');
        setError(data.message || 'Incorrect email or password.');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("[useAuthApi - signIn] Network or other error during sign-in:", err);
      setError('Login failed. Please check your connection or credentials.');
      setIsLoading(false);
    }
  };

  const googleSignIn = async (): Promise<void> => {
    // Lấy URL đầy đủ bao gồm cả query params
    const fullUrl = `${window.location.pathname}${window.location.search}`;
    console.log("[useAuthApi - googleSignIn] Storing return URL:", fullUrl);
    localStorage.setItem('returnUrl', fullUrl);
    console.log("[useAuthApi - googleSignIn] Redirecting to Google OAuth endpoint...");
    // Chuyển hướng đến API route xử lý Google OAuth phía backend/Next.js
    window.location.href = `/api/auth/google`; // Điều chỉnh nếu API route khác
  };

  const logout = useCallback(async (): Promise<void> => {
    console.log("[useAuthApi - logout] Initiating logout...");
    setIsLoading(true);
    setError(null);
    try {
      // Gọi API backend để hủy session/token phía server (nếu có)
      // await fetch('/api/auth/logout', { method: 'POST' }); // Ví dụ

      // 1. Xóa localStorage TRƯỚC khi cập nhật state
      localStorage.removeItem('user');
      localStorage.removeItem('loginStatus');
      localStorage.removeItem('returnUrl'); // Xóa luôn returnUrl nếu có

      // 2. Xóa Cookie
      document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "loginStatus=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // 3. Cập nhật State
      setUser(null);
      setIsLoggedIn(false);

      console.log("[useAuthApi - logout] Logout successful. Redirecting to home.");
      router.push("/"); // Chuyển về trang chủ sau khi logout
    } catch (error) {
      console.error("[useAuthApi - logout] Logout failed:", error);
      setError("Logout failed. Please try again.");
      // Vẫn nên xóa storage/cookie và cập nhật state ở client ngay cả khi API server lỗi
      localStorage.removeItem('user');
      localStorage.removeItem('loginStatus');
      document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "loginStatus=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  }, [router]); // router là dependency của logout

  // --- Return Value ---
  return {
    signIn,
    isLoading,
    error,
    user,
    googleSignIn,
    logout,
    isLoggedIn,
  };
};

export default useAuthApi;