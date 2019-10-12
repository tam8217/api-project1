"use strict";

//Questions: 204 status, not retrieving parsed JSON
//Get Request with parameters
var handleResponse = function handleResponse(xhr, type) {

  var messageArea = document.querySelector("#messageDisplay");

  switch (xhr.status) {
    case 200:
      messageArea.innerHTML = "<b>Success!</b>";
      break;
    case 201:
      messageArea.innerHTML = "<b>Playlist Created!</b>";
      break;
    case 204:
      messageArea.innerHTML = "<b>Playlist Updated!</b>";
      break;
    case 400:
      messageArea.innerHTML = "<b>Bad Request! (Are all your parameters filled out?)</b>";
      break;
    case 404:
      messageArea.innerHTML = "<b>Not Found!</b>";
      break;
    case 500:
      messageArea.innerHTML = "<b>Internal Server Error!</b>";
      break;
    default:
      messageArea.innerHTML = "<b>Status Code Not Implemented!</b>";
      break;
  }
  //console.log(xhr.response);
  //Parsing JSON if necessary
  if (xhr.status != 400 && xhr.status != 404) {
    if (type == "add") {
      var content = document.querySelector('#displayArea');
      //Parse the JSON and write it out
      var incJSON = JSON.parse(xhr.response);
      //console.log(incJSON);
      {
        //let list = document.querySelector(`.${incJSON.name}`);
        var list = document.getElementsByClassName("" + incJSON.name);

        //console.log(list);
        if (list.length == 1) {
          var currentList = list[0];
          var currentSpot = incJSON.length - 1;
          var info = document.createElement("p");
          info.innerHTML = "<p>" + incJSON.songs[currentSpot].orderInList + ". " + incJSON.songs[currentSpot].song + " - " + incJSON.songs[currentSpot].artist;
          info.className = incJSON.songs[currentSpot].orderInList;
          info.style = "display:none";
          currentList.appendChild(info);
          $("." + incJSON.name + " > ." + incJSON.songs[currentSpot].orderInList).fadeIn("slow", function () {});
        } else {
          var newList = document.createElement("div");
          newList.id = incJSON.name;
          newList.className = incJSON.name;
          //newList.style = "display:inline";

          //newList.style = "display:none";
          //newList.style = "opacity:0";

          var title = document.createElement("h1");
          title.innerHTML = "<h1>Playlist Name: " + incJSON.name + "</h1>";
          newList.appendChild(title);

          for (var i = 0; i < incJSON.length; i++) {

            var _info = document.createElement("p");
            _info.innerHTML = "<p>" + incJSON.songs[i].orderInList + ". " + incJSON.songs[i].song + " - " + incJSON.songs[i].artist;
            _info.className = incJSON.songs[i].orderInList;
            newList.appendChild(_info);
          }

          content.appendChild(newList);
          /*$(content).append(newList);
          $(`.${incJSON.name}`).fadeIn("slow", function(){
            //$(`.${incJSON.name}`).css("display", "inline");
          });
          */
        }
      }
    } else if (type == "search") {
      var resultsArea = document.querySelector("#resultsArea");

      var _incJSON = JSON.parse(xhr.response);
      //console.log(incJSON);
      if (_incJSON.total != 0) {
        resultsArea.innerHTML = "<b>Here are your results:</b>";
        //resultsArea.addEventListener('click', function(){console.log("s")});
        var resultsTable = document.createElement('table');
        resultsTable.className = "w3-table-all";
        resultsTable.id = "results";
        resultsArea.append(resultsTable);

        var headRow = resultsTable.insertRow();
        var songHead = headRow.insertCell();
        var artistHead = headRow.insertCell();
        var blankHead = headRow.insertCell();

        //Code for adding rows and cells comes from https://www.geeksforgeeks.org/html-dom-table-insertrow-method/#targetText=The%20Table%20insertRow()%20method,%3E%20or%20elements.&targetText=index%20%3AIt%20is%20used%20to,the%20row%20to%20be%20inserted.
        songHead.innerHTML = "<b>Song</b>";
        songHead.addEventListener('click', function () {
          console.log("s");
        });
        artistHead.innerHTML = "<b>Artist</b>";
        blankHead.innerHTML = "";

        //Defaulting the number of songs shown to 5, will be changed if there is less
        var displayedSongs = 5;

        //Only displaying a certain number of results
        if (_incJSON.total <= 5) {
          for (var index = 0; index < _incJSON.total; index++) {
            var newRow = resultsTable.insertRow();
            var songCol = newRow.insertCell();
            var artistCol = newRow.insertCell();
            var buttonCol = newRow.insertCell();

            songCol.innerHTML = "" + _incJSON.data[index].title_short;
            artistCol.innerHTML = "" + _incJSON.data[index].artist.name;

            buttonCol.innerHTML = "<input type=\"submit\" class=\"w3-button w3-round-large\" value=\"Add to Playlist\" id=\"" + index + "\">";
          }

          //Saving the number of songs displayed
          displayedSongs = _incJSON.total;

          //Adding an event listener to the whole results area, and checking what is clicked
          //Based on the idea of the code from here https://stackoverflow.com/a/34896387
          resultsArea.addEventListener('click', function (e) {

            //Checking which button is being clicked, if any
            for (var _index = 0; _index < _incJSON.total; _index++) {
              if (e.target.id == _index) {
                addToPlaylist(e, _incJSON.data[_index].title_short, _incJSON.data[_index].artist.name);
              }
            }
          });
        }
        //Setting a cap of 5 results if there are more than 5 songs in the returned JSON
        else {
            for (var _index2 = 0; _index2 < 5; _index2++) {
              var _newRow = resultsTable.insertRow();
              var _songCol = _newRow.insertCell();
              var _artistCol = _newRow.insertCell();
              var _buttonCol = _newRow.insertCell();

              _songCol.innerHTML = "" + _incJSON.data[_index2].title_short;
              _artistCol.innerHTML = "" + _incJSON.data[_index2].artist.name;
              _buttonCol.innerHTML = "<input type=\"submit\" class=\"w3-button w3-round-large\" value=\"Add to Playlist\" id=\"" + _index2 + "\">";
            }

            resultsArea.addEventListener('click', function (e) {
              for (var _index3 = 0; _index3 < 5; _index3++) {
                if (e.target.id == _index3) {
                  addToPlaylist(e, _incJSON.data[_index3].title_short, _incJSON.data[_index3].artist.name);
                }
              }
            });
          }

        //Displaying the number of results
        resultsArea.innerHTML += "<p>Displaying " + displayedSongs + " out of " + _incJSON.total;
      } else {
        //Resetting the area to have a message displayed instead of a table
        resultsArea.innerHTML = "<b>No songs found! Try refining your search.</b>";
      }
    } else if (type == "load") {
      var _incJSON2 = JSON.parse(xhr.response);
      //console.log(incJSON);

      //If there are previously loaded playlists
      if (_incJSON2.totalPlaylists != 0) {
        var _content = document.querySelector('#displayArea');

        //Looping through all of the playlists stored
        for (var _index4 = 0; _index4 < _incJSON2.totalPlaylists; _index4++) {
          var _newList = document.createElement("div");
          _newList.id = _incJSON2.name;
          _newList.className = _incJSON2.name;

          var _title = document.createElement("h1");
          _title.innerHTML = "<h1>Playlist Name: " + _incJSON2.list[_index4].name + "</h1>";
          _newList.appendChild(_title);

          //Looping through each playlist and making elements for all of their songs
          for (var j = 0; j < _incJSON2.list[_index4].length; j++) {
            var _info2 = document.createElement("p");
            _info2.innerHTML = "<p>" + _incJSON2.list[_index4].songs[j].orderInList + ". " + _incJSON2.list[_index4].songs[j].song + " - " + _incJSON2.list[_index4].songs[j].artist;
            _info2.className = _incJSON2.list[_index4].songs[j].orderInList;
            _newList.appendChild(_info2);
          }
          _content.appendChild(_newList);
        }
      }
    }
  } else {
    var _resultsArea = document.querySelector("#resultsArea");
    _resultsArea.innerHTML = "";
  }
};

var addToPlaylist = function addToPlaylist(e, song, artist) {
  //Actual user data inputted
  var playlistName = document.querySelector("#playlistInput").querySelector('#playlistField');

  var name = playlistName.value;
  if (name.includes(" ")) {
    name = name.replace(" ", "+");
  }
  //Create request
  var xhr = new XMLHttpRequest();

  //Setting up the request
  xhr.open('POST', '/addPlaylist');

  //Setting headers for sending out
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');

  //Setting what happens when it's done
  xhr.onload = function () {
    return handleResponse(xhr, "add");
  };

  //Sending the parameters
  var formData = "playlistName=" + name + "&artist=" + artist + "&song=" + song;

  xhr.send(formData);

  e.preventDefault();

  return false;
};

var searchSongs = function searchSongs(e, playlistForm) {
  var messageArea = document.querySelector("#messageDisplay");

  messageArea.innerHTML = "<b>Searching!</b>";
  //Actual user data inputted
  var artist = playlistForm.querySelector('#artistField');
  var song = playlistForm.querySelector('#songField');

  //Create request
  var xhr = new XMLHttpRequest();
  var url = "/searchSong?artist=" + artist.value + "&song=" + song.value;

  //Setting up the request
  xhr.open('GET', url);

  //Setting headers for sending out
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');

  //Setting what happens when it's done
  xhr.onload = function () {
    return handleResponse(xhr, "search");
  };

  xhr.send();
  e.preventDefault();

  return false;
};

//Sending a basic request when the page loads which will load in all of the previously created playlists
var loadSongs = function loadSongs() {

  var xhr = new XMLHttpRequest();

  //Setting up the request
  xhr.open('GET', '/loadPlaylists');

  //Setting headers for sending out
  xhr.setRequestHeader('Accept', 'application/json');

  //Setting what happens when it's done
  xhr.onload = function () {
    return handleResponse(xhr, "load");
  };

  xhr.send();
  return false;
};
var init = function init() {

  var playlistForm = document.querySelector("#playlistInput");
  var songSearch = function songSearch(e) {
    return searchSongs(e, playlistForm);
  };
  loadSongs();
  playlistForm.addEventListener('submit', songSearch);
};

window.onload = init;
