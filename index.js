import express from 'express'
import * as Minio from 'minio'
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

var app = express()

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

console.log();


const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    useSSL: true,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
})


app.post('/api/v1/upload', upload.single('file'), async (req, res) => {
  try {

      const bucketName = process.env.MINIO_BUCKET_NAME;

      const timestamp = Date.now();
      const objectName = `${timestamp}_${req.file.originalname}`;
      
      const fileBuffer = req.file.buffer;
      
      const absoluteFilePath = `https://${process.env.MINIO_ENDPOINT}/${bucketName}/${objectName}`;

      const uploadResult = await minioClient.putObject(bucketName, objectName, fileBuffer);

      res.json({ message: 'File uploaded successfully',  url: absoluteFilePath });

  } catch (err) {
      console.error('Error uploading file:', err);
      res.status(500).json({ error: 'Failed to upload file' });
  }
});


app.listen(3001, () => {
    console.log('Server is running on port 3001');
});

