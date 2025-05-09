
// src/hooks/chatbot/layout/useUrlConversationSync.ts
import { useEffect, useRef } from 'react';
import { useRouter, usePathname, AppPathname } from '@/src/navigation'; // Giả sử AppPathname được export từ đây
import { useConversationStore, useSocketStore } from '@/src/app/[locale]/chatbot/stores';
import { useShallow } from 'zustand/react/shallow';
import { useSearchParams } from 'next/navigation';

interface UseUrlConversationSyncProps {
  currentView: 'chat' | 'history';
  isProcessingDeletion: boolean; // From MainLayout's local state
  idBeingDeleted: string | null;   // From MainLayout's local state
}

// Helper function (nếu chưa có sẵn hoặc import từ hooks)
function urlSearchParamsToObject(params: URLSearchParams): Record<string, string> {
  const obj: Record<string, string> = {};
  if (params) {
    for (const [key, value] of params.entries()) {
      obj[key] = value;
    }
  }
  return obj;
}

export function useUrlConversationSync({
  currentView,
  isProcessingDeletion,
  idBeingDeleted,
}: UseUrlConversationSyncProps) {
  const router = useRouter();
  const currentPathname = usePathname();
  const searchParamsHook = useSearchParams();

  const {
    activeConversationId,
    isLoadingHistory,
    loadConversation,
  } = useConversationStore(
    useShallow(state => ({
      activeConversationId: state.activeConversationId,
      isLoadingHistory: state.isLoadingHistory,
      loadConversation: state.loadConversation,
    }))
  );

  const { isConnected, isServerReadyForCommands } = useSocketStore(
    useShallow(state => ({
      isConnected: state.isConnected,
      isServerReadyForCommands: state.isServerReadyForCommands,
    }))
  );

  const internalUrlUpdateRef = useRef(false); // Đánh dấu URL update là do Effect1 (internal)
  const didAttemptLoadFromUrlRef = useRef(false); // Đánh dấu đã thử load từ URL hiện tại
  const prevUrlIdParamForEffect2ResetRef = useRef<string | null>(null); // Theo dõi urlIdParam cho việc reset didAttemptLoadFromUrlRef
  const prevActiveConversationIdForEffect1Ref = useRef<string | null | undefined>(undefined); // Theo dõi activeId trước đó cho Effect1

  const urlIdParam = searchParamsHook.get('id');
  const searchParamsString = searchParamsHook.toString(); // Lấy chuỗi query hiện tại

  // Effect 1: Đồng bộ activeConversationId (từ store) ra URL (?id=...)
  useEffect(() => {
    if (isProcessingDeletion && idBeingDeleted === urlIdParam) {
      console.log(`[useUrlConversationSync Effect1] Deletion in progress for ${urlIdParam}, skipping URL sync.`);
      return;
    }

    const newParams = new URLSearchParams(searchParamsString);
    let shouldUpdateURL = false;

    if (currentView === 'chat') {
      if (activeConversationId) {
        // Nếu có activeConversationId, đồng bộ nó ra URL nếu URL chưa có hoặc khác
        if (urlIdParam !== activeConversationId) {
          console.log(`[useUrlConversationSync Effect1] ActiveId (${activeConversationId}) differs from URL ID (${urlIdParam}). Setting URL.`);
          newParams.set('id', activeConversationId);
          shouldUpdateURL = true;
        }
      } else { // activeConversationId is null
        // Chỉ xóa id khỏi URL nếu activeConversationId vừa chuyển từ CÓ GIÁ TRỊ sang NULL.
        // Không xóa nếu activeConversationId là null ngay từ đầu (khi tải trang với id trên URL).
        if (
          prevActiveConversationIdForEffect1Ref.current !== null &&      // Trước đó không phải là null
          prevActiveConversationIdForEffect1Ref.current !== undefined && // Và không phải lần chạy đầu tiên (undefined)
          urlIdParam &&                                               // Và URL đang có id
          !(isProcessingDeletion && idBeingDeleted === urlIdParam)    // Và không phải đang xóa id đó
        ) {
          console.log(`[useUrlConversationSync Effect1] ActiveId became null (was: ${prevActiveConversationIdForEffect1Ref.current}). Current URL ID: ${urlIdParam}. Removing ID from URL.`);
          newParams.delete('id');
          shouldUpdateURL = true;
        } else if (prevActiveConversationIdForEffect1Ref.current === undefined && urlIdParam) {
          console.log(`[useUrlConversationSync Effect1] Initial load with activeId=null and urlIdParam=${urlIdParam}. Not changing URL, letting Effect2 handle load.`);
        }
      }
    } else { // currentView is 'history'
      if (urlIdParam) { // Nếu đang ở view history mà URL có id, thì xóa id đi
        console.log(`[useUrlConversationSync Effect1] In history view with URL ID ${urlIdParam}. Removing ID from URL.`);
        newParams.delete('id');
        shouldUpdateURL = true;
      }
    }

    if (shouldUpdateURL) {
      const newQueryString = newParams.toString();
      if (newQueryString !== searchParamsString) { // Chỉ cập nhật nếu query string thực sự thay đổi
        console.log(`[useUrlConversationSync Effect1] Syncing URL. New query: ?${newQueryString}. Setting internalUrlUpdateRef.`);
        internalUrlUpdateRef.current = true; // Đánh dấu đây là internal update
        router.replace(
          { pathname: currentPathname as AppPathname, query: urlSearchParamsToObject(newParams) },
          { scroll: false }
        );
      } else {
        console.log(`[useUrlConversationSync Effect1] URL already reflects activeId or desired state. No router.replace needed.`);
      }
    }
    // Cập nhật prevActiveConversationIdRef ở cuối effect cho lần chạy sau
    prevActiveConversationIdForEffect1Ref.current = activeConversationId;

  }, [
    activeConversationId,
    currentView,
    currentPathname,
    router,
    urlIdParam, // Phụ thuộc vào urlIdParam để có thể phản ứng đúng
    searchParamsString, // Phụ thuộc vào searchParamsString để so sánh
    isProcessingDeletion,
    idBeingDeleted,
  ]);


  // Effect 2: Load conversation từ URL nếu các điều kiện được đáp ứng
  useEffect(() => {
    // Nếu URL update là do Effect1 (internal update), bỏ qua Effect2 lần này
    if (internalUrlUpdateRef.current) {
      console.log("[useUrlConversationSync Effect2] URL update was internal (from Effect1). Resetting flag and skipping load.");
      internalUrlUpdateRef.current = false; // Reset cờ cho lần sau
      return;
    }

    // Logic reset didAttemptLoadFromUrlRef khi urlIdParam hoặc currentView thay đổi
    // Để đảm bảo mỗi khi urlIdParam thay đổi, chúng ta có thể thử load lại.
    if ((urlIdParam !== prevUrlIdParamForEffect2ResetRef.current || currentView !== 'chat') && didAttemptLoadFromUrlRef.current) {
      console.log(`[useUrlConversationSync Effect2] urlIdParam or currentView changed. Resetting didAttemptLoadFromUrlRef. Old urlId: ${prevUrlIdParamForEffect2ResetRef.current}, New urlId: ${urlIdParam}, currentView: ${currentView}`);
      didAttemptLoadFromUrlRef.current = false;
    }
    prevUrlIdParamForEffect2ResetRef.current = urlIdParam; // Cập nhật giá trị urlIdParam đã thấy

    if (isProcessingDeletion && idBeingDeleted === urlIdParam) {
      console.log(`[useUrlConversationSync Effect2] Deletion in progress for ${urlIdParam}, skipping load from URL.`);
      return;
    }

    // Điều kiện chính để load conversation từ URL
    if (
      currentView === 'chat' &&                     // Phải ở view chat
      urlIdParam &&                                 // Phải có ID trên URL
      activeConversationId !== urlIdParam &&        // ID trên URL khác với active ID hiện tại (QUAN TRỌNG cho việc load khi truy cập trực tiếp)
      !isLoadingHistory &&                          // Không có conversation nào khác đang được tải
      isConnected &&                                // Socket đã kết nối
      isServerReadyForCommands &&                   // Server sẵn sàng nhận lệnh
      !didAttemptLoadFromUrlRef.current             // Chưa "thử" load từ urlIdParam này trong chu kỳ này
    ) {
      console.log(`[useUrlConversationSync Effect2] Attempting to load conversation ${urlIdParam} from URL. Current activeId: ${activeConversationId || 'null'}.`);
      didAttemptLoadFromUrlRef.current = true; // Đánh dấu đã thử load cho urlIdParam này
      loadConversation(urlIdParam, { isFromUrl: true });
    } else if (currentView === 'chat' && urlIdParam && activeConversationId === urlIdParam && didAttemptLoadFromUrlRef.current) {
      // Trường hợp này: urlIdParam khớp activeId, VÀ chúng ta đã "attempted" cho urlIdParam này.
      // Điều này có nghĩa là việc load từ URL (nếu có) cho urlIdParam này đã hoàn tất hoặc đang diễn ra.
      console.log(`[useUrlConversationSync Effect2] urlIdParam ${urlIdParam} matches activeId. didAttemptLoadFromUrlRef is true. No action needed, load was attempted/completed.`);
    } else if (currentView === 'chat' && urlIdParam && activeConversationId !== urlIdParam && !didAttemptLoadFromUrlRef.current) {
        if (isLoadingHistory) {
            console.log(`[useUrlConversationSync Effect2] Conditions met to load ${urlIdParam} from URL, but isLoadingHistory is true. Waiting.`);
        } else if (!isConnected || !isServerReadyForCommands) {
            console.log(`[useUrlConversationSync Effect2] Conditions met to load ${urlIdParam} from URL, but socket not ready. Waiting. Connected: ${isConnected}, ServerReady: ${isServerReadyForCommands}`);
        } else {
            // Các trường hợp khác có thể log ở đây để debug nếu cần
            // console.log(`[useUrlConversationSync Effect2] Conditions to load ${urlIdParam} from URL not fully met. activeId: ${activeConversationId}, urlIdParam: ${urlIdParam}, isLoadingHistory: ${isLoadingHistory}, isConnected: ${isConnected}, isServerReady: ${isServerReadyForCommands}, didAttempt: ${didAttemptLoadFromUrlRef.current}`);
        }
    }

  }, [
    urlIdParam, // Trigger khi id trên URL thay đổi
    currentView, // Trigger khi view thay đổi
    activeConversationId, // Trigger khi activeId trong store thay đổi
    loadConversation,
    isLoadingHistory,
    isConnected,
    isServerReadyForCommands,
    isProcessingDeletion,
    idBeingDeleted,
    // Không thêm internalUrlUpdateRef vào dependencies của Effect2
    // Không thêm prevUrlIdParamForEffect2ResetRef vào dependencies
  ]);

  // Không còn cần trả về didAttemptLoadFromUrlRef nếu MainLayout không sử dụng trực tiếp nữa
  return { didAttemptLoadFromUrlRef };
  // return {}; // Hoặc không trả về gì cả nếu không cần thiết
}
