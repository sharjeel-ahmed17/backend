

const http = require('http');
const PORT = 3003;


const server = http.createServer((req, res) => {
    if (req.url === "/") {
        res.write("home route")
        res.end()
        return;

    }
    if (req.url === "/signup") {
        res.setHeader('Content-Type', 'text/html');

        res.write(`
        <form action="/register" method="POST">
        <input type="text" name="username">
        <input type="text" name="email">
        <input type="text" name="password">
        <button type="submit">submit</button>   
        </form>
        `)
        res.end()
        return;

    }

    if (req.url === '/register' && req.method === 'POST') {
        let data = '';
        req.on("data", (chunk) => {

            data += chunk;
            console.log('chunks :', chunk);
            console.log('data ', data);

        })
        res.write("register successfully");
        res.end();
        return;

    }
    if (req.url === "/login") {

        res.write("login")
        res.end()
        return;

    }

    res.write("invalid url response");
    res.end();
    return




})

server.listen(PORT, () => {
    console.log('server is running ', PORT);

}

)