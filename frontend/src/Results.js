import react, { useState } from "react";
import axios from "axios";

const Results = ({ userData }) => {
  const [projects, setProjects] = useState("");
  const [loading, setLoading] = useState(false);

  const generateProjects = async () => {
    if (!userData.Skills) return alert("No skills detected");

    setLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/recommend-projects/",
        new URLSearchParams({ skills: userData.Skills })
      );
      setProjects(response.data.projects);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2 id="headings">Personal Information</h2>
      <div>
        {userData && (
          <ul>
            {Object.entries(userData).map(([key, value]) => (
              <li key={key}>
                {/* <strong>{key}:</strong> {value} */}
                <strong>{key}:</strong>{" "}
                {key === "LinkedIn" || key === "GitHub" ? (
                  <a href={value.startsWith("http") ? value : `https://${value}`} target="_blank" rel="noopener noreferrer">
                    {value}
                  </a>
                ) : (
                  value
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={generateProjects} disabled={loading}>
        {loading ? "Generating ideas..." : "Generate Project Ideas"}
      </button>
      {projects && (
        <div class="generated-ideas">
          <h2 id="headings">Recommended Projects</h2>
          {projects.map((project) => (
            <div class="proj-container">
              <pre id="projects">{ project }</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Results;
