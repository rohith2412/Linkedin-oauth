"use client";
import { useSession } from "next-auth/react";

export default function SuccessPage() {
  const { data: session } = useSession();
  console.log(session); 

  return (
    <div>
      <h1>Logged in 200</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
