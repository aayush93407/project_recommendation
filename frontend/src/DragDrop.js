import React, {useState} from 'react';
import { FileUploader } from 'react-drag-drop-files';

const filetypes = ["PDF"];

const DragDrop = () => {
    const [file, setFile] = useState(null);

    const handleChange = (file) => {
        setFile(file);
    }
  return (
    <div>
      <FileUploader handleChange={handleChange} name="file" types={filetypes} />
    </div>
  )
}

export default DragDrop
