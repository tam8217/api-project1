// Bringing in modules
const fs = require('fs');
const unirest = require('unirest');

// Getting references to files
const index = fs.readFileSync(`${__dirname}/../hosted/client.html`);
const jsBundle = fs.readFileSync(`${__dirname}/../hosted/bundle.js`);
const css = fs.readFileSync(`${__dirname}/../hosted/style.css`);
const nf = fs.readFileSync(`${__dirname}/../hosted/notFound.html`);


// Setting up the web pages
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

// Sending to the 404 page
const notFound = (request, response) => {
  response.writeHead(404, { 'Content-Type': 'text/html' });
  response.write(nf);
  response.end();
};
// Getting the generated bundle
const getBundle = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/javascript' });
  response.write(jsBundle);
  response.end();
};

// Functions which will handle the sending out of data
const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

// Container for all the plaulists to be added
const playlists = { totalPlaylists: 0, list: [] };


const addPlayList = (request, response, incomingData) => {
  // Create an object hold message
  const tempObj = {
    message: 'Artist, Song Name, and Playlist Name are both required',
  };
  // Checking parameters of the incoming incomingData
  if (!incomingData.artist || !incomingData.song || !incomingData.playlistName) {
    tempObj.id = 'missingParams';
    return respondJSON(request, response, 400, tempObj);
  }

  // Getting the name of the playlist and manipulating it
  let playName = incomingData.playlistName;

  // If it inclues + signs, convert those back to spaces (conversion done before sending)
  if (playName.includes('+')) {
    playName = playName.replace('+', ' ');
  }
  // Status code for creating an item
  const statusCode = 201;

  // Defaulting to say that the playlist does not exist, will be changed if it does
  let exists = false;

  // Blank JSON which will be used to store songs
  let songs = {};

  // Creating an index to decide what playlist is being modified, defaulting to the end
  let desiredIndex = playlists.totalPlaylists;

  // Looping through all current playlists to see if one with the searched one exists
  for (let i = 0; i < playlists.totalPlaylists; i++) {
    if (playlists.list[i].name === incomingData.playlistName) {
      // If playlist has a match, set it to be existing
      exists = true;

      // Get a copy of the songs already in the playlist
      songs = playlists.list[i].songs;

      // Set the index to be the current entry
      desiredIndex = i;

      // This esentially is a 204 request, however, 204 requests are unable to send back data
      // Therefore, it has to be sent back as a 201 or 200 status code
      // statusCode = 204;
    }
  }
  // If there is not already a playlist with the name being searched for, make it
  if (exists === false) {
    // Creating basic data to be added for the playlsit
    playlists.list[desiredIndex] = { songs, length: 0, name: incomingData.playlistName };
    playlists.totalPlaylists++;
  }

  // Since this is being added to the end of the song list, get the spot at the end
  // Does not need to be reduced becuase the count has not been increased
  const currentSongNum = playlists.list[desiredIndex].length;
  // Create a JSON to hold informaiton about the song
  const songJSON = {
    song: incomingData.song,
    artist: incomingData.artist,
    // +1 so that it is not zero ordered, but normal order
    orderInList: currentSongNum + 1,
  };

  // Adding the song data to the list of songs
  songs[currentSongNum] = songJSON;

  // Saving the songs again
  playlists.list[desiredIndex].songs = songs;

  // Since a song was added, increasing the length
  playlists.list[desiredIndex].length = currentSongNum + 1;

  // Sending back the playlist data of the playlist which was being modified
  return respondJSON(request, response, statusCode, playlists.list[desiredIndex]);
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

  // Request to get songs from the Deezer API
  // Using the format from RapidAPI's version of it
  // https://rapidapi.com/deezerdevs/api/deezer-1?endpoint=53aa5085e4b07e1f4ebeb429

  // Creating the URL for searching
  const req = unirest('GET', 'https://deezerdevs-deezer.p.rapidapi.com/search');

  // Adding in search parameters
  req.query({
    q: `${incomingData.artist} ${incomingData.song}`,
  });

  // Setting headers, includes API key
  req.headers({
    'x-rapidapi-host': 'deezerdevs-deezer.p.rapidapi.com',
    'x-rapidapi-key': '4763759493mshfd683f2901aacdcp1f9dd7jsn712304f496d0',
    'content-type': 'application/json',
  });

  // Once the request is done, return data
  req.end((res) => {
    // Catch errors
    if (res.error) throw new Error(res.error);

    // Returning the JSON of data from the song request
    // Inside of the end function to make sure data comes back before sending back
    return respondJSON(request, response, 200, res.body);
  });

  // Default response to end back, but should never be reached unless the API is down
  return false;
};

// Head request for a created playlist, 201
const addPlaylistHead = (request, response) => respondJSONMeta(request, response, 201);

// 404 call that returns the status code
const notFoundHead = (request, response) => respondJSONMeta(request, response, 404);

// Returning a success for loading in playlists, if it was needed
const loadPlaylistsHead = (request, response) => respondJSONMeta(request, response, 200);

// Simple function to send back all of the playlists which have been stored in this session
const loadPlaylists = (request, response) => respondJSON(request, response, 200, playlists);
module.exports = {
  getIndex,
  getBundle,
  notFound,
  getCSS,
  addPlayList,
  searchSong,
  loadPlaylists,
  notFoundHead,
  loadPlaylistsHead,
  addPlaylistHead,
};
