// 로그인한 유저 알림 정보 관리 스토어
import { create } from 'zustand';
// 🚩 [수정] 알림 API 함수 임포트
import { fetchNotificationList } from '../apis/notificationApi'; // 경로는 맞는지 확인해주세요.

// 알림 구조
// interface Notification {
//   notificationId: number;
//   notificationType: string;
//   notificationContent: String;
//   readAt: string; // timestamp
//   createdAT: string;
// }

// Zustand Store 생성
const useNotificationStore = create((set, get) => ({
  notifications: [], // 알림 목록
  unreadCount: 0, // 읽지 않은 알림 수

  refreshOrderList: null,

  setRefreshOrderList: (refreshFunc) => set({ refreshOrderList: refreshFunc }),

  // 🚩 [추가] 서버에서 알림을 가져와 상태를 업데이트하는 비동기 함수
  fetchAndUpdateNotifications: async () => {
    try {
      // 1. 서버에서 알림 목록을 가져옵니다. (GET 요청)
      const data = await fetchNotificationList();

      // 2. setNotifications 액션을 사용하여 상태를 업데이트합니다.
      get().setNotifications(data);
    } catch (e) {
      console.error('알림 목록 로드 중 오류 발생:', e);
    }
  },

  // actions
  // 알림 내역 세팅
  setNotifications: (notificationList) =>
    set({
      notifications: notificationList,
      // readAt 이 없거나 isRead가 false 인 것만 미읽음으로 카운트
      unreadCount: notificationList.filter((n) => !n.readAt && !n.isRead)
        .length,
    }),

  // 알림 추가 함수
  // 새로운 알림을 notifications에 추가하고
  // unreadCount 수 증가
  addNotification: (newNotification) => {
    console.log('new notification !!!-----------------------', newNotification);

    // 알림 타입이 order이고, refreshOrderList 함수가 등록되어 있다면 호출
    const refreshFunc = get().refreshOrderList;

    if (newNotification.notificationType === 'ORDER' && refreshFunc) {
      console.log('새 주문 알림 수신! StoreHome의 주문 목록을 갱신');
      refreshFunc(); // StoreHome에서 등록한 freshOrder 함수 실행
    }

    set((state) => ({
      notifications: [
        { ...newNotification, readAt: null, isRead: false },
        ...state.notifications,
      ],
      unreadCount: state.unreadCount + 1,
    }));
  },

  // 전체 삭제 (프론트 상태만 초기화)
  deleteAllNotifications: () =>
    set(() => ({
      notifications: [],
      unreadCount: 0,
    })),

  // 전체 읽음 처리 (서버 X, 프론트만)
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        isRead: true,
        readAt: n.readAt ?? new Date().toISOString(),
      })),
      unreadCount: 0,
    })),

  // 특정 알림 읽음 처리 (서버 X, 프론트만)
  markAsRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.notificationId === notificationId
          ? {
              ...notification,
              isRead: true,
              readAt: notification.readAt ?? new Date().toISOString(),
            }
          : notification
      ),
      unreadCount: state.notifications.filter(
        (n) => !n.isRead && n.notificationId !== notificationId
      ).length,
    })),

  getNotification: (notificationId) => {
    const n = get().notifications.find(
      (n) => n.notificationId === notificationId
    );
    return n || null;
  },

  // 읽지 않은 알림 수를 반환
  getUnreadCount: () =>
    get().notifications.filter((notification) => !notification.readAt).length,
}));

export default useNotificationStore;
