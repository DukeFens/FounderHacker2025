import Link from 'next/link';
import { Activity, Target, TrendingUp, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm to-amber-50">
      {/* Test element to verify Tailwind is working */}
      <div className="bg-red-500 text-white p-4 text-center text-2xl font-bold">
        🧪 TAILWIND TEST - If you see this in red with white text, Tailwind is working!
      </div>
      
      {/* Header */}
      <header className="px-6 py-4">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-800">PhysioPosture</div>
          <div className="flex gap-4">
            <Link href="/live" className="btn-secondary">
              Try Live Coach
            </Link>
            <Link href="/review" className="btn-primary">
              Clinician Review
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 text-balance">
            AI-Powered Posture Feedback
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-12 text-balance">
            Real-time movement analysis and personalized coaching for physiotherapy and rehabilitation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/live" className="btn-primary text-lg px-8 py-4">
              Start Live Session
              <ArrowRight className="ml-2 inline-block w-5 h-5" />
            </Link>
            <Link href="/review" className="btn-secondary text-lg px-8 py-4">
              View Demo Data
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Track Body Movement */}
            <div className="feature-card group">
              <div className="relative mb-6">
                <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                  <Activity className="w-16 h-16 text-blue-600" />
                </div>
                {/* Pose overlay dots */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 relative">
                    {/* Head */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full opacity-60"></div>
                    {/* Shoulders */}
                    <div className="absolute top-8 left-1/4 w-2 h-2 bg-white rounded-full opacity-60"></div>
                    <div className="absolute top-8 right-1/4 w-2 h-2 bg-white rounded-full opacity-60"></div>
                    {/* Arms */}
                    <div className="absolute top-12 left-1/6 w-2 h-2 bg-white rounded-full opacity-60"></div>
                    <div className="absolute top-12 right-1/6 w-2 h-2 bg-white rounded-full opacity-60"></div>
                    {/* Hips */}
                    <div className="absolute top-16 left-1/3 w-2 h-2 bg-white rounded-full opacity-60"></div>
                    <div className="absolute top-16 right-1/3 w-2 h-2 bg-white rounded-full opacity-60"></div>
                    {/* Knees */}
                    <div className="absolute top-20 left-1/3 w-2 h-2 bg-white rounded-full opacity-60"></div>
                    <div className="absolute top-20 right-1/3 w-2 h-2 bg-white rounded-full opacity-60"></div>
                    {/* Ankles */}
                    <div className="absolute top-24 left-1/3 w-2 h-2 bg-white rounded-full opacity-60"></div>
                    <div className="absolute top-24 right-1/3 w-2 h-2 bg-white rounded-full opacity-60"></div>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Track Body Movement
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Identify key landmarks to understand movement and posture with millimeter precision.
              </p>
            </div>

            {/* Ensure Proper Form */}
            <div className="feature-card group">
              <div className="relative mb-6">
                <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                  <Target className="w-16 h-16 text-green-600" />
                </div>
                {/* Form guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 relative">
                    {/* Vertical alignment line */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white opacity-40"></div>
                    {/* Horizontal guides */}
                    <div className="absolute top-8 left-0 right-0 h-px bg-white opacity-40"></div>
                    <div className="absolute top-16 left-0 right-0 h-px bg-white opacity-40"></div>
                    <div className="absolute top-24 left-0 right-0 h-px bg-white opacity-40"></div>
                    {/* Pose dots */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full opacity-60"></div>
                    <div className="absolute top-8 left-1/4 w-2 h-2 bg-white rounded-full opacity-60"></div>
                    <div className="absolute top-8 right-1/4 w-2 h-2 bg-white rounded-full opacity-60"></div>
                    <div className="absolute top-16 left-1/3 w-2 h-2 bg-white rounded-full opacity-60"></div>
                    <div className="absolute top-16 right-1/3 w-2 h-2 bg-white rounded-full opacity-60"></div>
                    <div className="absolute top-24 left-1/3 w-2 h-2 bg-white rounded-full opacity-60"></div>
                    <div className="absolute top-24 right-1/3 w-2 h-2 bg-white rounded-full opacity-60"></div>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ensure Proper Form
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Make exercise safe and effective with real-time cues and form validation.
              </p>
            </div>

            {/* Evaluate Overall Health */}
            <div className="feature-card group">
              <div className="relative mb-6">
                <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-16 h-16 text-purple-600" />
                </div>
                {/* Progress overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 relative">
                    {/* Progress line */}
                    <svg className="w-full h-full" viewBox="0 0 128 128">
                      <path
                        d="M20 100 Q40 80 60 90 T100 70"
                        stroke="white"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.6"
                      />
                      {/* Data points */}
                      <circle cx="20" cy="100" r="2" fill="white" opacity="0.8" />
                      <circle cx="40" cy="80" r="2" fill="white" opacity="0.8" />
                      <circle cx="60" cy="90" r="2" fill="white" opacity="0.8" />
                      <circle cx="80" cy="75" r="2" fill="white" opacity="0.8" />
                      <circle cx="100" cy="70" r="2" fill="white" opacity="0.8" />
                    </svg>
                    {/* Pose dots */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full opacity-60"></div>
                    <div className="absolute top-8 left-1/4 w-2 h-2 bg-white rounded-full opacity-60"></div>
                    <div className="absolute top-8 right-1/4 w-2 h-2 bg-white rounded-full opacity-60"></div>
                    <div className="absolute top-16 left-1/3 w-2 h-2 bg-white rounded-full opacity-60"></div>
                    <div className="absolute top-16 right-1/3 w-2 h-2 bg-white rounded-full opacity-60"></div>
                    <div className="absolute top-24 left-1/3 w-2 h-2 bg-white rounded-full opacity-60"></div>
                    <div className="absolute top-24 right-1/3 w-2 h-2 bg-white rounded-full opacity-60"></div>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Evaluate Overall Health
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Measure ROM and stability for functional progress tracking and rehabilitation planning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-white/50">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p>&copy; 2024 PhysioPosture. Built with Next.js, TypeScript, and AI.</p>
        </div>
      </footer>
    </div>
  );
}
