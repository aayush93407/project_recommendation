import React, { useState } from "react";
import ResumeUploader from "./ResumeUploader";
import Results from "./Results";
import ProjDoc from "./ProjDoc";
import DragDrop from "./DragDrop";
import "./App.css";

function App() {
  const [userData, setUserData] = useState(null);

  return (
    <div>
      <h1 class="title">Resum-e-nator</h1>

      <div class="big-box">
        <div class="box1">
          <ResumeUploader setUserData={setUserData} />
          {userData && <Results userData={userData} />}
        </div>

        <div class="box2">
          <ProjDoc />
        </div>
      </div>
    </div>
  );
}

export default App;
