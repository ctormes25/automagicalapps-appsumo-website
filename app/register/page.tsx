"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import axios from "axios";

const tierNames: { [key: number]: string } = {
  1: "Basic",
  2: "Standard",
  3: "Pro",
  4: "Unlimited",
};

const tierBenefits: { [key: number]: { emails: number | string; ai: number } } =
  {
    1: { emails: 50, ai: 50 },
    2: { emails: 50, ai: 200 },
    3: { emails: 50, ai: 500 },
    4: { emails: "Unlimited", ai: 1000 },
  };

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Get license info from URL params
  const licenseKey = searchParams.get("license_key");
  const tier = parseInt(searchParams.get("tier") || "1");
  const emailParam = searchParams.get("email");

  useEffect(() => {
    // Check if we have the required params
    if (!licenseKey) {
      setError(
        "Missing license information. Please complete OAuth activation from AppSumo."
      );
    }
  }, [licenseKey]);

  const handleGoogleSignIn = async () => {
    if (!licenseKey) {
      setError("Missing license key. Please restart activation from AppSumo.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1: Sign in with Google
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      // Pre-fill email if provided from AppSumo
      if (emailParam) {
        provider.setCustomParameters({
          login_hint: decodeURIComponent(emailParam),
        });
      }

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Step 2: Get ID token
      const idToken = await user.getIdToken();

      // Step 3: Call function via axios
      const response = await axios.post(
        "https://appsumo-licensing-792902431116.us-central1.run.app/linkAppSumoLicense",
        {
          licenseKey: licenseKey,
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        router.push("/dashboard");
      } else {
        throw new Error(response.data.error);
      }
    } catch (err: any) {
      console.error("Registration error:", err);

      let errorMessage = "Failed to sign in. Please try again.";

      if (err.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in cancelled. Please try again.";
      } else if (err.code === "auth/popup-blocked") {
        errorMessage = "Popup blocked. Please allow popups for this site.";
      } else if (err.code === "auth/account-exists-with-different-credential") {
        errorMessage = "An account already exists with this email.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!licenseKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Missing License Information
            </h1>
            <p className="text-gray-600 mb-6">
              Please complete the OAuth activation from AppSumo to continue.
            </p>
            <a
              href="https://appsumo.com"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition"
            >
              Return to AppSumo
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Account Created Successfully!
            </h1>
            <p className="text-gray-600 mb-6">
              Redirecting you to your dashboard...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🎯</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Automagical Nudge!
          </h1>
          <p className="text-gray-600">
            Complete your registration with Google
          </p>
        </div>

        {/* AppSumo Badge */}
        <div className="text-center mb-6">
          <span className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full text-sm font-semibold">
            🌮 AppSumo Deal
          </span>
        </div>

        {/* License Info */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-lg">
            Your License Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">License Key:</span>
              <span className="font-mono font-semibold text-gray-900">
                {licenseKey.substring(0, 8)}...
                {licenseKey.substring(licenseKey.length - 8)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Plan:</span>
              <span className="font-semibold text-primary">
                {tierNames[tier]}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email Quota:</span>
              <span className="font-semibold text-gray-900">
                {tierBenefits[tier]?.emails} per month
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">AI Credits:</span>
              <span className="font-semibold text-gray-900">
                {tierBenefits[tier]?.ai} per month
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Google Sign In Button */}
        <div className="mb-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 px-4 rounded-lg font-semibold hover:bg-gray-50 transition disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-6 w-6 text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-lg">Signing in...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-lg">Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Why Google Sign-In?</p>
              <p className="text-blue-700">
                We use Google Sign-In to securely link your AppSumo license with
                your Gmail account for seamless integration with the Chrome
                extension.
              </p>
            </div>
          </div>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center">
          By registering, you agree to our{" "}
          <a href="/terms" className="text-primary hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
