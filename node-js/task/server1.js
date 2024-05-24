const http = require('http');
const queryString = require('querystring');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const filePath = path.join(process.cwd(), 'data.json');

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.write('Home Route');
        res.end();
        return;
    }

    if (req.url === '/signup') {
        res.setHeader('Content-Type', 'text/html');
        res.write(`
            <form action='/register' method="POST">
                <input type="text" name="username" placeholder="Enter Username" required/>
                <input type="email" name="email" placeholder="Enter Email" required/>
                <input type="password" name="password" placeholder="Enter Password" required/>
                <input type="password" name="confirmPassword" placeholder="Confirm Password" required/>
                <button>SUBMIT</button>
            </form>
        `);
        res.end();
        return;
    }

    if (req.url === '/register' && req.method === 'POST') {
        let data = '';
        req.on('data', (chunk) => {
            data += chunk;
        });

        req.on('end', () => {
            const parsedData = queryString.parse(data);
            const { username, email, password, confirmPassword } = parsedData;

            if (password !== confirmPassword) {
                res.write('Passwords do not match');
                res.end();
                return;
            }

            fs.readFile(filePath, 'utf8', (err, fileData) => {
                let users = [];
                if (!err && fileData) {
                    users = JSON.parse(fileData);
                }

                users.push({ username, email, password });

                fs.writeFile(filePath, JSON.stringify(users, null, 2), (err) => {
                    if (err) {
                        res.write('Error saving user data');
                        res.end();
                        return;
                    }

                    res.write('Registration successful');
                    res.end();
                });
            });
        });
        return;
    }

    if (req.url === '/login') {
        res.setHeader('Content-Type', 'text/html');
        res.write(`
            <form action='/submit' method="POST">
                <input type="text" name="username" placeholder="Enter Username" required/>
                <input type="password" name="password" placeholder="Enter Password" required/>
                <button>SUBMIT</button>
            </form>
        `);
        res.end();
        return;
    }

    if (req.url === '/submit' && req.method === 'POST') {
        let data = '';
        req.on('data', (chunk) => {
            data += chunk;
        });

        req.on('end', () => {
            const parsedData = queryString.parse(data);
            const { username, password } = parsedData;

            fs.readFile(filePath, 'utf8', (err, fileData) => {
                if (err) {
                    res.write('Error reading user data');
                    res.end();
                    return;
                }

                const users = JSON.parse(fileData);
                const user = users.find(user => user.username === username && user.password === password);

                if (user) {
                    res.write('Login successful');
                } else {
                    res.write('Invalid username or password');
                }
                res.end();
            });
        });
        return;
    }

    res.write('Invalid Route');
    res.end();
});

server.listen(PORT, () => {
    console.log(`Server up and running on port ${PORT}`);
});
