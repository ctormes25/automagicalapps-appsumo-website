"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from 'next/link'

export default function Home() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Redirect if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard");
      } else {
        setCheckingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Show loading state while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎯</span>
              <h1 className="text-2xl font-bold text-gray-900">Automagical Nudge</h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-primary">
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Never Miss a Follow-up
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Automate your email follow-ups with AI-powered nudges. 
              Keep conversations alive and boost your response rates.
            </p>
            
            <div className="flex justify-center space-x-4">
              <Link 
                href="/register" 
                className="bg-primary text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-dark transition"
              >
                Start Free Trial
              </Link>
              <a 
                href="https://chrome.google.com/webstore" 
                target="_blank"
                className="bg-white text-primary border-2 border-primary px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition"
              >
                View Extension
              </a>
            </div>
          </div>

          {/* Features */}
          <div className="mt-20 grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
              <p className="text-gray-600">
                Smart AI suggestions for follow-up emails based on conversation context.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-semibold mb-2">Automatic Reminders</h3>
              <p className="text-gray-600">
                Never forget to follow up. Get timely reminders right in Gmail.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Analytics</h3>
              <p className="text-gray-600">
                Track your follow-up performance and optimize your outreach.
              </p>
            </div>
          </div>

          {/* AppSumo Section */}
          <div className="mt-20 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">🌮</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Available on AppSumo
            </h3>
            <p className="text-gray-700 mb-6">
              Get lifetime access to Automagical Nudge at an exclusive AppSumo deal!
            </p>
            <a 
              href="https://appsumo.com" 
              target="_blank"
              className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              View Deal on AppSumo
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Automagical Nudge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
