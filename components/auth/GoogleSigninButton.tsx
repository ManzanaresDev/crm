"use client";
import { signIn } from "next-auth/react";

export function GoogleSignInButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { redirectTo: "/dashboard" })}
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        borderRadius: "9999px",
        backgroundColor: "#000000",
        color: "#ffffff",
        padding: "10px 16px",
        fontSize: "15px",
        fontWeight: 500,
        border: "none",
        cursor: "pointer",
        transition: "opacity 0.2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          borderRadius: "9999px",
          width: "32px",
          height: "32px",
          flexShrink: 0,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.43 3.58v2.98h3.93c2.3-2.12 3.62-5.24 3.62-8.8z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.93-2.98c-1.09.73-2.48 1.16-4 1.16-3.08 0-5.69-2.08-6.62-4.87H1.31v3.07C3.28 21.3 7.31 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.38 14.4c-.24-.73-.38-1.5-.38-2.4s.14-1.67.38-2.4V6.53H1.31C.48 8.15 0 10.02 0 12s.48 3.85 1.31 5.47l4.07-3.07z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.28 2.7 1.31 6.53l4.07 3.07C6.31 6.83 8.92 4.75 12 4.75z"
          />
        </svg>
      </span>

      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        Continue with Google
      </span>
    </button>
  );
}
