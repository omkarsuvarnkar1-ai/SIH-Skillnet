"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AcademicianRegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    institutionName: "",
    designation: "",
    department: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/academician/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Registration failed.");
        return;
      }

      setMessage("Account created successfully!");

      setTimeout(() => {
        router.push("/academician/academician-login");
      }, 1000);
    } catch (error) {
      console.error("Registration error:", error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f7fb",
        padding: "30px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "#fff",
          padding: "35px",
          borderRadius: "18px",
          boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "8px",
          }}
        >
          Academician Registration
        </h1>

        <p
          style={{
            color: "#667085",
            marginBottom: "25px",
          }}
        >
          Create your SkillNet academician account.
        </p>

        {[
          ["fullName", "Full Name", "Enter your full name", "text"],
          ["email", "Email", "Enter your email", "email"],
          ["password", "Password", "Create a password", "password"],
          [
            "institutionName",
            "Institution",
            "Enter your institution",
            "text",
          ],
          [
            "designation",
            "Designation",
            "e.g. Professor, Assistant Professor",
            "text",
          ],
          [
            "department",
            "Department",
            "e.g. Computer Engineering",
            "text",
          ],
        ].map(([name, label, placeholder, type]) => (
          <div
            key={name}
            style={{
              marginBottom: "16px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
              }}
            >
              {label}
            </label>

            <input
              type={type}
              name={name}
              value={form[name]}
              onChange={handleChange}
              placeholder={placeholder}
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                border: "1px solid #d0d5dd",
                borderRadius: "8px",
                fontSize: "15px",
              }}
            />
          </div>
        ))}

        {error && (
          <p
            style={{
              color: "#b42318",
              marginBottom: "15px",
            }}
          >
            {error}
          </p>
        )}

        {message && (
          <p
            style={{
              color: "#027a48",
              marginBottom: "15px",
            }}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px",
            border: "none",
            borderRadius: "8px",
            background: "#111827",
            color: "#fff",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>
    </main>
  );
}