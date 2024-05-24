import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  // ... your config from Firebase console
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

import { createContext } from 'react';
import { db, storage } from './firebase'; // Adjust path if needed

export const FirebaseContext = createContext({ db, storage });

import React, { useState, useContext } from 'react';
import { FirebaseContext } from '../FirebaseContext';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ProductForm = () => {
  const { db, storage } = useContext(FirebaseContext);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Upload image to Storage
    const storageRef = ref(storage, `product-images/${image.name}`);
    const uploadTask = uploadBytes(storageRef, image);

    uploadTask.on('state_changed', (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setUploadProgress(progress);
    },
      (error) => {
        console.error("Error uploading image:", error);
      },
      async () => {
        // 2. Get the download URL of the uploaded image
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        // 3. Add product data to Firestore
        try {
          const docRef = await addDoc(collection(db, "products"), {
            name,
            price,
            imageUrl: downloadURL
          });
          console.log("Document written with ID: ", docRef.id);

          // Clear the form
          setName('');
          setPrice(0);
          setImage(null);
          setUploadProgress(0);
        } catch (e) {
          console.error("Error adding document: ", e);
        }
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Product Name:</label>
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label htmlFor="price">Price:</label>
        <input type="number" id="price" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} />
      </div>
      <div>
        <label htmlFor="image">Image:</label>
        <input type="file" id="image" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
      </div>
      {uploadProgress > 0 && <div>Upload Progress: {uploadProgress}%</div>}
      <button type="submit">Add Product</button>
    </form>
  );
};

export default ProductForm;

import React from 'react';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <img src={product.imageUrl} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </div>
  );
};

export default ProductCard;

import React, { useEffect, useState } from 'react';
import { FirebaseContext } from './FirebaseContext';
import ProductForm from './components/ProductForm';
import ProductCard from './components/ProductCard';
import { collection, onSnapshot, query } from 'firebase/firestore';

function App() {
  const { db } = useContext(FirebaseContext);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "products"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedProducts = [];
      querySnapshot.forEach((doc) => {
        fetchedProducts.push({ id: doc.id, ...doc.data() });
      });
      setProducts(fetchedProducts);
    });

    return () => unsubscribe();
  }, [db]);

  return (
    <FirebaseContext.Provider value={{ db, storage }}>
      <div className="App">
        <h1>Product Inventory</h1>
        <ProductForm />
        <div className="product-list">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </FirebaseContext.Provider>
  );
}

export default App; 