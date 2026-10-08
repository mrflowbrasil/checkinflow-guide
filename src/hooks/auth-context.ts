import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

// Keep context identity independent of the hot-reloaded provider and hook.
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);