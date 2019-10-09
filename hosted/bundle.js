"use strict";

var handleResponse = function handleResponse(xhr, parseResp) {

  var content = document.querySelector('#displayArea');

  //Parsing JSON if necessary
  //Not parsing if it's only an update coming through
  if (parseResp) {
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
        currentList.appendChild(info);
      } else {
        var newList = document.createElement("div");
        newList.id = incJSON.name;
        newList.className = incJSON.name;

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
      }
    }
  }
};

var addToPlaylist = function addToPlaylist(e, playlistForm) {

  //Getting the URL to send to and the POST request type
  var action = playlistForm.getAttribute('action');
  var method = playlistForm.getAttribute('method');

  //Actual user data inputted
  var playlistName = playlistForm.querySelector('#playlistField');
  var artist = playlistForm.querySelector('#artistField');
  var song = playlistForm.querySelector('#songField');

  //Create request
  var xhr = new XMLHttpRequest();

  //Setting up the request
  xhr.open(method, action);

  //Setting headers for sending out
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');

  //Setting what happens when it's done
  xhr.onload = function () {
    return handleResponse(xhr, true);
  };

  //Sending the parameters
  var formData = "playlistName=" + playlistName.value + "&artist=" + artist.value + "&song=" + song.value;

  xhr.send(formData);

  e.preventDefault();

  return false;
};
var init = function init() {

  var playlistForm = document.querySelector("#playlistInput");

  var addPlaylist = function addPlaylist(e) {
    return addToPlaylist(e, playlistForm);
  };

  playlistForm.addEventListener('submit', addPlaylist);
};

window.onload = init;
