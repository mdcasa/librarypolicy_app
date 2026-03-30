"use client";

import { useState } from "react";

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
}

interface Joke {
  id: number;
  joke: string;
}

interface PendingFAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
  submitted_by: string;
  created_at: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [pending, setPending] = useState<PendingFAQ[]>([]);
  const [category, setCategory] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [newJoke, setNewJoke] = useState("");
  const [message, setMessage] = useState("");
  const [jokeMessage, setJokeMessage] = useState("");
  const [pendingMessage, setPendingMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportFaqs, setReportFaqs] = useState<FAQ[]>([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStaff, setFilterStaff] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [editingFaqId, setEditingFaqId] = useState<number | null>(null);
  const [editFaqCategory, setEditFaqCategory] = useState("");
  const [editFaqQuestion, setEditFaqQuestion] = useState("");
  const [editFaqAnswer, setEditFaqAnswer] = useState("");
  const [activeTab, setActiveTab] = useState<"faqs" | "jokes" | "pending" | "reports">("faqs");

  const login = async () => {
    const res = await fetch("/api/faqs/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setIsAuthenticated(true);
      loadFaqs();
      loadJokes();
      loadPending();
    } else {
      setMessage("Incorrect password");
    }
  };

  const loadFaqs = async () => {
    const res = await fetch("/api/faqs");
    const data = await res.json();
    setFaqs(data);
  };

  const loadJokes = async () => {
    const res = await fetch("/api/jokes");
    const data = await res.json();
    setJokes(data);
  };

  const loadPending = async () => {
    const res = await fetch("/api/staff/pending", {
      headers: { "x-admin-password": password },
    });
    const data = await res.json();
    setPending(data);
  };

  const moderate = async (item: PendingFAQ, action: "approve" | "reject") => {
    const res = await fetch("/api/staff/moderate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({
        id: item.id,
        action,
        category: item.category,
        question: item.question,
        answer: item.answer,
        submitted_by: item.submitted_by,
      }),
    });

    if (res.ok) {
      setPendingMessage(action === "approve" ? "✅ FAQ approved and published!" : "🗑️ Submission rejected.");
      loadPending();
      if (action === "approve") loadFaqs();
    } else {
      setPendingMessage("Error processing submission");
    }
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

  const startEditFaq = (faq: FAQ) => {
    setEditingFaqId(faq.id);
    setEditFaqCategory(faq.category);
    setEditFaqQuestion(faq.question);
    setEditFaqAnswer(faq.answer);
  };

  const saveEditFaq = async (id: number) => {
    const res = await fetch("/api/faqs", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({ id, category: editFaqCategory, question: editFaqQuestion, answer: editFaqAnswer }),
    });

    if (res.ok) {
      setMessage("FAQ updated successfully!");
      setEditingFaqId(null);
      loadFaqs();
    } else {
      setMessage("Error updating FAQ");
    }
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

  const addJoke = async () => {
    if (!newJoke) {
      setJokeMessage("Please enter a joke");
      return;
    }
    const res = await fetch("/api/jokes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({ joke: newJoke }),
    });

    if (res.ok) {
      setJokeMessage("Joke added successfully!");
      setNewJoke("");
      loadJokes();
    } else {
      setJokeMessage("Error adding joke");
    }
  };

  const deleteJoke = async (id: number) => {
    if (!confirm("Are you sure you want to delete this joke?")) return;
    const res = await fetch("/api/jokes", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setJokeMessage("Joke deleted");
      loadJokes();
    } else {
      setJokeMessage("Error deleting joke");
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

  const grouped = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: 24, fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: 8 }}>YCL Admin Panel</h1>
      <p style={{ color: "#666", marginBottom: 16 }}>Manage FAQs and jokes for the library chatbot.</p>

      <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 8, padding: 16, marginBottom: 24 }}>
        <p style={{ fontWeight: "bold", marginTop: 0, color: "#856404" }}>⚠️ Important: Do NOT enter any of the following information:</p>
        <ul style={{ color: "#856404", marginBottom: 0 }}>
          <li>Passwords or system login credentials</li>
          <li>Patron personal information (names, addresses, phone numbers, emails)</li>
          <li>Library card numbers or account numbers</li>
          <li>Staff personal information</li>
          <li>Financial information (credit card numbers, bank details)</li>
          <li>Patron borrowing or checkout history</li>
          <li>Patron fine or fee account details</li>
          <li>Internal staff procedures or security protocols</li>
          <li>Building access codes or security information</li>
          <li>Vendor contract details or pricing</li>
          <li>Personnel or HR information</li>
          <li>Any information protected by SC library confidentiality laws</li>
        </ul>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        <button
          onClick={() => setActiveTab("faqs")}
          style={{ padding: "10px 24px", background: activeTab === "faqs" ? "#5BD1D7" : "#eee", border: "none", borderRadius: 6, fontSize: 15, cursor: "pointer", fontWeight: activeTab === "faqs" ? "bold" : "normal" }}
        >
          FAQs ({faqs.length})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          style={{ padding: "10px 24px", background: activeTab === "pending" ? "#5BD1D7" : "#eee", border: "none", borderRadius: 6, fontSize: 15, cursor: "pointer", fontWeight: activeTab === "pending" ? "bold" : "normal" }}
        >
          Pending ({pending.length})
        </button>
        <button
          onClick={() => setActiveTab("jokes")}
          style={{ padding: "10px 24px", background: activeTab === "jokes" ? "#5BD1D7" : "#eee", border: "none", borderRadius: 6, fontSize: 15, cursor: "pointer", fontWeight: activeTab === "jokes" ? "bold" : "normal" }}
        >
          Jokes ({jokes.length})
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          style={{ padding: "10px 24px", background: activeTab === "reports" ? "#5BD1D7" : "#eee", border: "none", borderRadius: 6, fontSize: 15, cursor: "pointer", fontWeight: activeTab === "reports" ? "bold" : "normal" }}
        >
          Reports
        </button>
      </div>

      {/* FAQs Tab */}
      {activeTab === "faqs" && (
        <>
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

          <h2>Existing FAQs ({faqs.length})</h2>
          {Object.keys(grouped).length === 0 && <p style={{ color: "#666" }}>No FAQs yet. Add your first one above!</p>}
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} style={{ marginBottom: 32 }}>
              <h3 style={{ background: "#5BD1D7", padding: "8px 16px", borderRadius: 6, color: "#fff" }}>{cat}</h3>
              {items.map((faq) => (
     <div key={faq.id} style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 6, padding: 16, marginBottom: 12 }}>
                  {editingFaqId === faq.id ? (
                    <>
                      <select
                        value={editFaqCategory}
                        onChange={(e) => setEditFaqCategory(e.target.value)}
                        style={{ width: "100%", padding: 8, marginBottom: 10, fontSize: 14, borderRadius: 4, border: "1px solid #ddd", background: "#fff" }}
                      >
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
                        value={editFaqQuestion}
                        onChange={(e) => setEditFaqQuestion(e.target.value)}
                        style={{ width: "100%", padding: 8, marginBottom: 10, fontSize: 14, borderRadius: 4, border: "1px solid #ddd", boxSizing: "border-box" }}
                      />
                      <textarea
                        value={editFaqAnswer}
                        onChange={(e) => setEditFaqAnswer(e.target.value)}
                        rows={3}
                        style={{ width: "100%", padding: 8, marginBottom: 10, fontSize: 14, borderRadius: 4, border: "1px solid #ddd", boxSizing: "border-box" }}
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => saveEditFaq(faq.id)}
                          style={{ padding: "6px 16px", background: "#28a745", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14 }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingFaqId(null)}
                          style={{ padding: "6px 16px", background: "#eee", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14 }}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p style={{ fontWeight: "bold", marginTop: 0 }}>Q: {faq.question}</p>
                      <p style={{ marginBottom: 8 }}>A: {faq.answer}</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => startEditFaq(faq)}
                          style={{ padding: "4px 12px", background: "#5BD1D7", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deleteFaq(faq.id)}
                          style={{ padding: "4px 12px", background: "#ff4444", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {/* Pending Tab */}
      {activeTab === "pending" && (
        <>
          <h2>Pending Submissions ({pending.length})</h2>
          {pendingMessage && <p style={{ color: pendingMessage.startsWith("✅") ? "green" : pendingMessage.startsWith("🗑️") ? "#666" : "red", marginBottom: 16 }}>{pendingMessage}</p>}
          {pending.length === 0 && <p style={{ color: "#666" }}>No pending submissions. You're all caught up!</p>}
          {pending.map((item) => (
            <div key={item.id} style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 6, padding: 16, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "#888", marginTop: 0 }}>
                Submitted by <strong>{item.submitted_by}</strong> on {new Date(item.created_at).toLocaleDateString()}
              </p>
              <p style={{ fontSize: 13, color: "#5BD1D7", marginBottom: 8 }}><strong>Category:</strong> {item.category}</p>
              <p style={{ fontWeight: "bold", marginBottom: 4 }}>Q: {item.question}</p>
              <p style={{ marginBottom: 12 }}>A: {item.answer}</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => moderate(item, "approve")}
                  style={{ padding: "6px 16px", background: "#28a745", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14 }}
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => moderate(item, "reject")}
                  style={{ padding: "6px 16px", background: "#ff4444", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14 }}
                >
                  🗑️ Reject
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Jokes Tab */}
      {activeTab === "jokes" && (
        <>
          <div style={{ background: "#f5f5f5", padding: 24, borderRadius: 8, marginBottom: 40 }}>
            <h2 style={{ marginTop: 0 }}>Add New Joke</h2>
            <textarea
              placeholder="Enter a clean, family-friendly joke..."
              value={newJoke}
              onChange={(e) => setNewJoke(e.target.value)}
              rows={3}
              style={{ width: "100%", padding: 10, marginBottom: 12, fontSize: 15, boxSizing: "border-box", borderRadius: 4, border: "1px solid #ddd" }}
            />
            <button
              onClick={addJoke}
              style={{ padding: "10px 24px", background: "#5BD1D7", border: "none", borderRadius: 6, fontSize: 15, cursor: "pointer" }}
            >
              Add Joke
            </button>
            {jokeMessage && <p style={{ color: "green", marginTop: 12 }}>{jokeMessage}</p>}
          </div>

          <h2>Existing Jokes ({jokes.length})</h2>
          {jokes.length === 0 && <p style={{ color: "#666" }}>No jokes yet. Add your first one above!</p>}
          {jokes.map((j) => (
            <div key={j.id} style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 6, padding: 16, marginBottom: 12 }}>
              <p style={{ marginTop: 0, marginBottom: 8 }}>{j.joke}</p>
              <button
                onClick={() => deleteJoke(j.id)}
                style={{ padding: "4px 12px", background: "#ff4444", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}
              >
                Delete
              </button>
            </div>
          ))}
        </>
      )}
      {/* Reports Tab */}
      {activeTab === "reports" && (
        <>
          <h2>FAQ Submission Report</h2>
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ padding: 8, fontSize: 14, borderRadius: 4, border: "1px solid #ddd", background: "#fff" }}
            >
              <option value="">All Categories</option>
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
              placeholder="Filter by staff name"
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
              style={{ padding: 8, fontSize: 14, borderRadius: 4, border: "1px solid #ddd" }}
            />
            <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} style={{ padding: 8, fontSize: 14, borderRadius: 4, border: "1px solid #ddd" }} />
            <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} style={{ padding: 8, fontSize: 14, borderRadius: 4, border: "1px solid #ddd" }} />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
              style={{ padding: 8, fontSize: 14, borderRadius: 4, border: "1px solid #ddd", background: "#fff" }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <button
              onClick={() => { setFilterCategory(""); setFilterStaff(""); setFilterFrom(""); setFilterTo(""); setSortOrder("newest"); }}
              style={{ padding: "8px 16px", background: "#eee", border: "none", borderRadius: 4, fontSize: 14, cursor: "pointer" }}
            >
              Clear Filters
            </button>
          </div>
          {(() => {
            const filtered = faqs
              .filter(f => (f as any).submitted_by)
              .filter(f => !filterCategory || f.category === filterCategory)
              .filter(f => !filterStaff || (f as any).submitted_by?.toLowerCase().includes(filterStaff.toLowerCase()))
              .filter(f => !filterFrom || new Date((f as any).submitted_at) >= new Date(filterFrom))
              .filter(f => !filterTo || new Date((f as any).submitted_at) <= new Date(filterTo))
              .sort((a, b) => {
                const aDate = new Date((a as any).submitted_at).getTime();
                const bDate = new Date((b as any).submitted_at).getTime();
                return sortOrder === "newest" ? bDate - aDate : aDate - bDate;
              });
            return filtered.length === 0 ? (
              <p style={{ color: "#666" }}>No approved staff submissions found.</p>
            ) : (
              <>
                <p style={{ color: "#666", marginBottom: 16 }}>Showing {filtered.length} approved submission{filtered.length !== 1 ? "s" : ""}.</p>
                {filtered.map((faq) => (
                  <div key={faq.id} style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 6, padding: 16, marginBottom: 12 }}>
                    <p style={{ fontSize: 13, color: "#888", marginTop: 0 }}>
                      Submitted by <strong>{(faq as any).submitted_by}</strong> on {new Date((faq as any).submitted_at).toLocaleDateString()} &bull; <span style={{ color: "#5BD1D7" }}>{faq.category}</span>
                    </p>
                    <p style={{ fontWeight: "bold", marginBottom: 4 }}>Q: {faq.question}</p>
                    <p style={{ marginBottom: 0 }}>A: {faq.answer}</p>
                  </div>
                ))}
              </>
            );
          })()}
        </>
      )}
    </main>
  );
}
