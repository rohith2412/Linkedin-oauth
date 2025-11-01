"use client";

import { useState } from "react";

export default function LinkedInPost() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handlePost = async () => {
    if (!text.trim()) return alert("Enter some text!");

    setLoading(true);

    try {
      const res = await fetch("/api/linkedin/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your LinkedIn post..."
        rows={5}
        style={{ width: "100%" }}
      />
      <button onClick={handlePost} disabled={loading}>
        {loading ? "Posting..." : "Post to LinkedIn"}
      </button>

      {response && (
        <pre style={{ marginTop: "1rem" }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}
