import { useState } from "react";
import axios from "axios";

function App() {

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [file, setFile] = useState(null);

  const [deleteFile, setDeleteFile] = useState("");

  // Upload PDF
  const uploadPDF = async () => {

    const formData = new FormData();

    formData.append("file", file);

    await axios.post(
      "http://127.0.0.1:8000/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );

    alert("PDF uploaded successfully!");
  };

  // Delete PDF
  const deletePDF = async () => {

  try {

    const response = await axios.post(
      "http://127.0.0.1:8000/delete",
      {
        filename: deleteFile.trim()
      }
    );

    alert(response.data.message);

  } catch (err) {

    alert(
      "Delete failed: " +
      err.message
    );
  }
};

  // Ask Question
  const askQuestion = async () => {

    const response = await axios.post(
      "http://127.0.0.1:8000/chat",
      {
        question: question
      }
    );

    setAnswer(response.data.answer);
  };

  return (
    <div style={{ padding: "40px" }}>

      <h1>Legal RAG Assistant</h1>

      <hr />

      <h2>Upload PDF</h2>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={uploadPDF}>
        Upload
      </button>

      <hr />

      <h2>Delete PDF</h2>

      <input
        type="text"
        placeholder="Enter filename"
        value={deleteFile}
        onChange={(e) => setDeleteFile(e.target.value)}
      />

      <button onClick={deletePDF}>
        Delete
      </button>

      <hr />

      <h2>Ask Question</h2>

      <textarea
        rows="4"
        cols="60"
        placeholder="Ask legal question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <br /><br />

      <button onClick={askQuestion}>
        Ask
      </button>

      <br /><br />

      <h3>AI Answer:</h3>

      <div>
        {answer}
      </div>

    </div>
  );
}

export default App;