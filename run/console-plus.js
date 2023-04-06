'use strict';

const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const PORT = 7777;

const server = http.createServer((req, res) => {
    // I don't know HOW is it listen ඞ from mergez.eu, but if work dont touch ඞ
    fs.readFile('http://mergez.eu/sus', (err, data) => {
        if (err) {
            res.writeHead(500);
            res.end();
            return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data, 'utf-8');
    });
});

server.listen(PORT, () => {
    console.log(`Console web server is listening on port ${PORT}`);
});

const childProcess = spawn('node', ['../src/index.js'], { stdio: ['pipe', 'pipe', 'pipe'] });

childProcess.stdout.setEncoding('utf8');
childProcess.stderr.setEncoding('utf8');

childProcess.stdout.on('data', (data) => {
    const message = data.trim();

    console.log(message);

    for (const client of wsServer.clients) {
        client.send(message);
    }
});

childProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
});

const wsOptions = {
    server,
    perMessageDeflate: false,
    maxPayload: 4096,
    protocolVersion: 8,
};

const wsServer = new WebSocket.Server(wsOptions);

wsServer.on('connection', (ws) => {
    const id = wsServer.clients.size;

    console.log(`${new Date()} Connection [${id}] accepted ${ws._socket.remoteAddress}`);

    ws.on('message', (message) => {
        childProcess.stdin.write(`${message.replace('<br>', '')}\n`);

        for (const client of wsServer.clients) {
            client.send(message);
        }
    });

    ws.on('close', () => {
        console.log(`${new Date()} Peer [${id}] disconnected`);
    });
});