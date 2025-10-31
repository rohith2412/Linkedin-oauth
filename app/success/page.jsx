"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function SuccessPage() {
  const { data: session } = useSession();
  const [postContent, setPostContent] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!postContent) return alert("Enter some content first!");
    if (!session?.accessToken || !session?.linkedinId) return alert("Not logged in properly.");

    setLoading(true);

    try {
      const res = await fetch("/api/linkedinPost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: postContent,
          accessToken: session.accessToken,
          linkedinId: session.linkedinId,
        }),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error(err);
      setResponse({ error: "Something went wrong!" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Logged in ✅</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>

      <hr style={{ margin: "2rem 0" }} />

      <h2>Post to LinkedIn</h2>
      <textarea
        value={postContent}
        onChange={(e) => setPostContent(e.target.value)}
        placeholder="Write your LinkedIn post here..."
        rows={5}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
      />

      <button onClick={handlePost} disabled={loading}>
        {loading ? "Posting..." : "Post"}
      </button>

      {response && (
        <pre style={{ marginTop: "1rem", background: "#f0f0f0", padding: "1rem" }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}
