import React, { useState } from "react";
import axios from "axios";
import { FileUploader } from "react-drag-drop-files";

const filetypes = ["PDF"];

const ResumeUploader = ({ setUserData }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (file) => {
    setFile(file);
    return;
  };

  const uploadResume = async () => {
    if (!file) {
      return alert("Please select a file to upload");
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/upload-resume/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error | Status : ${response.status}`);
      }

      const data = await response.json();
      setUserData(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }

    //   const response = await axios.post(
    //     "http://127.0.0.1:8000/upload-resume/",
    //     formData,
    //     { headers: { "Content-Type": "multipart/form-data" } }
    //   );

    //   setUserData(response.data);
    // } catch (error) {
    //   console.error(error);
    // }
  };

  return (
    <div>
      <h2>Upload Resume</h2>
      {/* <input type="file" accept=".pdf" onChange={handleFileChange} /> */}
      <div class="resume-uploader">
        <FileUploader
          handleChange={handleFileChange}
          name="file"
          types={filetypes}
        />
      </div>
      <button onClick={uploadResume} disabled={loading}>
        {loading ? "Analyzing" : "Analyze Resume"}
      </button>
    </div>
  );
};

export default ResumeUploader;
