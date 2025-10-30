"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/success");
    }
  }, [session, router]);

  return (
    <div className="h-screen flex items-center justify-center">
      <button
        onClick={() => signIn("linkedin")}
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
      >
        Sign in with LinkedIn
      </button>
    </div>
  );
}
