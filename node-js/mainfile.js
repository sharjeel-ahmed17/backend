const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
const { parse } = require('querystring');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'products.json');

const loadProducts = () => {
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
};

const saveProducts = (products) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
};

const renderForm = () => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Product</title>
</head>
<body>
    <h1>Add a New Product</h1>
    <form action="/add-product" method="post">
        <label for="name">Product Name:</label>
        <input type="text" id="name" name="name" required><br><br>
        <label for="price">Price:</label>
        <input type="text" id="price" name="price" required><br><br>
        <label for="img">Image URL:</label>
        <input type="text" id="img" name="img" required><br><br>
        <button type="submit">Add Product</button>
    </form>
</body>
</html>
`;

const renderProducts = (products) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Products</title>
</head>
<body>
    <h1>Product List</h1>
    <ul>
        ${products.map(product => `
            <li>
                <h2>${product.name}</h2>
                <p>Price: $${product.price}</p>
                <img src="${product.img}" alt="${product.name} image" width="100">
            </li>
        `).join('')}
    </ul>
</body>
</html>
`;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (req.method === 'GET' && parsedUrl.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(renderForm());
    } else if (req.method === 'POST' && parsedUrl.pathname === '/add-product') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { name, price, img } = parse(body);
            const products = loadProducts();
            products.push({ name, price, img });
            saveProducts(products);
            res.writeHead(302, { Location: '/products' });
            res.end();
        });
    } else if (req.method === 'GET' && parsedUrl.pathname === '/products') {
        const products = loadProducts();
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(renderProducts(products));
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
