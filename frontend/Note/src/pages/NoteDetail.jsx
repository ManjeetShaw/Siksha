import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// ── PDF Viewer using pdfjs-dist ───────────────────────────────────────────────
function PDFViewer({ url }) {
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const renderPDF = async () => {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      const pdf = await pdfjsLib.getDocument({ url, withCredentials: false }).promise;
      if (cancelled || !containerRef.current) return;
      containerRef.current.innerHTML = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        if (cancelled) break;
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.4 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = "100%";
        canvas.style.marginBottom = "8px";
        canvas.style.borderRadius = "8px";
        containerRef.current.appendChild(canvas);
        await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      }
    };
    renderPDF().catch(console.error);
    return () => { cancelled = true; };
  }, [url]);

  return (
    <div ref={containerRef} className="w-full">
      <div className="text-center text-gray-400 text-sm py-8">Loading PDF...</div>
    </div>
  );
}

// ── Main NoteDetail ───────────────────────────────────────────────────────────
export default function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState(() => {
    return sessionStorage.getItem(`summary-${id}`) || "";
  });
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  const [flashcardsError, setFlashcardsError] = useState("");

  const [pdfLoading, setPdfLoading] = useState(false);

  // ── Fetch note ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/student/note/${id}`);
        setNote(res.data);
      } catch (err) {
        console.error("Failed to fetch note:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  // ── Extract text from PDF using pdfjs-dist ──────────────────────────────────
  const extractTextFromPDF = async (url) => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
    const pdf = await pdfjsLib.getDocument({ url, withCredentials: false }).promise;
    let fullText = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map((item) => item.str).join(" ") + "\n";
    }
    return fullText.trim();
  };

  // ── Get text for AI ─────────────────────────────────────────────────────────
  const getTextForAI = async () => {
    if (note?.content && note.content.trim()) return note.content;
    if (note?.fileUrl && note?.fileType !== "image") {
      return await extractTextFromPDF(note.fileUrl);
    }
    return null;
  };

  // ── AI Summary — calls backend ──────────────────────────────────────────────
  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    setSummaryError("");
    setSummary("");
    try {
      const text = await getTextForAI();
      if (!text) { setSummaryError("Could not extract text from this note."); return; }

      const res = await api.post("/ai/summary", { text });
      setSummary(res.data.summary);
      sessionStorage.setItem(`summary-${id}`, res.data.summary);
    } catch (err) {
      console.error("Summary error:", err);
      setSummaryError(err.response?.data?.message || "Failed to generate summary.");
    } finally {
      setSummaryLoading(false);
    }
  };

  // ── Flashcards — calls backend ──────────────────────────────────────────────
  const handleGenerateFlashcards = async () => {
    setFlashcardsLoading(true);
    setFlashcardsError("");
    try {
      const text = await getTextForAI();
      if (!text) { setFlashcardsError("Could not extract text from this note."); return; }

      const res = await api.post("/ai/flashcards", { text });
      navigate("/flashcards", {
        state: { activeDeck: { title: note.title, cards: res.data.flashcards } },
      });
    } catch (err) {
      console.error("Flashcard error:", err);
      setFlashcardsError(err.response?.data?.message || "Failed to generate flashcards.");
    } finally {
      setFlashcardsLoading(false);
    }
  };

  // ── PDF Download ─────────────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (!note) return;
    setPdfLoading(true);
    try {
      if (note.fileUrl) {
        const response = await fetch(note.fileUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${note.title}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (note.content?.trim()) {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF({ unit: "mm", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const maxWidth = pageWidth - margin * 2;
        let yPos = margin;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(0, 44, 67);
        const titleLines = doc.splitTextToSize(note.title, maxWidth);
        doc.text(titleLines, margin, yPos);
        yPos += titleLines.length * 8 + 4;
        doc.setDrawColor(44, 144, 155);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(40, 40, 40);
        const bodyLines = doc.splitTextToSize(note.content, maxWidth);
        for (const line of bodyLines) {
          if (yPos + 7 > pageHeight - margin) { doc.addPage(); yPos = margin; }
          doc.text(line, margin, yPos);
          yPos += 7;
        }
        doc.save(`${note.title}.pdf`);
      } else {
        alert("No content to download.");
      }
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 rounded-full animate-spin"
          style={{ borderColor: "#FF3E68", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!note) {
    return <div className="text-center py-20 text-gray-500">Note not found.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => {
        sessionStorage.removeItem(`summary-${id}`);
        navigate(-1);
      }}
        className="mb-4 text-sm flex items-center gap-1 hover:underline"
        style={{ color: "#FF3E68" }}>
        ← Back
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "#20160F" }}>
          {note.title}
        </h1>
        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
          {note.subject && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: "#FFEDE5", color: "#FF3E68" }}>
              {note.subject?.name || note.subject}
            </span>
          )}
          {note.class && <span className="text-gray-400">{note.class}</span>}
          {note.createdAt && (
            <span className="text-gray-400">
              {new Date(note.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-xl p-6 mb-6 leading-relaxed text-gray-700"
        style={{ backgroundColor: "#f8fefe", border: "1px solid #FFEDE5" }}>
        {note.content && note.content.trim() ? (
          <p className="whitespace-pre-wrap">{note.content}</p>
        ) : note.fileUrl ? (
          note.fileType === "image" ? (
            <img src={note.fileUrl} alt={note.title} className="max-w-full rounded-lg" />
          ) : (
            <PDFViewer url={note.fileUrl} />
          )
        ) : (
          <span className="text-gray-400 italic">No content available.</span>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={handleGenerateSummary} disabled={summaryLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium text-sm disabled:opacity-60 transition hover:opacity-90"
          style={{ backgroundColor: "#FF3E68" }}>
          {summaryLoading
            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />Extracting & Summarizing...</>
            : <>✨ Generate Summary</>}
        </button>

        <button onClick={handleGenerateFlashcards} disabled={flashcardsLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium text-sm disabled:opacity-60 transition hover:opacity-90"
          style={{ backgroundColor: "#20160F" }}>
          {flashcardsLoading
            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />Extracting & Generating...</>
            : <>🃏 Generate Flashcards</>}
        </button>

        <button onClick={handleDownloadPDF} disabled={pdfLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm disabled:opacity-60 transition hover:opacity-90 border"
          style={{ borderColor: "#FF3E68", color: "#FF3E68", backgroundColor: "white" }}>
          {pdfLoading
            ? <><span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin inline-block"
              style={{ borderColor: "#FF3E68", borderTopColor: "transparent" }} />Preparing...</>
            : <>⬇ Download {note.fileUrl ? "File" : "PDF"}</>}
        </button>
      </div>

      {flashcardsError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{flashcardsError}</div>
      )}

      {(summary || summaryError) && (
        <div className="rounded-xl p-5"
          style={{ backgroundColor: "#FFEDE5", border: "1px solid #FF3E6840" }}>
          <h2 className="font-semibold mb-3" style={{ color: "#20160F" }}>✨ AI Summary</h2>
          {summaryError
            ? <p className="text-red-600 text-sm">{summaryError}</p>
            : <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{summary}</p>}
        </div>
      )}
    </div>
  );
}