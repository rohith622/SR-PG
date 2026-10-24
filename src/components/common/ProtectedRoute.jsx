import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import authService from "../../services/authService";

// Share an ongoing request across React Strict Mode effect executions.
let sessionValidationPromise = null;

function validateSessionOnce() {
  if (!sessionValidationPromise) {
    sessionValidationPromise = authService.getCurrentUser().finally(() => {
      sessionValidationPromise = null;
    });
  }

  return sessionValidationPromise;
}

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  const [status, setStatus] = useState("checking");
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const validateSession = async () => {
      const token = authService.getToken();

      if (!token) {
        if (!cancelled) {
          setStatus("unauthenticated");
        }
        return;
      }

      setStatus("checking");
      setErrorMessage("");

      try {
        await validateSessionOnce();

        if (!cancelled) {
          setStatus("authenticated");
        }
      } catch (error) {
        if (cancelled) return;

        console.error("[ProtectedRoute] Session validation failed:", {
          message: error.message,
          status: error.status,
        });

        if (error.status === 401 || error.status === 403) {
          authService.clearStoredSession();
          setStatus("unauthenticated");
        } else {
          setErrorMessage(
            error.message || "Unable to verify your session. Please try again.",
          );
          setStatus("error");
        }
      }
    };

    validateSession();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  if (status === "unauthenticated") {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f5ef]">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-emerald-700/20 border-t-emerald-700" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Verifying admin session...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f5ef] p-5">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            Unable to verify your session
          </h2>

          <p className="mt-2 text-sm text-slate-600">{errorMessage}</p>

          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="mt-5 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return children;
}
