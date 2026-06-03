import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {

  const [activeTab, setActiveTab] = useState("chat");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState("");

  const fetchDocuments = async () => {
    const response = await axios.get("http://127.0.0.1:8000/documents");
    setDocuments(response.data.documents || []);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const uploadPDF = async () => {
    const formData = new FormData();
    formData.append("file", file);

    await axios.post("http://127.0.0.1:8000/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    setFile(null);
    fetchDocuments();
    alert("PDF uploaded successfully!");
  };

  const deletePDF = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/delete", {
        filename: selectedDocument,
      });

      fetchDocuments();
      setSelectedDocument("");
      alert(response.data.message);
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const askQuestion = async () => {
    const response = await axios.post("http://127.0.0.1:8000/chat", {
      question,
    });

    setAnswer(response.data.answer);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Legal RAG Assistant</h1>
          <p>Ask legal questions from your uploaded PDF documents.</p>
        </div>

        <nav className="app-nav">
          <button
            className={activeTab === "chat" ? "nav-btn active" : "nav-btn"}
            onClick={() => setActiveTab("chat")}
          >
            Search
          </button>
          <button
            className={activeTab === "documents" ? "nav-btn active" : "nav-btn"}
            onClick={() => setActiveTab("documents")}
          >
            Documents
          </button>
        </nav>
      </header>

      {activeTab === "chat" ? (
        <section className="panel">
          <h2>Search</h2>
          <p className="panel-description">Type your question and get an answer from your uploaded documents.</p>

          <textarea
            className="textarea-field"
            rows="5"
            placeholder="Ask legal question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <div className="button-row">
            <button className="primary-btn" onClick={askQuestion} disabled={!question.trim()}>
              Ask
            </button>
          </div>

          <div className="answer-panel">
            <div className="answer-header">
              <h3>AI Answer</h3>
            </div>
            <div className="answer-body">
              {answer || "Your answer will appear here after asking a question."}
            </div>
          </div>
        </section>
      ) : (
        <section className="panel">
          <h2>Documents</h2>
          <p className="panel-description">Upload PDFs or delete an uploaded document by selection.</p>

          <div className="document-actions">
            <div className="document-upload">
              <input
                className="input-file"
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <button className="primary-btn" onClick={uploadPDF} disabled={!file}>
                Upload PDF
              </button>
            </div>

            <div className="document-list">
              <label htmlFor="document-select">Uploaded documents</label>
              <select
                id="document-select"
                className="input-field"
                value={selectedDocument}
                onChange={(e) => setSelectedDocument(e.target.value)}
              >
                <option value="">Select a document to delete</option>
                {documents.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <button
                className="secondary-btn"
                onClick={deletePDF}
                disabled={!selectedDocument}
              >
                Delete Selected Document
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;