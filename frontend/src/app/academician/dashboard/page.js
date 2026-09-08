"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AcademicianDashboard() {
  const router = useRouter();

  const [academician, setAcademician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/academician/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || "Unable to load academician profile.");
          return;
        }

        setAcademician(data.academician);
      } catch (error) {
        console.error("Dashboard profile error:", error);
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-10 rounded-2xl shadow-lg text-center">
          <p className="text-gray-600">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-10 rounded-2xl shadow-lg text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Unable to load dashboard
          </h1>

          <p className="text-gray-600 mt-3">
            {error}
          </p>

          <button
            onClick={() => router.push("/academician-login")}
            className="mt-6 px-5 py-2 bg-gray-900 text-white rounded-lg"
          >
            Back to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {academician.fullName}
          </h1>

          <p className="text-gray-600 mt-2">
            Academician Dashboard
          </p>
        </div>

        {/* Profile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Profile Information
            </h2>

            <div className="space-y-4">

              <div>
                <p className="text-sm text-gray-500">
                  Full Name
                </p>

                <p className="font-semibold text-gray-900">
                  {academician.fullName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Email
                </p>

                <p className="font-semibold text-gray-900">
                  {academician.email}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Institution
                </p>

                <p className="font-semibold text-gray-900">
                  {academician.institutionName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Designation
                </p>

                <p className="font-semibold text-gray-900">
                  {academician.designation}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Department
                </p>

                <p className="font-semibold text-gray-900">
                  {academician.department}
                </p>
              </div>

            </div>
          </div>

          {/* Academician Activities */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Academic Activities
            </h2>

            <div className="space-y-3">

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-semibold">
                  Student Skill Assessments
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Manage and review student assessments.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-semibold">
                  Industry Opportunities
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Explore internships, training and collaboration opportunities.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-semibold">
                  Student Skill Mapping
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Monitor student skills and development progress.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </main>
  );
}