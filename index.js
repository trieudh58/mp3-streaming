const http = require('http');
const fs = require('fs');
const { parse } = require('url');

const request = require('request');

const app = http.createServer(async (req, res) => {
  const url = parse(req.url, true);
  const pathName = url.pathname;
  if (pathName === '/') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Allow-Access-Control-Origin', '*');
    fs.createReadStream('./public/index.html').pipe(res);
  } else if (pathName === '/songInfo') {
    const songId = url.query.id;
    if (!songId) {
      res.statusCode = 400;
      res.end();
      return;
    }
    try {
      const json = await fetchSongData(songId);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Allow-Access-Control-Origin', '*');
      res.end(JSON.stringify({ title: json.title, source: json.source['128'], download: json.link_download['128'] }));
    } catch (err) {
      console.log(err);
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: true, message: 'Bad Request' }));
    }
  } else if (pathName === '/favicon.ico') {
    fs.createReadStream('./public/favicon.ico').pipe(res);
  }
  else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html');
    res.end('Not Found');
  }
});

const server = app.listen(7878, () => {
  console.log(`Server is running at: ${server.address().address}:${server.address().port}`);
});

function fetchSongData(songId) {
  return new Promise((resolve, reject) => {
    request({
      uri: `http://api.mp3.zing.vn/api/mobile/song/getsonginfo?requestdata={%22id%22:%22${songId}%22}`,
      method: 'GET',
      json: true
    }, (err, response, json) => {
      if (err) {
        return reject(err);
      }
      return resolve(json);
    });
  })
}