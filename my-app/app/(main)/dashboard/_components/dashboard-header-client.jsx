"use client";


export default function DashboardHeaderClient({ user }) {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Hello, {user?.name || "User"}! 👋
          </h1>
          <p className="text-blue-100 text-lg">
            Here's your financial overview for today
          </p>
        </div>
      </div>

    </div>
  );
}
