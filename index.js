const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');

// initialize Firebase Admin SDK
const serviceAccount = require('./key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// initialize Firestore database
const db = admin.firestore();

// define API routes
app.get('/items', async (req, res) => {
  try {
    const itemsRef = db.collection('items');
    const snapshot = await itemsRef.get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

app.get('/items/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const itemRef = db.collection('items').doc(itemId);
    const itemDoc = await itemRef.get();
    if (!itemDoc.exists) {
      res.status(404).send('Item not found');
    } else {
      const item = { id: itemDoc.id, ...itemDoc.data() };
      res.json(item);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

app.post('/items', async (req, res) => {
  try {
    const item = req.body;
    const newItemRef = await db.collection('items').add(item);
    const newItemDoc = await newItemRef.get();
    const newItem = { id: newItemRef.id, ...newItemDoc.data() };
    res.json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

app.put('/items/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = req.body;
    const itemRef = db.collection('items').doc(itemId);
    await itemRef.set(item, { merge: true });
    const updatedItemDoc = await itemRef.get();
    const updatedItem = { id: itemId, ...updatedItemDoc.data() };
    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

app.delete('/items/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    await db.collection('items').doc(itemId).delete();
    res.send('Item deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

// start the server
const port = process.env.PORT || 3200;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

