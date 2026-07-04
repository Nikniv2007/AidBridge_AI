"use client";

/** Last-resort boundary that also catches errors in the root layout. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1.5rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>AidBridge AI — unexpected error</h1>
        <p style={{ color: "#64748b", maxWidth: 420 }}>
          The application hit a critical error. Please reload the page.
        </p>
        <button
          onClick={reset}
          style={{
            background: "#3182f6",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "0.5rem 1rem",
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
