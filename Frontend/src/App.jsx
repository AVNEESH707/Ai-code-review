import { useState, useRef, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import axios from "axios";
import jsPDF from "jspdf";
import "./App.css";

const LANGUAGES = [
  "javascript", "typescript", "python", "java", "cpp", "c",
  "rust", "go", "ruby", "php", "swift", "kotlin", "html", "css",
];

const EXT_TO_LANG = {
  js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript",
  py: "python", java: "java", cpp: "cpp", cc: "cpp", c: "c",
  rs: "rust", go: "go", rb: "ruby", php: "php", swift: "swift",
  kt: "kotlin", html: "html", css: "css",
};

function App() {
  const [code, setCode] = useState(`// Paste your code here and click "Review Code"
function fetchUserData(userId) {
  var result = fetch('/api/users/' + userId);
  result.then(function(res) {
    var data = res.json();
    data.then(function(user) {
      document.getElementById('name').innerHTML = user.name;
      document.getElementById('email').innerHTML = user.email;
      console.log(user);
    });
  });
}`);
  const [review, setReview]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [language, setLanguage]     = useState("javascript");
  const [error, setError]           = useState("");
  const [reviewTime, setReviewTime] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("cl-theme") || "dark"
  );
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cl-history") || "[]"); }
    catch { return []; }
  });

  const startTime = useRef(null);

  /* ── Theme effect ── */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("cl-theme", theme);
  }, [theme]);

  /* ── Save a review to history ── */
  const saveToHistory = useCallback((codeSnap, reviewSnap, lang) => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      language: lang,
      preview: codeSnap.slice(0, 60).replace(/\n/g, " ") + "…",
      code: codeSnap,
      review: reviewSnap,
    };
    setHistory(prev => {
      const updated = [entry, ...prev].slice(0, 5);
      localStorage.setItem("cl-history", JSON.stringify(updated));
      return updated;
    });
  }, []);

  /* ── File upload / drag-drop ── */
  const handleFile = (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (EXT_TO_LANG[ext]) setLanguage(EXT_TO_LANG[ext]);
    const reader = new FileReader();
    reader.onload = (e) => setCode(e.target.result);
    reader.readAsText(file);
  };

  const onDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = ()  => setIsDragging(false);
  const onDrop      = (e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); };

  /* ── Review ── */
  const handleReview = async () => {
    if (!code.trim()) { setError("Please enter some code to review."); return; }
    setLoading(true);
    setError("");
    setReview("");
    startTime.current = Date.now();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/ai/get-review`,
        { code }
      );
      const result = res.data.review;
      const elapsed = ((Date.now() - startTime.current) / 1000).toFixed(1);
      setReview(result);
      setReviewTime(elapsed);
      saveToHistory(code, result, language);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCode(""); setReview(""); setError(""); setReviewTime(null);
  };

  const handleCopyReview = () => navigator.clipboard.writeText(review);

  /* ── Export PDF ── */
  const exportPDF = () => {
    const doc = new jsPDF();
    const margin   = 15;
    const pageW    = doc.internal.pageSize.getWidth();
    const maxWidth = pageW - margin * 2;

    doc.setFontSize(18);
    doc.setTextColor(3, 4, 94);
    doc.text("CodeLens AI — Code Review Report", margin, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 120);
    doc.text(
      `Language: ${language}   |   Generated: ${new Date().toLocaleString()}`,
      margin, 29
    );

    doc.setDrawColor(173, 232, 244);
    doc.line(margin, 33, pageW - margin, 33);

    doc.setFontSize(11);
    doc.setTextColor(30, 30, 50);
    const clean = review.replace(/[#*`>_~]/g, "").trim();
    const lines = doc.splitTextToSize(clean, maxWidth);

    let y = 41;
    lines.forEach(line => {
      if (y > 272) { doc.addPage(); y = 20; }
      doc.text(line, margin, y);
      y += 6;
    });

    doc.save(`code-review-${Date.now()}.pdf`);
  };

  /* ── Restore from history ── */
  const restoreHistory = (item) => {
    setCode(item.code);
    setReview(item.review);
    setLanguage(item.language);
    setReviewTime(null);
    setError("");
    setShowHistory(false);
  };

  return (
    <div className="app">

      {/* ── Header ── */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">⬡</span>
            <span className="logo-text">CodeLens</span>
            <span className="logo-badge">AI</span>
          </div>
          <span className="header-subtitle">Powered by OpenRouter</span>
        </div>

        <div className="header-right">
          {/* History toggle */}
          <button
            className="btn btn-ghost"
            onClick={() => setShowHistory(s => !s)}
            title="Review history"
          >
            🕐 History {history.length > 0 && `(${history.length})`}
          </button>

          {/* Theme toggle */}
          <button
            className="btn btn-ghost theme-btn"
            onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
            title="Toggle theme"
          >
            {theme === "dark" ? "☀ Light" : "🌙 Dark"}
          </button>

          <div className="status-dot"></div>
          <span className="status-text">Ready</span>
        </div>
      </header>

      {/* ── History Panel (dropdown) ── */}
      {showHistory && (
        <div className="history-panel">
          <div className="history-panel-header">
            <span>Recent Reviews</span>
            <button className="history-close" onClick={() => setShowHistory(false)}>✕</button>
          </div>
          {history.length === 0 ? (
            <p className="history-empty">No reviews yet — run your first review!</p>
          ) : (
            history.map(item => (
              <div key={item.id} className="history-item" onClick={() => restoreHistory(item)}>
                <div className="history-item-top">
                  <span className="history-lang">{item.language}</span>
                  <span className="history-time">{item.timestamp}</span>
                </div>
                <p className="history-preview">{item.preview}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Main ── */}
      <main className="main">

        {/* Left panel — Editor */}
        <section className={`panel editor-panel ${isDragging ? "dragging" : ""}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {isDragging && (
            <div className="drop-overlay">
              <div className="drop-overlay-inner">
                <span style={{ fontSize: 36 }}>📂</span>
                <p>Drop your file here</p>
              </div>
            </div>
          )}

          <div className="panel-header">
            <div className="panel-title">
              <span className="panel-icon">{ }</span>
              <span>Code Editor</span>
            </div>
            <div className="panel-controls">
              {/* File upload button */}
              <label className="btn btn-ghost upload-btn" title="Upload a code file">
                ↑ Upload
                <input
                  type="file"
                  accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.cc,.c,.rs,.go,.rb,.php,.swift,.kt,.html,.css"
                  onChange={e => handleFile(e.target.files[0])}
                  hidden
                />
              </label>

              <select
                className="lang-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>

              <button className="btn btn-ghost" onClick={handleClear}>Clear</button>
            </div>
          </div>

          <div className="editor-wrapper">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={val => setCode(val || "")}
              theme={theme === "dark" ? "vs-dark" : "vs-light"}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                renderWhitespace: "selection",
                tabSize: 2,
                wordWrap: "on",
                padding: { top: 16, bottom: 16 },
                smoothScrolling: true,
                cursorBlinking: "smooth",
              }}
            />
          </div>

          <div className="panel-footer">
            <span className="char-count">
              {code.length.toLocaleString()} chars · {code.split("\n").length} lines
            </span>
            <button
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              onClick={handleReview}
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner"></span>Analyzing...</>
              ) : (
                <><span>▶</span>Review Code</>
              )}
            </button>
          </div>
        </section>

        {/* Right panel — Review Output */}
        <section className="panel review-panel">
          <div className="panel-header">
            <div className="panel-title">
              <span className="panel-icon">✦</span>
              <span>AI Review</span>
              {reviewTime && (
                <span className="review-badge">{reviewTime}s</span>
              )}
            </div>
            <div className="panel-controls">
              {review && (
                <>
                  <button className="btn btn-ghost" onClick={handleCopyReview}>Copy</button>
                  <button className="btn btn-ghost export-btn" onClick={exportPDF}>↓ PDF</button>
                </>
              )}
            </div>
          </div>

          <div className="review-content">
            {error && (
              <div className="error-box">
                <span className="error-icon">⚠</span>
                {error}
              </div>
            )}

            {!review && !loading && !error && (
              <div className="empty-state">
                <div className="empty-icon">⬡</div>
                <p className="empty-title">No review yet</p>
                <p className="empty-sub">
                  Paste your code or <strong>upload a file</strong> and click <strong>Review Code</strong>
                </p>
              </div>
            )}

            {loading && (
              <div className="loading-state">
                <div className="pulse-ring"></div>
                <p>Analyzing your code...</p>
                <p className="loading-sub">
                  Reviewing for bugs, performance, security, and best practices
                </p>
              </div>
            )}

            {review && (
              <div className="markdown-body">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>{children}</code>
                      );
                    },
                  }}
                >
                  {review}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
