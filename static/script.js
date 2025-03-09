document.getElementById("uploadForm").addEventListener("submit", function(event) {
    event.preventDefault();

    let fileInput = document.getElementById("resume");
    if (fileInput.files.length === 0) {
        alert("Please select a file!");
        return;
    }

    let formData = new FormData();
    formData.append("file", fileInput.files[0]);

    fetch("http://127.0.0.1:5000/upload", {  // ✅ Ensure URL is correct
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log("Server Response:", data);
        if (data.error) {
            alert("Error: " + data.error);
        } else {
            localStorage.setItem("resumeData", JSON.stringify(data));
            window.location.href = "/result";
        }
    })
    .catch(error => {
        alert("An error occurred. Check the console.");
        console.error("Fetch Error:", error);
    });
});
