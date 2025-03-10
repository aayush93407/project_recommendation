import os
import csv
import shutil
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pdfminer.high_level import extract_text
from mistralai import Mistral

load_dotenv("C:\\Users\\ADMIN\\Desktop\\api_key.env")
api_key_mistral = os.getenv("MISTRALAI_API_KEY")

app = FastAPI()

# CORS to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust if deployed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
SAVE_DIR = "saved"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(SAVE_DIR, exist_ok=True)

def extract_resume_text(pdf_path):
    return extract_text(pdf_path)

def analyze_resume(text):
    model = "mistral-large-latest"
    prompt = f"Analyze this text from a resume and return the following information on new lines \nName, Email ID, Contact Number, LinkedIn and GitHub page links, and extract all skills from projects and those under the skills section and pack them all under the skills field, seperated by commas \nGive me these details in the form field_name : values, each on a new line\nPlease make sure the field names are exactly like this: Name, Email ID, Contact Number, LinkedIn, GitHub, Skills\nPlease don't include any other unnecessary sentence in your response \n{text}"
    
    client = Mistral(api_key=api_key_mistral)
    
    completion = client.chat.complete(
        model=model,
        messages=[
            {
                "role":"user",
                "content": prompt
            }
        ]
    )
    return completion.choices[0].message.content

def recommend_projects(skills):
    model = "mistral-large-latest"
    prompt = f"Based on the skills provided below, recommend top 5 projects that the user can work on and successfully complete\nGenerate your response in this format: Project Name, Project Description, Tools and Skills Utilized, and Steps. \nPlease don't add any other unnecessary sentences in your response \n{skills}"
    
    client = Mistral(api_key=api_key_mistral)
    
    completion = client.chat.complete(
        model=model,
        messages = [
            {
                "role":"user", 
                "content":prompt
            }
        ]
    )
    
    return completion.choices[0].message.content

def create_documentation(project_desc):
    model = "mistral-large-latest"
    prompt = f"Based on the project description given below, create a well-structured markdown documentation suitable for the project's Github repository. The documentation should display a detailed project description, the tools and libraries used, and their versions, and setup and execution steps. \nOnly add code snippets within 3 backticks. Project name can have 3 # while other headings may have 2 #. Use bullet points where necessary \nPlease make sure you add no unnecessary sentences in your response \n{project_desc}"
    
    client = Mistral(api_key=api_key_mistral)
    
    completion = client.chat.complete(
        model=model,
        messages = [
            {
                "role":"user", 
                "content":prompt
            }
        ]
    )
    
    return completion.choices[0].message.content

@app.post("/upload-resume/")
async def upload_resume(file: UploadFile = File(...)):
    ''' Extra stuff '''
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    # for saving the uploaded file to server
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
        
    resume_text = extract_resume_text(file_path)
    user_info = analyze_resume(resume_text)
    
    ''' Real stuff '''
    user_info_dict = {}
    # split by \n
    lines = user_info.split("\n")
    for line in lines:
        key, *value = line.split(':', 1)
        if not value:
            continue
        user_info_dict[key.strip()] = value[0].strip()
        
    csv_filename = "user_info.csv"
    with open(csv_filename, mode="a", newline="") as file:
        fieldnames = ["Name", "Email ID", "Contact Number", "LinkedIn", "GitHub", "Skills"]
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        
        if file.tell() == 0:
            writer.writeheader()
            
        writer.writerow(user_info_dict)
        
    return user_info_dict

@app.post("/recommend-projects/")
async def generate_projects(skills: str = Form(...)):
    projects = recommend_projects(skills)
    projects = projects.replace('**', '').replace('### ', '').split("\n\n")
    return {"projects": projects}
   
@app.post("/generate-documentation/") 
async def generate_project_documentation(project_desc: str = Form(...)):
    filename = os.path.join(SAVE_DIR, "README.md")
    
    try:
        project_documentation = create_documentation(project_desc)
        
        with open(filename, "w") as f:
            f.write(project_documentation)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating documentation : {str(e)}")
    
    return {"message": "Documentation generated!", "download_url": "download-doc"}


@app.get("/download-doc/")
async def download_documentation():
    filepath = os.path.join(SAVE_DIR, "README.md")
    
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Documentation not found")
    
    return FileResponse(filepath, media_type="text/markdown", filename="README.md")


