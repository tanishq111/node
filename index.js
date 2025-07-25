const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const PORT = 3000;

const server = http.createServer((req, res) => {
     if(req.method == 'GET') {
        if(req.url == '/') {
            renderFile( './index.html', 'text/html', res);
        }
        else if (req.url === '/style.css') {
            renderFile('./style.css', 'text/css', res);
        }
        else if(req.url === '/posts'){
            fs.readdir('./posts', (err, files) => {
                 if(err){
                    console.log(err);
                    res.writeHead(500, {'Content-Type': 'text/plain'});
                    res.end('Internal Server Error');
                    return;
                 }
                 let post = files.map(file=>{
                    const postId = path.basename(file, '.json');
                    return `<li><a href="/posts/${postId}">${postId}</a></li>`;
                 }).join('');
                 res.writeHead(200, {'Content-Type': 'text/html'});
                 res.end(`<h1>All Posts</h1><br/><ul>${post}</ul>`);
            });
        }
        else if(req.url.startsWith('/posts/')) {
            const postId = req.url.split('/')[2]; /// async await, promises
            fs.readFile(`./posts/${postId}.json`, 'utf8', (err, data) => {
                if(err) {
                    console.log(err);
                    res.writeHead(404, {'Content-Type': 'text/plain'});
                    res.end('Post not found');
                } else {
                    const post = JSON.parse(data);
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end(`<h1>${post.title}</h1><p>${post.content}</p> <a href="/posts">Back to all posts</a>`);
                }
            });
        }
        else {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('Page not found');
        }
     }
     else if(req.method === 'POST' && req.url === '/submit'){
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () =>{
             const form = querystring.parse(body);
             const id = form.title.trim().toLowerCase().replace(/\s+/g, '-');
             const post = {
                title: form.title,
                content: form.content
             };
             fs.writeFile(`./posts/${id}.json`, JSON.stringify(post), (err) => {
                 if(err) {
                     console.log(err);
                     res.writeHead(500, {'Content-Type': 'text/plain'});
                     res.end('Internal Server Error');
                 } else {
                     res.writeHead(302, {'Location': `/posts/${id}`});
                     res.end();
                 }
             });
        });
     }
     else {
        res.writeHead(405, {'Content-Type': 'text/plain'});
        res.end('Method not allowed');
     }
});

const renderFile = (filePath, contentType, res) => {
     fs.readFile(filePath, (err, data) => {
         if(err) {
             res.writeHead(404, {'Content-Type': 'text/plain'});
             res.end('File not found');
         } else {
             res.writeHead(200, {'Content-Type': contentType});
             res.end(data);
         }
     });
}

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});