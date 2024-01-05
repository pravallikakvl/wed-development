const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const { MongoClient } = require('mongodb');
const cors = require('cors');  // Import the cors middleware

const app = express();
const port = 3000;

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());  // Enable CORS

// MongoDB connection string
const mongoURI = 'mongodb://127.0.0.1:27017/';
const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// ... (existing code)

app.post('/upload', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }
  
      await client.connect();
      const database = client.db('paintApp');
      const collection = database.collection('images');
  
      const imageUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
  
      const result = await collection.insertOne({
        imageUrl,
        timestamp: new Date(),
      });
  
      console.log('Inserted image with id:', result.insertedId);
  
      res.status(201).json({ imageUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // ... (existing code)
  

app.get('/getImages', async (req, res) => {
  try {
    await client.connect();
    const database = client.db('paintApp');
    const collection = database.collection('images');

    const images = await collection.find().toArray();

    res.status(200).json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
