"use client";

import { useState, useEffect } from "react";

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [category, setCategory] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    const res = await fetch("/api/faqs", {
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      setIsAuthenticated(true);
      loadFaqs();
    } else {
      setMessage("Incorrect password");
    }
  };

  const loadFaqs = async () => {
    const res = await fetch("/api/faqs");
    const data = await res.json();
    setFaqs(data);
  };

  const addFaq = async () => {
    if (!category || !question || !answer) {
      setMessage("Please fill in all fields");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/faqs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({ category, question, answer }),
    });

    if (res.ok) {
      setMessage("FAQ added successfully!");
      setCategory("");
      setQuestion("");
      setAnswer("");
      loadFaqs();
    } else {
      setMessage("Error adding FAQ");
    }
    setLoading(false);
  };

  const deleteFaq = async (id: number) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    const res = await fetch("/api/faqs", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setMessage("FAQ deleted");
      loadFaqs();
    } else {
      setMessage("Error deleting FAQ");
    }
  };

  if (!isAuthenticated) {
    return (
      <main style={{ maxWidth: 400, margin: "100px auto", padding: 24, fontFamily: "sans-serif" }}>
        <h1 style={{ marginBottom: 24 }}>YCL Admin Login</h1>
        <input
          type="password"
          placeholder="Enter admin password"
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

  // Group FAQs by category
  const grouped = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: 24, fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: 8 }}>YCL FAQ Manager</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>Add and manage frequently asked questions for the library chatbot.</p>

      {/* Add FAQ Form */}
      <div style={{ background: "#f5f5f5", padding: 24, borderRadius: 8, marginBottom: 40 }}>
        <h2 style={{ marginTop: 0 }}>Add New FAQ</h2>
      <select
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  style={{ width: "100%", padding: 10, marginBottom: 12, fontSize: 15, boxSizing: "border-box", borderRadius: 4, border: "1px solid #ddd", background: "#fff" }}
>
  <option value="">Select a category...</option>
  <option value="Borrowing & Returns">Borrowing & Returns</option>
  <option value="Fines & Fees">Fines & Fees</option>
  <option value="Events & Programs">Events & Programs</option>
  <option value="Kids & Teens">Kids & Teens</option>
  <option value="Computer & Technology">Computer & Technology</option>
  <option value="Meeting Rooms">Meeting Rooms</option>
  <option value="Interlibrary Loan">Interlibrary Loan</option>
  <option value="Online Resources">Online Resources</option>
  <option value="General">General</option>
  <option value="Other">Other</option>
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
          onClick={addFaq}
          disabled={loading}
          style={{ padding: "10px 24px", background: "#5BD1D7", border: "none", borderRadius: 6, fontSize: 15, cursor: "pointer" }}
        >
          {loading ? "Adding..." : "Add FAQ"}
        </button>
        {message && <p style={{ color: "green", marginTop: 12 }}>{message}</p>}
      </div>

      {/* FAQ List */}
      <h2>Existing FAQs ({faqs.length})</h2>
      {Object.keys(grouped).length === 0 && <p style={{ color: "#666" }}>No FAQs yet. Add your first one above!</p>}
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 32 }}>
          <h3 style={{ background: "#5BD1D7", padding: "8px 16px", borderRadius: 6, color: "#fff" }}>{cat}</h3>
          {items.map((faq) => (
            <div key={faq.id} style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 6, padding: 16, marginBottom: 12 }}>
              <p style={{ fontWeight: "bold", marginTop: 0 }}>Q: {faq.question}</p>
              <p style={{ marginBottom: 8 }}>A: {faq.answer}</p>
              <button
                onClick={() => deleteFaq(faq.id)}
                style={{ padding: "4px 12px", background: "#ff4444", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      ))}
    </main>
  );
}