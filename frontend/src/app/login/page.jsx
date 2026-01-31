"use client";
import { createClient } from "@/lib/supabase";

export default function Login() {
  const supabase = createClient();

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://brandanalyzer.lovable.app/auth/callback",
      },
    });
  };

  return (
    <button
      onClick={login}
      className="px-4 py-2 bg-white text-black rounded"
    >
      Continue with Google
    </button>
  );
}
