const http = require('http'); // Import the 'http' module
const querystring = require('querystring'); // Import the 'querystring' module to parse form data
const fs = require('fs'); // Import the 'fs' module to interact with the file system
const path = require('path'); // Import the 'path' module to handle file paths
const formidable = require('formidable'); // Import the 'formidable' module to handle file uploads

const PORT = 3004; // Define the port on which the server will listen
const filePath = path.join(process.cwd(), 'data.json'); // Define the path to the data.json file
const uploadDir = path.join(process.cwd(), 'uploads'); // Define the path to the upload directory

// Create the upload directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Create the HTTP server
const server = http.createServer((req, res) => {
    // Route for the home page
    if (req.url === '/' && req.method === 'GET') {
        res.setHeader('Content-Type', 'text/html');
        res.write(`
            <form action='/submit' method='POST' enctype='multipart/form-data'>
                <input type='text' name='name' placeholder='Enter Product Name' required/><br/>
                <input type='number' name='price' placeholder='Enter Product Price' required/><br/>
                <input type='file' name='image' required/><br/>
                <button type='submit'>Submit</button>
            </form>
        `);
        res.end();
        return;
    }

    // Route to handle form submission
    if (req.url === '/submit' && req.method === 'POST') {
        const form = new formidable.IncomingForm();
        form.uploadDir = uploadDir;
        form.keepExtensions = true;

        form.parse(req, (err, fields, files) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.write('Error processing form');
                res.end();
                return;
            }

            const { name, price } = fields;
            const imagePath = files.image.path;

            // Read existing product data
            fs.readFile(filePath, 'utf8', (err, fileData) => {
                let products = [];
                if (!err && fileData) {
                    products = JSON.parse(fileData);
                }

                // Add new product to the list
                products.push({ name, price, imagePath });

                // Save updated product list to the file
                fs.writeFile(filePath, JSON.stringify(products, null, 2), (err) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.write('Error saving product data');
                        res.end();
                        return;
                    }

                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.write('Product saved successfully');
                    res.end();
                });
            });
        });
        return;
    }
    // Route to display product data
    if (req.url === '/products' && req.method === 'GET') {
        res.setHeader('Content-Type', 'text/html');

        // Read product data from file
        fs.readFile(filePath, 'utf8', (err, fileData) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.write('Error reading product data');
                res.end();
                return;
            }

            const products = JSON.parse(fileData);

            // Generate HTML to display products
            const productCards = products.map(product => `
            <div style="border: 1px solid #ccc; padding: 16px; margin: 16px; width: 200px;">
                <h2>${product.name}</h2>
                <p>Price: $${product.price}</p>
                <img src="/uploads/${product.imagePath}" alt="${product.name}" style="width: 100%; height: auto;"/>
            </div>
        `).join('');

            res.write(`
            <h1>Product List</h1>
            <div style="display: flex; flex-wrap: wrap;">
                ${productCards}
            </div>
        `);
            res.end();
        });
        return;
    }

    // Route to serve uploaded images
    if (req.url.startsWith('/uploads/')) {
        const imagePath = path.join(process.cwd(), req.url);
        fs.readFile(imagePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.write('Image not found');
                res.end();
                return;
            }

            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.write(data);
            res.end();
        });
        return;
    }
    // Default response for unknown routes
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.write('Invalid Route');
    res.end();
});

// Start the server and listen on the specified port
server.listen(PORT, () => {
    console.log('Server is running on port', PORT);
});
