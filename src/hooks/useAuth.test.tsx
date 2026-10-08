import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthContext, type AuthContextValue } from "./auth-context";
import { useAuth } from "./useAuth";

vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

describe("authentication context identity", () => {
  it("reads the shared context rather than a provider-module-local context", () => {
    const value: AuthContextValue = {
      user: null,
      session: null,
      loading: false,
      signOut: vi.fn(async () => {}),
    };
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
      ),
    });
    expect(result.current).toBe(value);
  });
});