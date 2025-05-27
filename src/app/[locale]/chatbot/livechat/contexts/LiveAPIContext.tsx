// src/app/[locale]/chatbot/livechat/contexts/LiveAPIContext.tsx
import { createContext, FC, ReactNode, useContext } from "react";
import { useLiveAPI, UseLiveAPIResults } from "../hooks/useLiveApi"; // Đảm bảo đường dẫn này đúng

const LiveAPIContext = createContext<UseLiveAPIResults | undefined>(undefined);

export type LiveAPIProviderProps = {
  children: ReactNode;
  // url?: string; // Loại bỏ 'url' vì SDK tự quản lý
  apiKey: string; // Chỉ cần apiKey
};

export const LiveAPIProvider: FC<LiveAPIProviderProps> = ({
  // url, // Loại bỏ 'url'
  apiKey,
  children,
}) => {
  // Truyền apiKey vào useLiveAPI theo cấu trúc mới
  const liveAPI = useLiveAPI({ apiKey });

  return (
    <LiveAPIContext.Provider value={liveAPI}>
      {children}
    </LiveAPIContext.Provider>
  );
};

export const useLiveAPIContext = () => {
  const context = useContext(LiveAPIContext);
  if (!context) {
    // Sửa lỗi chính tả: "within" thay vì "wihin"
    throw new Error("useLiveAPIContext must be used within a LiveAPIProvider");
  }
  return context;
};