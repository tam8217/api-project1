// ERROR: If there is no playlist name, and you attempt to add it, then fix it
// , it will technically add a blank entry so it don't work

const fs = require('fs'); // pull in the file system module
const unirest = require('unirest');


const index = fs.readFileSync(`${__dirname}/../hosted/client.html`);
// added script to pull in our js bundle. This script is generated
// by our babel build/watch scripts in our package.json
const jsBundle = fs.readFileSync(`${__dirname}/../hosted/bundle.js`);
const css = fs.readFileSync(`${__dirname}/../hosted/style.css`);

const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const getCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(css);
  response.end();
};


// added function to get our js file in our hosted folder.
// This js file is generated by babel build/run package.json.
// This ES5 file is created from the code in our ES6 file (in the client folder)
const getBundle = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/javascript' });
  response.write(jsBundle);
  response.end();
};
const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

/* const respondJSONMeta = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};
*/

const playlists = { totalPlaylists: 0, list: [] };

const success = (request, response) => {
  const responseJSON = {
    message: 'This is a successful response',
  };

  respondJSON(request, response, 200, responseJSON);
};

const badRequest = (request, response, params) => {
  const responseJSON = {
    message: 'This request has the required parameters',
  };

  if (!params.valid || params.valid !== 'true') {
    responseJSON.message = 'Missing valid query parameter set to true';
    responseJSON.id = 'badRequest';
    return respondJSON(request, response, 400, responseJSON);
  }

  return respondJSON(request, response, 200, responseJSON);
};

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  respondJSON(request, response, 404, responseJSON);
};

const addPlayList = (request, response, incomingData) => {
  // Create an object hold message
  const tempObj = {
    message: 'Artist, Song Name, and Playlist Name are both required',
  };
  // Checking parameters of the incoming incomingData
  if (!incomingData.artist || !incomingData.song || !incomingData.playlistName) {
    tempObj.id = 'missingParams';
    console.log('Error1');
    return respondJSON(request, response, 400, tempObj);
  }

  let playName = incomingData.playlistName;
  if (playName.includes('+')) {
    playName = playName.replace('+', ' ');
  }
  // Status code for creating an item
  const statusCode = 201;
  let exists = false;
  let songs = {};
  let desiredIndex = playlists.totalPlaylists;
  for (let i = 0; i < playlists.totalPlaylists; i++) {
    if (playlists.list[i].name === incomingData.playlistName) {
      exists = true;
      songs = playlists.list[i].songs;
      desiredIndex = index;
      // statusCode = 204;
    }
  }

  if (exists === false) {
    playlists.list[desiredIndex] = { songs, length: 0, name: incomingData.playlistName };
    playlists.totalPlaylists++;
  }
  console.log('error2');
  // If spot already exists, set it to update
  /* if (playlists[incomingData.playlistName]) {
    songs = playlists[incomingData.playlistName].songs;
    statusCode = 204;
  } else {
    playlists[incomingData.playlistName] = { songs, length: 0, name: incomingData.playlistName };
  }
  */
  const currentSongNum = playlists.list[desiredIndex].length;
  // Assign values
  const songJSON = {
    song: incomingData.song,
    artist: incomingData.artist,
    orderInList: currentSongNum + 1,
  };

  songs[currentSongNum] = songJSON;

  playlists.list[desiredIndex].songs = songs;
  playlists.list[desiredIndex].length = currentSongNum + 1;

  console.log('error3');
  return respondJSON(request, response, statusCode, playlists.list[playlists.totalPlaylists - 1]);
};

const searchSong = (request, response, incomingData) => {
  // Create an object hold message
  const tempObj = {
    message: 'At least an Artist or Song Name is requireed',
  };
  // Checking parameters of the incoming incomingData
  if (!incomingData.artist && !incomingData.song) {
    tempObj.id = 'missingParams';
    return respondJSON(request, response, 400, tempObj);
  }
  const req = unirest('GET', 'https://deezerdevs-deezer.p.rapidapi.com/search');
  // let songsJSON = {};
  req.query({
    q: `${incomingData.artist} ${incomingData.song}`,
  });

  req.headers({
    'x-rapidapi-host': 'deezerdevs-deezer.p.rapidapi.com',
    'x-rapidapi-key': '4763759493mshfd683f2901aacdcp1f9dd7jsn712304f496d0',
    'content-type': 'application/json',
  });

  req.end((res) => {
    if (res.error) throw new Error(res.error);
    // songsJSON = res.body;

    return respondJSON(request, response, 200, res.body);
  });
  return false;
};

const loadPlaylists = (request, response) => respondJSON(request, response, 200, playlists);
module.exports = {
  getIndex,
  getBundle,
  success,
  badRequest,
  notFound,
  getCSS,
  addPlayList,
  searchSong,
  loadPlaylists,
};
