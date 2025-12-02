"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import axios from "axios";

interface AppSumoLicense {
  hasLicense?: boolean;
  licenseKey?: string;
  tier?: number;
  status?: string;
  linkedAt?: any;
}

const tierNames: { [key: number]: string } = {
  1: "Basic",
  2: "Standard",
  3: "Pro",
  4: "Unlimited",
};

const tierLimits: { [key: number]: { emails: number | string; ai: number } } = {
  1: { emails: 50, ai: 50 },
  2: { emails: 100, ai: 200 },
  3: { emails: 200, ai: 500 },
  4: { emails: "Unlimited", ai: 1000 },
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [license, setLicense] = useState<AppSumoLicense | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch AppSumo license
        await fetchLicense(currentUser);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchLicense = async (currentUser: User) => {
    try {
      // Get ID token from current user
      const idToken = await currentUser.getIdToken();

      console.log("Fetching license for user:", currentUser.uid);

      // Call your Cloud Run endpoint
      const response = await axios.get(
        "https://appsumo-licensing-792902431116.us-central1.run.app/getAppSumoLicense",
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("License data:", response.data);

      setLicense(response.data);
    } catch (error: any) {
      console.error("Error fetching license:", error);

      // If 404, user has no license
      if (error.response?.status === 404) {
        setLicense({ hasLicense: false });
      } else {
        setLicense({ hasLicense: false });
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎯</span>
              <h1 className="text-2xl font-bold text-gray-900">
                Automagical Nudge
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                {user?.displayName || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-primary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.displayName?.split(" ")[0] || "there"}!
          </h2>
          <p className="text-gray-600">
            Here's an overview of your Automagical Nudge account
          </p>
        </div>

        {/* AppSumo License Card */}
        {license?.licenseKey ? (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">🌮</span>
                  <h3 className="text-xl font-bold text-gray-900">
                    AppSumo License Active
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      license.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {license.status?.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Plan</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {tierNames[license.tier || 1]}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">License Key</p>
                    <p className="text-sm font-mono text-gray-900">
                      {license.licenseKey?.substring(0, 8)}...
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Your Benefits:
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Email Quota</p>
                      <p className="text-2xl font-bold text-primary">
                        {tierLimits[license.tier || 1]?.emails}
                      </p>
                      <p className="text-xs text-gray-500">per month</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">AI Credits</p>
                      <p className="text-2xl font-bold text-primary">
                        {tierLimits[license.tier || 1]?.ai}
                      </p>
                      <p className="text-xs text-gray-500">per month</p>
                    </div>
                  </div>
                </div>

                {/* Upgrade CTA for tiers below 3 */}
                {license.tier && license.tier < 3 && (
                  <div className="mt-4">
                    <a
                      href="https://appsumo.com/account/products/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-gradient-to-r from-primary to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-dark hover:to-orange-600 transition shadow-md"
                    >
                      Upgrade to unlock more features
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Active License
            </h3>
            <p className="text-gray-600 mb-4">
              You're currently on the free plan. Upgrade to unlock more
              features!
            </p>
            <a
              href="https://appsumo.com"
              target="_blank"
              className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition"
            >
              Get AppSumo Deal
            </a>
          </div>
        )}

        {/* Quick Stats */}
        {/* <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-semibold">
                Active Nudges
              </h3>
              <span className="text-2xl">📧</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-500 mt-1">
              Email sequences running
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-semibold">Reminders</h3>
              <span className="text-2xl">⏰</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-500 mt-1">Upcoming reminders</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-semibold">
                Response Rate
              </h3>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">0%</p>
            <p className="text-sm text-gray-500 mt-1">All-time average</p>
          </div>
        </div> */}

        {/* Get Started */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Get Started with Automagical Nudge
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Install Chrome Extension
                </h4>
                <p className="text-gray-600 text-sm mb-2">
                  Add Automagical Nudge to your Chrome browser to start using it
                  in Gmail.
                </p>
                <a
                  href="https://chromewebstore.google.com/detail/automagical-nudge/dcedcbkogfnegennlbahojfpodapjbkle"
                  target="_blank"
                  className="text-primary font-semibold text-sm hover:underline"
                >
                  Install Extension →
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Connect Your Gmail
                </h4>
                <p className="text-gray-600 text-sm">
                  Open Gmail and sign in to the extension to start tracking your
                  emails.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Create Your First Nudge
                </h4>
                <p className="text-gray-600 text-sm">
                  Set up automated follow-up sequences for your important
                  emails.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
