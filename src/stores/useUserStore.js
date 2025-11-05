// 로그인한 유저 정보 고나리 스토어
import { create } from 'zustand';

// Zustand Store 생성
const useUserStore = create((set, get) => ({
  authUser: null, // 초기 유저 정보 null
  partnerStoreId: null, //점주 매장id
  //    유저 정보 업데이트 함수
  setUser: (newUser) => set({ authUser: newUser }),

  setPartnerStoreId: (id) => set({ partnerStoreId: id }), // partnerStoreId 사용

  // 유저 정보 초기화
  clearUser: () => set({ authUser: null }),

  // 편의 getter
  isLoggedIn: () => !!get().authUser,
}));

export default useUserStore;
