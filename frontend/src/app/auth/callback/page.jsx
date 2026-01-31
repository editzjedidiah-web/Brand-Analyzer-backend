"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Callback() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(() => {
      router.push("/dashboard");
    });
  }, []);

  return <p>Signing you in…</p>;
}
