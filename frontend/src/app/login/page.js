"use client";

import { useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  UsersRound,
} from "lucide-react";

import "./login.css";

const STAR_LAYOUT = Array.from({ length: 55 }, (_, index) => ({
  x: `${((index * 13.7 + 9.4) % 100).toFixed(2)}%`,
  y: `${((index * 17.3 + 11.8) % 100).toFixed(2)}%`,
  delay: `${((index * 0.63 + 0.18) % 5).toFixed(3)}s`,
  size: `${(1 + ((index * 1.77) % 3)).toFixed(3)}px`,
}));

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // ADDED: login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ADDED: loading and error states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const roles = [
    {
      id: "student",
      title: "Student",
      description: "Build skills & discover opportunities",
      icon: GraduationCap,
      color: "blue",
    },
    {
      id: "industry",
      title: "Industry",
      description: "Find skilled & verified talent",
      icon: BriefcaseBusiness,
      color: "industry",
    },
    {
      id: "academician",
      title: "Academician",
      description: "Connect learning with industry",
      icon: UsersRound,
      color: "green",
    },
    {
      id: "institution",
      title: "Institution",
      description: "Manage skills, placements & insights",
      icon: Building2,
      color: "orange",
    },
  ];

  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          role: selectedRole,
          rememberMe,
        }),
      });

      const data = await response.json();

      console.log("Login response:", data);

      if (!response.ok || !data.success) {
        setErrorMessage(
          data.message || "Invalid email or password."
        );
        setLoading(false);
        return;
      }

      // Student login successful
      if (selectedRole === "student") {
        window.location.href = "/dashboard";
        return;
      }

      // For roles that are not implemented yet
      setErrorMessage(
        `${selectedRole} login is not available yet.`
      );

      setLoading(false);
    } catch (error) {
      console.error("Login request error:", error);

      setErrorMessage(
        "Unable to connect to the server. Please try again."
      );

      setLoading(false);
    }
  };

  return (
    <main className="login-page">

      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>
      <div className="background-glow glow-three"></div>

      <div className="stars">
        {STAR_LAYOUT.map((star, index) => (
          <span
            key={index}
            className="star"
            style={{
              "--x": star.x,
              "--y": star.y,
              "--delay": star.delay,
              "--size": star.size,
            }}
          />
        ))}
      </div>

      <header className="top-header">

        <div className="brand">
          <span className="brand-skill">Skill</span>
          <span className="brand-net">Net</span>
        </div>

        <button
          type="button"
          className="home-button"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          <ArrowLeft size={19} strokeWidth={1.8} />
          <span>Back to Home</span>
        </button>

      </header>

      <section className="login-container">

        {/* =====================================================
            LEFT SIDE
        ===================================================== */}

        <div className="hero-section">

          <div className="welcome-pill">
            <Sparkles size={16} strokeWidth={2} />
            <span>Welcome back!</span>
          </div>

          <h1>
            Your skills.
            <br />
            <span className="gradient-text">
              Your journey.
            </span>
            <br />
            <span className="purple-text">
              Your future.
            </span>
          </h1>

          <p className="hero-description">
            Sign in to continue your journey and
            <br />
            unlock a world of opportunities.
          </p>

          <div className="feature-list">

            <div className="feature-item">
              <div className="feature-icon purple-icon">
                <GraduationCap
                  size={24}
                  strokeWidth={2}
                />
              </div>

              <div>
                <strong>
                  Personalized Learning Paths
                </strong>

                <span>
                  AI-powered roadmap just for you
                </span>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon blue-icon">
                <BriefcaseBusiness
                  size={23}
                  strokeWidth={2}
                />
              </div>

              <div>
                <strong>
                  Industry Connections
                </strong>

                <span>
                  Connect with top recruiters
                </span>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon green-icon">
                <UsersRound
                  size={24}
                  strokeWidth={2}
                />
              </div>

              <div>
                <strong>
                  Skill Verification
                </strong>

                <span>
                  Showcase your real-world skills
                </span>
              </div>
            </div>

          </div>

          <div className="orbit-system">

            <div className="orbit orbit-one"></div>
            <div className="orbit orbit-two"></div>
            <div className="orbit orbit-three"></div>

            <div className="orbit-dot dot-one"></div>
            <div className="orbit-dot dot-two"></div>
            <div className="orbit-dot dot-three"></div>
            <div className="orbit-dot dot-four"></div>

            <div className="skillnet-core">

              <div className="core-content">

                <div className="core-logo">
                  <span>Skill</span>
                  <b>Net</b>
                </div>

                <p>Connected Skills</p>
                <p>Ecosystem</p>

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            LOGIN CARD
        ===================================================== */}

        <div className="login-card">

          <div className="card-heading">

            <h2>
              Sign in to SkillNet
            </h2>

            <p>
              Choose your role to continue
            </p>

          </div>

          {/* ROLES */}

          <div className="roles-grid">

            {roles.map((role) => {

              const Icon = role.icon;

              return (
                <button
                  key={role.id}
                  type="button"
                  className={`role-card ${
                    selectedRole === role.id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedRole(role.id)
                  }
                >

                  <div
                    className={`role-icon ${role.color}`}
                  >
                    <Icon
                      size={34}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className="role-content">

                    <h3>
                      {role.title}
                    </h3>

                    <p>
                      {role.description}
                    </p>

                  </div>

                  {selectedRole === role.id && (
                    <div className="selected-check">
                      ✓
                    </div>
                  )}

                </button>
              );

            })}

          </div>

          {/* LOGIN FORM */}

          <form
            onSubmit={handleSubmit}
            className="login-form"
          >

            {/* EMAIL */}

            <div className="input-group">

              <label htmlFor="email">
                Email address
              </label>

              <div className="input-wrapper">

                <Mail
                  className="input-icon"
                  size={21}
                  strokeWidth={1.8}
                />

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />

                <User
                  className="input-user"
                  size={21}
                  strokeWidth={1.8}
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="input-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">

                <LockKeyhole
                  className="input-icon"
                  size={21}
                  strokeWidth={1.8}
                />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showPassword ? (
                    <EyeOff
                      size={21}
                      strokeWidth={1.8}
                    />
                  ) : (
                    <Eye
                      size={21}
                      strokeWidth={1.8}
                    />
                  )}

                </button>

              </div>

            </div>

            {/* ERROR MESSAGE */}

            {errorMessage && (
              <div className="login-error">
                {errorMessage}
              </div>
            )}

            {/* OPTIONS */}

            <div className="form-options">

              <label className="remember">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(
                      e.target.checked
                    )
                  }
                />

                <span className="custom-checkbox"></span>

                <span>
                  Remember me
                </span>

              </label>

              <button
                type="button"
                className="forgot-password"
              >
                Forgot password?
              </button>

            </div>

            {/* SIGN IN */}

            <button
              type="submit"
              className="sign-in-button"
              disabled={loading}
            >

              <span>
                {loading
                  ? "Signing in..."
                  : "Sign In"}
              </span>

              {!loading && (
                <ArrowRight
                  className="button-arrow"
                  size={25}
                  strokeWidth={2}
                />
              )}

            </button>

          </form>

          <div className="signup-text">

            <span>
              Don’t have an account?
            </span>

            <button
              type="button"
              onClick={() => {
                window.location.href =
                  "/signup";
              }}
            >
              Create one
            </button>

          </div>

          <div className="security-message">

            <ShieldCheck
              className="security-icon"
              size={21}
              strokeWidth={1.8}
            />

            <span>
              Your data is protected with
              enterprise-grade security
            </span>

          </div>

        </div>

      </section>

    </main>
  );
}