"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function SuccessPage() {
  const { data: session } = useSession();
  const [postContent, setPostContent] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            LinkedIn Content Publisher
          </h1>
          <p className="text-gray-600 mb-6">
            Sign in with LinkedIn to start posting
          </p>
          <button
            onClick={() => signIn("linkedin")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center gap-2 mx-auto"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Sign in with LinkedIn
          </button>
        </div>
      </div>
    );
  }

  const handlePost = async () => {
    if (!postContent.trim()) {
      alert("Please enter some content first!");
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/linkedin/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: postContent,
          visibility: visibility 
        }),
      });

      const data = await res.json();
      setResponse(data);

      if (data.success) {
        setPostContent(""); // Clear the textarea on success
      }
    } catch (err) {
      console.error(err);
      setResponse({ error: "Something went wrong!" });
    } finally {
      setLoading(false);
    }
  };

  const charCount = postContent.length;
  const maxChars = 3000; // LinkedIn's character limit

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-12 h-12 rounded-full border-2 border-blue-500"
                />
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {session.user?.name || "User"}
                </h2>
                <p className="text-sm text-gray-600">{session.user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Post Composer */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Create a LinkedIn Post
          </h3>

          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="What do you want to talk about?"
            className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            maxLength={maxChars}
          />

          <div className="flex justify-between items-center mt-2 mb-4">
            <span className={`text-sm ${charCount > maxChars - 100 ? 'text-red-500' : 'text-gray-500'}`}>
              {charCount} / {maxChars} characters
            </span>
          </div>

          {/* Visibility Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Visibility
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="PUBLIC"
                  checked={visibility === "PUBLIC"}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Public</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="CONNECTIONS"
                  checked={visibility === "CONNECTIONS"}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Connections Only</span>
              </label>
            </div>
          </div>

          {/* Post Button */}
          <button
            onClick={handlePost}
            disabled={loading || !postContent.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Posting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Post to LinkedIn
              </>
            )}
          </button>
        </div>

        {/* Response Messages */}
        {response && (
          <div className={`rounded-lg shadow-md p-6 ${response.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {response.success ? (
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-green-800">Success!</h4>
                  <p className="text-green-700 text-sm mt-1">{response.message}</p>
                  {response.postId && (
                    <p className="text-green-600 text-xs mt-2">Post ID: {response.postId}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-red-800">Error</h4>
                  <p className="text-red-700 text-sm mt-1">{response.error}</p>
                  {response.details && (
                    <pre className="text-red-600 text-xs mt-2 overflow-auto">
                      {JSON.stringify(response.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Debug Info (Optional - Remove in production) */}
        <details className="mt-6 bg-white rounded-lg shadow-md p-6">
          <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
            Session Debug Info
          </summary>
          <pre className="mt-4 text-xs bg-gray-50 p-4 rounded overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}