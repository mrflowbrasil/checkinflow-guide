import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useOnboardingStatus() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["onboarding_status", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("onboarding_profiles")
        .select("user_id, completed_at")
        .eq("user_id", user!.id)
        .maybeSingle();
      return { completed: !!data?.completed_at };
    },
  });
}
