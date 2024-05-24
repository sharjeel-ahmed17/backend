const http = require('http'); // Import the 'http' module to create an HTTP server
const queryString = require('querystring'); // Import the 'querystring' module to parse form data
const fs = require('fs'); // Import the 'fs' module to interact with the file system
const path = require('path'); // Import the 'path' module to handle file paths

const PORT = 3001; // Define the port on which the server will listen
const filePath = path.join(process.cwd(), 'data.json'); // Define the path to the data.json file

// Create the HTTP server
const server = http.createServer((req, res) => {
    // Route for the home page
    if (req.url === '/') {
        res.write('Home Route');
        res.end();
        return;
    }

    // Route for the signup form
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

    // Route to handle user registration
    if (req.url === '/register' && req.method === 'POST') {
        let data = '';
        req.on('data', (chunk) => {
            data += chunk;
        });

        req.on('end', () => {
            const parsedData = queryString.parse(data); // Parse the form data
            const { username, email, password, confirmPassword } = parsedData;

            // Check if the passwords match
            if (password !== confirmPassword) {
                res.write('Passwords do not match');
                res.end();
                return;
            }

            // Read the existing user data from the file
            fs.readFile(filePath, 'utf8', (err, fileData) => {
                let users = [];
                if (!err && fileData) {
                    users = JSON.parse(fileData); // Parse the existing user data
                }

                // Add the new user to the list
                users.push({ username, email, password });

                // Save the updated user list to the file
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

    // Route for the login form
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

    // Route to handle user login
    if (req.url === '/submit' && req.method === 'POST') {
        let data = '';
        req.on('data', (chunk) => {
            data += chunk;
        });

        req.on('end', () => {
            const parsedData = queryString.parse(data); // Parse the form data
            const { username, password } = parsedData;

            // Read the user data from the file
            fs.readFile(filePath, 'utf8', (err, fileData) => {
                if (err) {
                    res.write('Error reading user data');
                    res.end();
                    return;
                }

                const users = JSON.parse(fileData); // Parse the user data
                // Check if the user exists and the password matches
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

    // Default route for invalid URLs
    res.write('Invalid Route');
    res.end();
});

// Start the server and listen on the specified port
server.listen(PORT, () => {
    console.log(`Server up and running on port ${PORT}`);
});
