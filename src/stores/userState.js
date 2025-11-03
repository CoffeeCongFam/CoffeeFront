// 로그인한 유저 정보 상태 관리
import { create } from 'zustand';

// Zustand Store 생성
export const userState = create((set, get) => ({
    user: null,
    // 로그인 유저 세팅
    setUser: (user) => set({ user }),

    // 로그아웃
    clearUser: () => set({ user: null }),

    // 편의 getter
    isLoggedIn: () => !!get().user,
}))
