"use client";

import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import ImageCropper from "@/components/ImageCropper";
import type { Profile, Project } from "@/types/project";

export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Data state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<"profile" | "projects">("profile");

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Edit / Add Modal state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectForm, setProjectForm] = useState<Partial<Project>>({
    name: "",
    description: "",
    techStack: [],
    liveUrl: "",
    githubUrl: "",
    coverImageUrl: "",
    devTime: "",
    startDate: "",
    endDate: "",
    status: "live",
    tags: [],
    role: "",
  });
  const [techInput, setTechInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  // Crop state
  const [cropTarget, setCropTarget] = useState<"avatar" | "cover" | null>(null);

  // Trigger Toast Notification
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Check authentication status on mount
  useEffect(() => {
    fetchAuthCheck();
  }, []);

  const fetchAuthCheck = async () => {
    try {
      const res = await fetch("/api/auth/check");
      if (res.ok) {
        setIsAuthenticated(true);
        fetchData();
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const fetchData = async () => {
    try {
      const [profileRes, projectsRes] = await Promise.all([
        fetch("/api/admin/profile"),
        fetch("/api/admin/projects"),
      ]);

      if (profileRes.ok) {
        const profileData = (await profileRes.json()) as Profile;
        setProfile(profileData);
      }
      if (projectsRes.ok) {
        const projectsData = (await projectsRes.json()) as Project[];
        setProjects(projectsData);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
      showToast("Error loading profile/projects data", "error");
    }
  };

  // Login handler
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!usernameInput || !passwordInput) {
      setAuthError("All fields are required");
      return;
    }

    setIsSubmittingAuth(true);
    setAuthError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        showToast("Logged in successfully!");
        fetchData();
      } else {
        const data = (await res.json()) as { error?: string };
        setAuthError(data.error || "Login failed");
      }
    } catch {
      setAuthError("Network error. Try again.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setIsAuthenticated(false);
        setProfile(null);
        setProjects([]);
        showToast("Logged out successfully");
      }
    } catch {
      showToast("Logout failed", "error");
    }
  };

  // Save Profile handler
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        showToast("Profile saved successfully");
        fetchData();
      } else {
        showToast("Failed to save profile", "error");
      }
    } catch {
      showToast("Network error saving profile", "error");
    }
  };

  // Open edit / add project modal
  const openProjectModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setProjectForm(project);
    } else {
      setIsAddingProject(true);
      setProjectForm({
        name: "",
        description: "",
        techStack: [],
        liveUrl: "",
        githubUrl: "",
        coverImageUrl: "",
        devTime: "",
        startDate: "",
        endDate: "",
        status: "live",
        tags: [],
        role: "",
      });
    }
    setTechInput("");
    setTagInput("");
  };

  // Save Project handler (Add or Update)
  const handleSaveProject = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectForm.name || !projectForm.description) {
      showToast("Name and Description are required", "error");
      return;
    }

    const isEdit = !!editingProject;
    const url = "/api/admin/projects";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectForm),
      });

      if (res.ok) {
        showToast(isEdit ? "Project updated!" : "Project added!");
        setEditingProject(null);
        setIsAddingProject(false);
        fetchData();
      } else {
        showToast("Failed to save project", "error");
      }
    } catch {
      showToast("Network error saving project", "error");
    }
  };

  // Delete Project handler
  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const res = await fetch(`/api/admin/projects?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Project deleted");
        fetchData();
      } else {
        showToast("Failed to delete project", "error");
      }
    } catch {
      showToast("Network error deleting project", "error");
    }
  };

  // Handle R2 Image Upload of Cropped WebP Blob
  const handleUploadImage = async (blob: Blob, target: "avatar" | "cover") => {
    setCropTarget(null);
    const formData = new FormData();
    formData.append("file", blob, target === "avatar" ? "avatar.webp" : "cover.webp");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = (await res.json()) as { url: string };
        if (target === "avatar" && profile) {
          setProfile({ ...profile, avatarUrl: data.url });
          showToast("Cropped avatar uploaded successfully!");
        } else if (target === "cover") {
          setProjectForm(prev => ({ ...prev, coverImageUrl: data.url }));
          showToast("Cropped project cover uploaded successfully!");
        }
      } else {
        showToast("Failed to upload image", "error");
      }
    } catch {
      showToast("Network error uploading image", "error");
    }
  };

  // Tech stack dynamic tag management
  const addTech = () => {
    const val = techInput.trim();
    if (val && !projectForm.techStack?.includes(val)) {
      setProjectForm(prev => ({
        ...prev,
        techStack: [...(prev.techStack || []), val]
      }));
      setTechInput("");
    }
  };

  const removeTech = (item: string) => {
    setProjectForm(prev => ({
      ...prev,
      techStack: (prev.techStack || []).filter(t => t !== item)
    }));
  };

  // Tags dynamic tag management
  const addTag = () => {
    const val = tagInput.trim();
    if (val && !projectForm.tags?.includes(val)) {
      setProjectForm(prev => ({
        ...prev,
        tags: [...(prev.tags || []), val]
      }));
      setTagInput("");
    }
  };

  const removeTag = (item: string) => {
    setProjectForm(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== item)
    }));
  };

  // Render Loader while checking session auth
  if (isAuthenticated === null) {
    return (
      <div 
        style={{
          display: "flex", height: "100vh", alignItems: "center", justifyContent: "center",
          background: "var(--bg)", color: "var(--text-3)", fontFamily: "var(--font-geist-mono)"
        }}
      >
        Checking Auth Status...
      </div>
    );
  }

  // Render Login Card
  if (!isAuthenticated) {
    return (
      <div 
        style={{
          display: "flex", height: "100vh", alignItems: "center", justifyContent: "center",
          background: "var(--bg)", position: "relative", padding: "1.5rem", overflow: "hidden"
        }}
      >
        <div className="spotlight" />
        
        <form 
          onSubmit={handleLogin}
          style={{
            maxWidth: "380px", width: "100%", background: "var(--bg-card)",
            border: "1px solid var(--border-md)", borderRadius: "var(--r-lg)",
            padding: "2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 0 50px var(--blue-glow)",
            zIndex: 10
          }}
        >
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span className="overline">Control Panel</span>
            <h2 className="section-title" style={{ fontSize: "1.5rem" }}>Admin Portal</h2>
          </div>

          {authError && (
            <div style={{ fontSize: "0.8125rem", color: "var(--yellow)", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: "6px", padding: "0.625rem 0.875rem" }}>
              {authError}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-2)", fontFamily: "var(--font-geist-mono)" }}>Username</label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                style={{
                  background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px",
                  padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "var(--text-1)", outline: "none",
                  transition: "border-color 150ms ease",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--blue-light)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
                placeholder="admin"
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-2)", fontFamily: "var(--font-geist-mono)" }}>Password</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{
                  background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px",
                  padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "var(--text-1)", outline: "none",
                  transition: "border-color 150ms ease",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--blue-light)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: "100%", justifyContent: "center" }}
            disabled={isSubmittingAuth}
          >
            {isSubmittingAuth ? "Verifying..." : "Login"}
          </button>
        </form>
      </div>
    );
  }

  // Render Dashboard Workspace
  return (
    <div className="page-wrap" style={{ minHeight: "100vh", paddingTop: "4rem" }}>
      <div className="spotlight" />

      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "1.5rem", marginBottom: "2.5rem" }}>
        <div>
          <h1 className="section-title" style={{ fontSize: "1.75rem" }}>Dashboard</h1>
          <span style={{ fontSize: "0.75rem", color: "var(--text-3)", fontFamily: "var(--font-geist-mono)" }}>Manage your developer portfolio contents</span>
        </div>
        
        <button className="btn-ghost" onClick={handleLogout} style={{ gap: "0.4rem" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>

      {/* Tab Selectors */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border)", marginBottom: "2rem" }}>
        <button 
          onClick={() => setActiveTab("profile")}
          style={{
            padding: "0.75rem 1.25rem", border: "none", borderBottom: activeTab === "profile" ? "2px solid var(--blue)" : "2px solid transparent",
            background: "none", cursor: "pointer", color: activeTab === "profile" ? "var(--text-1)" : "var(--text-3)",
            fontSize: "0.875rem", fontWeight: 500, transition: "all 150ms ease"
          }}
        >
          Profile Information
        </button>
        <button 
          onClick={() => setActiveTab("projects")}
          style={{
            padding: "0.75rem 1.25rem", border: "none", borderBottom: activeTab === "projects" ? "2px solid var(--blue)" : "2px solid transparent",
            background: "none", cursor: "pointer", color: activeTab === "projects" ? "var(--text-1)" : "var(--text-3)",
            fontSize: "0.875rem", fontWeight: 500, transition: "all 150ms ease"
          }}
        >
          Projects Manager ({projects.length})
        </button>
      </div>

      {/* Toast popup */}
      {toast && (
        <div 
          style={{
            position: "fixed", bottom: "2rem", right: "2rem", zIndex: 1000,
            padding: "0.75rem 1.25rem", borderRadius: "6px", fontSize: "0.8125rem", fontWeight: 500,
            background: toast.type === "success" ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.15)",
            border: toast.type === "success" ? "1px solid var(--green)" : "1px solid red",
            color: toast.type === "success" ? "var(--green)" : "red",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
          }}
        >
          {toast.message}
        </div>
      )}

      {/* TAB 1: PROFILE EDIT FORM */}
      {activeTab === "profile" && profile && (
        <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "680px" }}>
          
          {/* Avatar and Info Header */}
          <div style={{ display: "flex", gap: "1.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", width: "100px", height: "100px", borderRadius: "50%", overflow: "hidden", border: "2px solid var(--border-blue)", flexShrink: 0 }}>
              {profile.avatarUrl ? (
                <Image src={profile.avatarUrl} alt="Avatar" fill style={{ objectFit: "cover" }} />
              ) : (
                <div style={{ background: "var(--bg-hover)", width: "100%", height: "100%" }} />
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <button 
                type="button" 
                className="btn-ghost" 
                onClick={() => setCropTarget("avatar")}
                style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
              >
                Crop & Upload New Avatar
              </button>
              <span style={{ fontSize: "0.6875rem", color: "var(--text-3)" }}>Optimized automatically on crop applied</span>
            </div>
          </div>

          {/* Form grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-2)", fontFamily: "var(--font-geist-mono)" }}>Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "var(--text-1)", outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-2)", fontFamily: "var(--font-geist-mono)" }}>Job Title / Primary Hook</label>
              <input
                type="text"
                value={profile.jobTitle}
                onChange={e => setProfile({ ...profile, jobTitle: e.target.value })}
                style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "var(--text-1)", outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-2)", fontFamily: "var(--font-geist-mono)" }}>Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={e => setProfile({ ...profile, location: e.target.value })}
                style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "var(--text-1)", outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-2)", fontFamily: "var(--font-geist-mono)" }}>Contact Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
                style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "var(--text-1)", outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-2)", fontFamily: "var(--font-geist-mono)" }}>Resume / CV URL</label>
              <input
                type="text"
                value={profile.resumeUrl}
                onChange={e => setProfile({ ...profile, resumeUrl: e.target.value })}
                style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "var(--text-1)", outline: "none" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={{ fontSize: "0.75rem", color: "var(--text-2)", fontFamily: "var(--font-geist-mono)" }}>Bio / Pitch Text</label>
            <textarea
              rows={4}
              value={profile.bio}
              onChange={e => setProfile({ ...profile, bio: e.target.value })}
              style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "var(--text-1)", outline: "none", resize: "vertical", lineHeight: "1.4" }}
            />
          </div>

          {/* Social Links Sub-Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
            <h4 style={{ fontSize: "0.875rem", color: "var(--text-1)", fontWeight: 500 }}>Social Media Profiles</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", color: "var(--text-3)", fontFamily: "var(--font-geist-mono)" }}>LinkedIn</label>
                <input
                  type="text"
                  value={profile.socials.linkedin || ""}
                  onChange={e => setProfile({ ...profile, socials: { ...profile.socials, linkedin: e.target.value } })}
                  style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "var(--text-1)", outline: "none" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", color: "var(--text-3)", fontFamily: "var(--font-geist-mono)" }}>GitHub</label>
                <input
                  type="text"
                  value={profile.socials.github || ""}
                  onChange={e => setProfile({ ...profile, socials: { ...profile.socials, github: e.target.value } })}
                  style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "var(--text-1)", outline: "none" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", color: "var(--text-3)", fontFamily: "var(--font-geist-mono)" }}>Twitter / X</label>
                <input
                  type="text"
                  value={profile.socials.x || ""}
                  onChange={e => setProfile({ ...profile, socials: { ...profile.socials, x: e.target.value } })}
                  style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "var(--text-1)", outline: "none" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", color: "var(--text-3)", fontFamily: "var(--font-geist-mono)" }}>Instagram</label>
                <input
                  type="text"
                  value={profile.socials.instagram || ""}
                  onChange={e => setProfile({ ...profile, socials: { ...profile.socials, instagram: e.target.value } })}
                  style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "var(--text-1)", outline: "none" }}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: "fit-content", padding: "0.75rem 2rem", marginTop: "1rem" }}>
            Save Profile Changes
          </button>
        </form>
      )}

      {/* TAB 2: PROJECTS MANAGER */}
      {activeTab === "projects" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Add project button */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn-primary" onClick={() => openProjectModal()} style={{ gap: "0.4rem" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add New Project
            </button>
          </div>

          {/* Projects Table List */}
          <div style={{ overflowX: "auto", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-3)" }}>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 500, fontFamily: "var(--font-geist-mono)", fontSize: "0.75rem" }}>Cover</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 500, fontFamily: "var(--font-geist-mono)", fontSize: "0.75rem" }}>Name / Status</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 500, fontFamily: "var(--font-geist-mono)", fontSize: "0.75rem" }}>Role / Dev Time</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 500, fontFamily: "var(--font-geist-mono)", fontSize: "0.75rem" }}>Tags</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 500, fontFamily: "var(--font-geist-mono)", fontSize: "0.75rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "var(--text-3)" }}>
                      No projects available. Click "Add New Project" to get started.
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr key={project.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 150ms ease" }} className="table-row-hover">
                      {/* Image cell */}
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ position: "relative", width: "64px", aspectRatio: "4/3", borderRadius: "6px", overflow: "hidden", background: "var(--bg-hover)", border: "1px solid var(--border)" }}>
                          {project.coverImageUrl ? (
                            <Image src={project.coverImageUrl} alt={project.name} fill style={{ objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "100%", height: "100%" }} />
                          )}
                        </div>
                      </td>
                      {/* Name / Status */}
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                          <span style={{ fontWeight: 600, color: "var(--text-1)" }}>{project.name}</span>
                          <span style={{ fontSize: "0.75rem", textTransform: "capitalize", color: project.status === "live" ? "var(--green)" : project.status === "in-progress" ? "var(--yellow)" : "var(--text-3)" }}>
                            {project.status.replace("-", " ")}
                          </span>
                        </div>
                      </td>
                      {/* Role */}
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                          <span style={{ color: "var(--text-2)" }}>{project.role}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-3)", fontFamily: "var(--font-geist-mono)" }}>{project.devTime}</span>
                        </div>
                      </td>
                      {/* Tags */}
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap", maxWidth: "240px" }}>
                          {project.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="badge badge-tag" style={{ fontSize: "0.625rem" }}>{tag}</span>
                          ))}
                          {project.tags.length > 3 && (
                            <span style={{ fontSize: "0.625rem", color: "var(--text-3)" }}>+{project.tags.length - 3}</span>
                          )}
                        </div>
                      </td>
                      {/* Actions */}
                      <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <button className="btn-ghost" onClick={() => openProjectModal(project)} style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>
                            Edit
                          </button>
                          <button 
                            className="btn-ghost" 
                            onClick={() => handleDeleteProject(project.id)}
                            style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem", borderColor: "rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.7)" }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = "red";
                              e.currentTarget.style.color = "red";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)";
                              e.currentTarget.style.color = "rgba(239,68,68,0.7)";
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PROJECT ADD/EDIT MODAL FORM */}
      {(editingProject || isAddingProject) && (
        <div className="modal-backdrop" style={{ display: "flex" }}>
          <form 
            onSubmit={handleSaveProject} 
            className="modal-box" 
            style={{ maxWidth: "600px", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
              <h3 className="section-title" style={{ fontSize: "1.25rem" }}>
                {editingProject ? "Edit Project" : "Add New Project"}
              </h3>
              <button 
                type="button" 
                onClick={() => {
                  setEditingProject(null);
                  setIsAddingProject(false);
                }} 
                style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="12" />
                </svg>
              </button>
            </div>

            {/* Cover Image Upload Area */}
            <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
              <div style={{ position: "relative", width: "120px", aspectRatio: "4/3", borderRadius: "8px", overflow: "hidden", background: "var(--bg-hover)", border: "1px solid var(--border)", flexShrink: 0 }}>
                {projectForm.coverImageUrl ? (
                  <Image src={projectForm.coverImageUrl} alt="Project Cover" fill style={{ objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", fontSize: "0.6875rem", fontFamily: "var(--font-geist-mono)" }}>No Cover</div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <button 
                  type="button" 
                  className="btn-ghost" 
                  onClick={() => setCropTarget("cover")}
                  style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
                >
                  Crop & Upload Project Cover
                </button>
                <span style={{ fontSize: "0.6875rem", color: "var(--text-3)" }}>Aspect locked at 4:3. Optimized automatically to WebP.</span>
              </div>
            </div>

            {/* Inputs Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", color: "var(--text-2)", fontFamily: "var(--font-geist-mono)" }}>Project Name *</label>
                <input
                  type="text"
                  required
                  value={projectForm.name || ""}
                  onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                  style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "var(--text-1)", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", color: "var(--text-2)", fontFamily: "var(--font-geist-mono)" }}>Your Role / Position</label>
                <input
                  type="text"
                  value={projectForm.role || ""}
                  onChange={e => setProjectForm({ ...projectForm, role: e.target.value })}
                  style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "var(--text-1)", outline: "none" }}
                  placeholder="e.g. Creator & Developer"
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", color: "var(--text-2)", fontFamily: "var(--font-geist-mono)" }}>Development Duration</label>
                <input
                  type="text"
                  value={projectForm.devTime || ""}
                  onChange={e => setProjectForm({ ...projectForm, devTime: e.target.value })}
                  style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "var(--text-1)", outline: "none" }}
                  placeholder="e.g. 6 weeks, 2 months"
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", color: "var(--text-2)", fontFamily: "var(--font-geist-mono)" }}>Status</label>
                <select
                  value={projectForm.status || "live"}
                  onChange={e => setProjectForm({ ...projectForm, status: e.target.value as any })}
                  style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "var(--text-1)", outline: "none", cursor: "pointer" }}
                >
                  <option value="live">Live</option>
                  <option value="in-progress">In Progress</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", color: "var(--text-2)", fontFamily: "var(--font-geist-mono)" }}>Live Demo URL</label>
                <input
                  type="url"
                  value={projectForm.liveUrl || ""}
                  onChange={e => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                  style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "var(--text-1)", outline: "none" }}
                  placeholder="https://..."
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.75rem", color: "var(--text-2)", fontFamily: "var(--font-geist-mono)" }}>GitHub Repository URL</label>
                <input
                  type="url"
                  value={projectForm.githubUrl || ""}
                  onChange={e => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                  style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "var(--text-1)", outline: "none" }}
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-2)", fontFamily: "var(--font-geist-mono)" }}>Project Description *</label>
              <textarea
                rows={3}
                required
                value={projectForm.description || ""}
                onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "var(--text-1)", outline: "none", resize: "vertical", lineHeight: "1.4" }}
              />
            </div>

            {/* Dynamic Tags Input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-2)", fontFamily: "var(--font-geist-mono)" }}>Tech Stack Items</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={techInput}
                  onChange={e => setTechInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTech())}
                  placeholder="Type tech name (e.g. Next.js) and press Enter"
                  style={{ flex: 1, background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "var(--text-1)", outline: "none" }}
                />
                <button type="button" className="btn-ghost" onClick={addTech}>Add</button>
              </div>
              <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                {projectForm.techStack?.map((item) => (
                  <span 
                    key={item} 
                    className="tech-pill"
                    style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                    onClick={() => removeTech(item)}
                    title="Click to remove"
                  >
                    {item}
                    <span style={{ opacity: 0.5, fontSize: "10px" }}>×</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Dynamic Project Categories / Tags */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-2)", fontFamily: "var(--font-geist-mono)" }}>Project Categories / Tags</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Type tag (e.g. SaaS) and press Enter"
                  style={{ flex: 1, background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "var(--text-1)", outline: "none" }}
                />
                <button type="button" className="btn-ghost" onClick={addTag}>Add</button>
              </div>
              <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                {projectForm.tags?.map((item) => (
                  <span 
                    key={item} 
                    className="badge badge-tag"
                    style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                    onClick={() => removeTag(item)}
                    title="Click to remove"
                  >
                    {item}
                    <span style={{ opacity: 0.5, fontSize: "10px" }}>×</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "0.75rem", borderTop: "1px solid var(--border)", paddingTop: "1.25rem", marginTop: "0.5rem" }}>
              <button 
                type="button" 
                className="btn-ghost" 
                onClick={() => {
                  setEditingProject(null);
                  setIsAddingProject(false);
                }}
                style={{ flex: 1, justifyContent: "center" }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
              >
                {editingProject ? "Save Changes" : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* POPUP IMAGE CROPPER CONTAINER */}
      {cropTarget && (
        <ImageCropper
          aspectRatio={cropTarget === "avatar" ? 1 : 1.333} // 1:1 for avatar, 4:3 for project cover
          title={cropTarget === "avatar" ? "Crop Avatar Image" : "Crop Project Cover Image"}
          onCropComplete={(blob) => handleUploadImage(blob, cropTarget)}
          onClose={() => setCropTarget(null)}
        />
      )}

      {/* CSS class overrides */}
      <style>{`
        .table-row-hover:hover {
          background: rgba(255,255,255,0.015);
        }
      `}</style>
    </div>
  );
}
