"use client";

import { useState, useEffect } from "react";

interface PendingFAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
  submitted_by: string;
  created_at: string;
}

export default function StaffPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submittedBy, setSubmittedBy] = useState("");
  const [category, setCategory] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mySubmissions, setMySubmissions] = useState<PendingFAQ[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCategory, setEditCategory] = useState("");
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [activeView, setActiveView] = useState<"submit" | "mine">("submit");

  const login = () => {
    if (password === "") {
      setMessage("Please enter a password");
      return;
    }
    setIsAuthenticated(true);
    setMessage("");
  };

  const loadMySubmissions = async (name: string) => {
    const res = await fetch(`/api/staff/mine?name=${encodeURIComponent(name)}`, {
      headers: { "x-staff-password": password },
    });
    if (res.ok) {
      const data = await res.json();
      setMySubmissions(data);
    }
  };

  useEffect(() => {
    if (isAuthenticated && submittedBy) {
      loadMySubmissions(submittedBy);
    }
  }, [isAuthenticated, submittedBy]);

  const submitFaq = async () => {
    if (!submittedBy || !category || !question || !answer) {
      setMessage("Please fill in all fields");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/staff/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-staff-password": password,
      },
      body: JSON.stringify({ category, question, answer, submitted_by: submittedBy }),
    });

    if (res.ok) {
      setMessage("✅ Submission received! An admin will review it shortly.");
      setCategory("");
      setQuestion("");
      setAnswer("");
      loadMySubmissions(submittedBy);
    } else {
      const data = await res.json();
      setMessage(`Error: ${data.error || "Something went wrong"}`);
    }
    setLoading(false);
  };

  const startEdit = (item: PendingFAQ) => {
    setEditingId(item.id);
    setEditCategory(item.category);
    setEditQuestion(item.question);
    setEditAnswer(item.answer);
    setEditMessage("");
  };

  const saveEdit = async (id: number) => {
    const res = await fetch("/api/staff/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-staff-password": password,
      },
      body: JSON.stringify({ id, category: editCategory, question: editQuestion, answer: editAnswer }),
    });

    if (res.ok) {
      setEditMessage("✅ Updated successfully!");
      setEditingId(null);
      loadMySubmissions(submittedBy);
    } else {
      setEditMessage("Error updating submission");
    }
  };

  const deleteSubmission = async (id: number) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    const res = await fetch("/api/staff/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-staff-password": password,
      },
      body: JSON.stringify({ id, submitted_by: submittedBy }),
    });

    if (res.ok) {
      setEditMessage("🗑️ Submission deleted.");
      loadMySubmissions(submittedBy);
    } else {
      setEditMessage("Error deleting submission");
    }
  };

  const categoryOptions = [
    "Borrowing & Returns", "Fines & Fees", "Events & Programs",
    "Kids & Teens", "Computer & Technology", "Meeting Rooms",
    "Interlibrary Loan", "Online Resources", "General", "Other"
  ];

  if (!isAuthenticated) {
    return (
      <main style={{ maxWidth: 400, margin: "100px auto", padding: 24, fontFamily: "sans-serif" }}>
        <h1 style={{ marginBottom: 24 }}>YCL Staff Portal</h1>
        <p style={{ color: "#666", marginBottom: 16 }}>Enter the staff password to submit FAQ suggestions.</p>
        <input
          type="password"
          placeholder="Enter staff password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()}
          style={{ width: "100%", padding: 10, marginBottom: 12, fontSize: 16, boxSizing: "border-box" }}
        />
        <button
          onClick={login}
          style={{ width: "100%", padding: 10, background: "#5BD1D7", border: "none", borderRadius: 6, fontSize: 16, cursor: "pointer" }}
        >
          Login
        </button>
        {message && <p style={{ color: "red", marginTop: 12 }}>{message}</p>}
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: 24, fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: 8 }}>YCL Staff Portal</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => setActiveView("submit")}
          style={{ padding: "10px 24px", background: activeView === "submit" ? "#5BD1D7" : "#eee", border: "none", borderRadius: 6, fontSize: 15, cursor: "pointer", fontWeight: activeView === "submit" ? "bold" : "normal" }}
        >
          Submit New
        </button>
        <button
          onClick={() => { setActiveView("mine"); if (submittedBy) loadMySubmissions(submittedBy); }}
          style={{ padding: "10px 24px", background: activeView === "mine" ? "#5BD1D7" : "#eee", border: "none", borderRadius: 6, fontSize: 15, cursor: "pointer", fontWeight: activeView === "mine" ? "bold" : "normal" }}
        >
          My Submissions ({mySubmissions.length})
        </button>
      </div>

      {activeView === "submit" && (
        <>
          <p style={{ color: "#666", marginBottom: 24 }}>Your suggestion will be reviewed by an admin before going live.</p>
          <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 8, padding: 16, marginBottom: 24 }}>
            <p style={{ fontWeight: "bold", marginTop: 0, color: "#856404" }}>⚠️ Do NOT submit any of the following:</p>
            <ul style={{ color: "#856404", marginBottom: 0 }}>
              <li>Patron personal information</li>
              <li>Passwords or security credentials</li>
              <li>Staff personal information</li>
              <li>Any information protected by SC library confidentiality laws</li>
            </ul>
          </div>
          <input
            type="text"
            placeholder="Your name"
            value={submittedBy}
            onChange={(e) => setSubmittedBy(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 12, fontSize: 15, boxSizing: "border-box", borderRadius: 4, border: "1px solid #ddd" }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 12, fontSize: 15, boxSizing: "border-box", borderRadius: 4, border: "1px solid #ddd", background: "#fff" }}
          >
            <option value="">Select a category...</option>
            {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            type="text"
            placeholder="Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 12, fontSize: 15, boxSizing: "border-box", borderRadius: 4, border: "1px solid #ddd" }}
          />
          <textarea
            placeholder="Answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={4}
            style={{ width: "100%", padding: 10, marginBottom: 12, fontSize: 15, boxSizing: "border-box", borderRadius: 4, border: "1px solid #ddd" }}
          />
          <button
            onClick={submitFaq}
            disabled={loading}
            style={{ padding: "10px 24px", background: "#5BD1D7", border: "none", borderRadius: 6, fontSize: 15, cursor: "pointer" }}
          >
            {loading ? "Submitting..." : "Submit for Review"}
          </button>
          {message && <p style={{ color: message.startsWith("✅") ? "green" : "red", marginTop: 12 }}>{message}</p>}
        </>
      )}

      {activeView === "mine" && (
        <>
          <p style={{ color: "#666", marginBottom: 16 }}>These are your pending submissions awaiting admin review. You can edit or delete them before they are approved.</p>
          {editMessage && <p style={{ color: editMessage.startsWith("✅") ? "green" : editMessage.startsWith("🗑️") ? "#666" : "red", marginBottom: 16 }}>{editMessage}</p>}
          {!submittedBy && <p style={{ color: "red" }}>Please enter your name in the Submit New tab first.</p>}
          {submittedBy && mySubmissions.length === 0 && <p style={{ color: "#666" }}>You have no pending submissions.</p>}
          {mySubmissions.map((item) => (
            <div key={item.id} style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 6, padding: 16, marginBottom: 16 }}>
              {editingId === item.id ? (
                <>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    style={{ width: "100%", padding: 8, marginBottom: 10, fontSize: 14, borderRadius: 4, border: "1px solid #ddd", background: "#fff" }}
                  >
                    {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input
                    type="text"
                    value={editQuestion}
                    onChange={(e) => setEditQuestion(e.target.value)}
                    style={{ width: "100%", padding: 8, marginBottom: 10, fontSize: 14, borderRadius: 4, border: "1px solid #ddd", boxSizing: "border-box" }}
                  />
                  <textarea
                    value={editAnswer}
                    onChange={(e) => setEditAnswer(e.target.value)}
                    rows={3}
                    style={{ width: "100%", padding: 8, marginBottom: 10, fontSize: 14, borderRadius: 4, border: "1px solid #ddd", boxSizing: "border-box" }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => saveEdit(item.id)}
                      style={{ padding: "6px 16px", background: "#28a745", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14 }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{ padding: "6px 16px", background: "#eee", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14 }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: "#5BD1D7", marginTop: 0 }}>{item.category}</p>
                  <p style={{ fontWeight: "bold", marginBottom: 4 }}>Q: {item.question}</p>
                  <p style={{ marginBottom: 12 }}>A: {item.answer}</p>
                  <p style={{ fontSize: 12, color: "#aaa", marginBottom: 12 }}>Submitted {new Date(item.created_at).toLocaleDateString()}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => startEdit(item)}
                      style={{ padding: "6px 16px", background: "#5BD1D7", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14 }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteSubmission(item.id)}
                      style={{ padding: "6px 16px", background: "#ff4444", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14 }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </>
      )}
    </main>
  );
}