// 로그인한 유저 알림 정보 관리 스토어
import { create } from "zustand";

// interface Notification {
//   notificationId: number;
//   notificationType: string;
//   notificationContent: String;
//   readAt: string; // timestamp
//   createdAT: string;
// }

// Zustand Store 생성
const useNotificationStore = create((set) => ({
  notifications: [], // 알림 목록
  unreadCount: 0, // 읽지 않은 알림 수

  // actions

  // 알림 추가 함수
  // 새로운 알림을 배열에 추가하고
  // 읽지 않은 알림 수 증가
  addNotification: (newNotification) => {
    console.log("new notification !!!-----------------------", newNotification);

    set((state) => ({
      notifications: [
        { ...newNotification, isRead: false },
        ...state.notifications,
      ],
      unreadCount: state.unreadCount + 1,
    }));
  },

  // 전체 읽음 처리
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),

  // 알림 삭제
}));

export default useNotificationStore;
