const express = require('express');
const crypto = require('crypto');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

// Your code goes here

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})

// Register & Login

// Listen Abrufen

// Liste Anlegen