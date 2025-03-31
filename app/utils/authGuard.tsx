"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabaseClient";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  return <>{children}</>;
};

export default AuthGuard;
