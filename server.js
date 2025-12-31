const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');

// Variable that controls which image to display
let imageState = "Chatting";

// Sample image URLs (replace with your local images)
const images = {
    "Chatting": '/images/Chatting.png',
    "Laughing": '/images/Laughing.png',
    "Thinking": '/images/Thinking.png',
    "Surprised": '/images/Surprised.png',
    "Proud": '/images/Proud.png',
    "Confused": '/images/Confused.png',
    "Sad": '/images/Sad.png',
    "Loved": '/images/Loved.png',
    "Frustrated": '/images/Frustrated.png',
    "Embarrassed": '/images/Embarrassed.png',
    "Crying": '/images/Crying.png',
    "Shrug": '/images/Shrug.png',
    "Excited": '/images/Excited.png',
    "Loved": '/images/Loved.png',
    "Enchanted": '/images/Enchanted.png',
    "Sleeping": '/images/Sleeping.png'
};

function reset_image() {
    fetch("http://localhost:3000/api/update",{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageState: "Chatting", func: "reset" }),
        })
        .then(response => response.json()) // Automatically parses the JSON response
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
}

// Store connected SSE clients
let clients = [];

// Function to notify all connected clients about state changes
function notifyClients() {
    clients.forEach(client => {
        client.write(`data: ${JSON.stringify({ state: imageState })}\n\n`);
    });
    console.log(`Notified ${clients.length} clients`);
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    // Serve the main HTML page
    if (parsedUrl.pathname === '/') {
        fs.readFile(path.join(__dirname, 'web_main.html'), 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error: index.html not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    }
    
    // API endpoint to get current image
    else if (parsedUrl.pathname === '/api/image') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            state: imageState,
            imageUrl: `/images/${imageState}.png`
        }));
    }
    
    // API endpoint to change the image state (from browser buttons)
    // else if (parsedUrl.pathname === '/api/change') {
    //     const newState = parsedUrl.query.state;
    //     if (images[newState]) {
    //         let imageState = newState;
    //         console.log(`Image state changed to: ${imageState}`);
    //         notifyClients();
    //     }
    //     res.writeHead(200, { 'Content-Type': 'application/json' });
    //     res.end(JSON.stringify({ success: true, state: imageState }));
    // }
    
    // API endpoint to receive data from Python
    else if (parsedUrl.pathname === '/api/update' && req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const newState = data.imageState;
                
                if (images[newState]) {
                    imageState = newState;
                    console.log(`Image state updated from Python: ${imageState}`);
                    notifyClients();
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, state: imageState }));
                    if (data.func != "reset") {
                        setTimeout(() => {
                                reset_image()
                            }, 10000)
                    }
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Invalid state' }));
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
            }
        });
    }
    
    // SSE endpoint for real-time updates
    else if (parsedUrl.pathname === '/api/events') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });
        
        // Send initial state
        res.write(`data: ${JSON.stringify({ state: imageState })}\n\n`);
        
        // Store this connection
        clients.push(res);
        console.log(`Client connected. Total clients: ${clients.length}`);
        
        // Remove client when they disconnect
        req.on('close', () => {
            clients = clients.filter(client => client !== res);
            console.log(`Client disconnected. Total clients: ${clients.length}`);
        });
    }
    
    // Serve static images
    else if (parsedUrl.pathname.startsWith('/images/') || parsedUrl.pathname.match(/\.(jpg|jpeg|png|gif)$/)) {
        const imagePath = path.join(__dirname, parsedUrl.pathname);
        
        fs.readFile(imagePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Image not found');
                return;
            }
            
            // Set correct content type based on file extension
            const ext = path.extname(imagePath);
            const contentType = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif'
            }[ext] || 'image/jpeg';
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    }
    
    // 404 for other routes
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Current image state: ${imageState}`);
});