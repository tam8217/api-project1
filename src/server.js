const http = require('http');
const url = require('url');
const query = require('querystring');
const handler = require('./handler.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;


const handleGetReq = (request, response, parsedURL) => {
  // Directing to specific URLs
  if (parsedURL.pathname === '/style.css') {
    handler.getCSS(request, response);
  } else if (parsedURL.pathname === '/bundle.js') {
    handler.getBundle(request, response);
  } else if (parsedURL.pathname === '/') {
    handler.getIndex(request, response);
  } else if (parsedURL.pathname === '/searchSong') {
    handler.searchSong(request, response, query.parse(parsedURL.query));
  } else if (parsedURL.pathname === '/loadPlaylists') {
    handler.loadPlaylists(request, response);
  } else {
    handler.notFound(request, response);
  }
};

const handleHeadReq = (request, response, parsedURL) => {
  // Meta data from loading playlists in
  if (parsedURL.pathname === '/loadPlaylists') {
    handler.loadPlaylistsHead(request, response);
  } else if (parsedURL.pathname === '/addPlaylist') { // Meta data from adding playlists
    handler.addPlaylistHead(request, response);
  } else { // Catch all meta data, bad request meta data
    handler.notFoundHead(request, response);
  }
};

const handlePostReq = (request, response, parsedURL) => {
  if (parsedURL.pathname === '/addPlaylist') {
    // Creating response to be manipulated
    const tempResponse = response;

    // Holder for parameters
    const userData = [];

    // Error handling
    request.on('error', (err) => {
      console.log(err);
      tempResponse.statusCode = 400;
      tempResponse.end();
    });

    // Adding to the data
    request.on('data', (chunk) => {
      userData.push(chunk);
    });

    // Once data is finished, send it out
    request.on('end', () => {
      const userString = Buffer.concat(userData).toString();

      const userParams = query.parse(userString);

      handler.addPlayList(request, response, userParams);
    });
  }
};

// Handling requests from server
const onRequest = (request, response) => {
  // Parsing incoming url
  const parsedURL = url.parse(request.url);

  // Directing request to where it needs to go
  if (request.method === 'POST') {
    handlePostReq(request, response, parsedURL);
  } else if (request.method === 'HEAD') {
    handleHeadReq(request, response, parsedURL);
  } else {
    handleGetReq(request, response, parsedURL);
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
