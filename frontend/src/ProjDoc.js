import React, { useState } from "react";
import axios from "axios";

const ProjDoc = () => {
  const [projectDesc, setProjectDesc] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const generateDocumentation = async () => {
    if (!projectDesc) {
        return alert("Please enter a project description");
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("project_desc", projectDesc)

    try {
        const response = await axios.post("http://127.0.0.1:8000/generate-documentation/", formData, {headers: {"Content-Type": "multipart/form-data"}});

        console.log(response.data);
        setDownloadUrl(`http://127.0.0.1:8000/${response.data.download_url}`);
    } catch (error) {
        console.error("Error generating documentation", error);
    }
    setLoading(false);
  };

  return (
    <div>
        <h2>Project Details</h2>
        <textarea 
        rows={10}
        cols={40}
        placeholder="Enter project description..."
        onChange={(event) => {
            setProjectDesc(event.target.value)
        }}/>
        <br />
        <button onClick={generateDocumentation} disabled={loading}>{loading ? "Generating..." : "Generate Documentation"}</button>

        {downloadUrl && (
            <div>
                <h3>Download Documentation</h3>
                <a href={downloadUrl} download>
                    <button>Download</button>
                </a>
            </div>
        )}
    </div>
  );
};

export default ProjDoc;
