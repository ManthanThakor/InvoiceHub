import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserDto } from "@/types";
import { resolveBackendUrl } from "@/lib/utils/cn";
import { authApi } from "@/lib/api/endpoints";

interface AuthState {
  user: UserDto | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserDto, accessToken: string, refreshToken: string) => void;
  setUser: (user: UserDto) => void;
  logout: () => void;
  logoutAsync: () => Promise<void>;
}

function normalizeUser(user: UserDto): UserDto {
  if (!user.profilePicture) return user;
  return { ...user, profilePicture: resolveBackendUrl(user.profilePicture) };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        set({ user: normalizeUser(user), accessToken, refreshToken, isAuthenticated: true });
      },
      setUser: (user) => set({ user: normalizeUser(user) }),
      logout: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
      logoutAsync: async () => {
        const token = localStorage.getItem("refreshToken");
        if (token) {
          try {
            await authApi.logout(token);
          } catch {
            // Best-effort: clear local state regardless of API result
          }
        }
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<AuthState>),
        user: (persisted as Partial<AuthState>).user ? normalizeUser((persisted as Partial<AuthState>).user!) : null,
      }),
    }
  )
);
