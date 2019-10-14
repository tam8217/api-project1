"use strict";

var handleResponse = function handleResponse(xhr, type) {

  //Getting the place to display the message
  var messageArea = document.querySelector("#messageDisplay");

  //Used to check if a bad response comes through
  var dontParse = false;
  //Notifying the user the status of their request
  //Handles bad requests, as successful requests are handled inside their respective checks
  switch (xhr.status) {
    //Passing through positive status requests so it does not default
    case 200:
    case 201:
    case 204:
      break;
    case 400:
      messageArea.innerHTML = "<b>Bad Request! (Are all your parameters filled out?)</b>";
      dontParse = true;
      break;
    case 404:
      messageArea.innerHTML = "<b>Not Found!</b>";
      dontParse = true;
      break;
    case 500:
      messageArea.innerHTML = "<b>Internal Server Error!</b>";
      dontParse = true;
      break;
    default:
      messageArea.innerHTML = "<b>Status Code Not Implemented!</b>";
      dontParse = true;
      break;
  }

  //Parsing JSON if necessary
  //Not parsing on a bad response
  if (dontParse == false) {
    if (type == "add") {
      //Grabbing the area where the playlists will be displayed
      var content = document.querySelector('#displayArea');
      //Parse the JSON and write it out
      var incJSON = JSON.parse(xhr.response);

      //Getting elements on the page that have the class name corresponding to the name of the playlist that came back
      var list = document.getElementsByClassName("" + incJSON.name);

      //If there is a playlist that matches the class, add the object to the playlist instead of remaking the playlist
      if (list.length == 1) {
        //Would be the message that shows up whena 204 status code comes through
        //However, since to update something, data is necessary, it comes in with a 201 status code instead
        messageArea.innerHTML = "<b>Playlist Updated!</b>";
        //ERROR: Check the length and see if there is already an element with that tag
        //Getting the list we are looking at
        var currentList = list[0];

        var songList = currentList.querySelector("#list");
        //Looking at the song at the end of the list 
        var currentSpot = incJSON.length - 1;

        //Creating a paragraph to be added on to the list
        var info = document.createElement("p");

        //Formatting the contents to contain the important information
        info.innerHTML = "<p>" + incJSON.songs[currentSpot].orderInList + ". " + incJSON.songs[currentSpot].song + " - " + incJSON.songs[currentSpot].artist;

        //Making the order in list accessible in the class - also making the element fade in with the w3 schools CSS framework
        info.className = incJSON.songs[currentSpot].orderInList + " w3-animate-opacity w3-border-black";

        //Add the paragraph to the rest of the playlist
        //currentList.appendChild(info);
        songList.appendChild(info);
      }

      //If there is not an element on the page which already has the class name 
      //aka the playlist has not been created
      else {
          //Message which accompanies a 201 status code
          messageArea.innerHTML = "<b>Playlist Created!</b>";
          //Getting the counter for the total number of playlists that have been created
          var totalArea = document.querySelector("#num");

          //Getting the value of it, and then parsing it to an int
          var totalString = totalArea.innerText;
          var totalNum = parseInt(totalString);

          //This is a check to make it such that after 3 elements being made, it will create a new row to hold the data
          if (totalNum % 3 == 0 && totalNum != 0) {
            //Changing the id of the results area so it is not added to again
            content.id = "oldDisplayArea";

            //Creating a new div and changing its values
            var tempCont = document.createElement("div");
            tempCont.id = "displayArea";
            tempCont.className = "w3-cell-row";

            //Used to insert the new content row after the old display area
            //Utilizes the InsertAfter function from this link 
            //https://plainjs.com/javascript/manipulation/insert-an-element-after-or-before-another-32/
            content.parentNode.insertBefore(tempCont, content.nextSibling);

            //Assigning the newly created div to be the one about to be modified
            content = tempCont;
          }
          //console.log(incJSON);
          //Create a div to hold the playlist 
          var newList = document.createElement("div");

          newList.id = incJSON.name;

          //Giving the div the name of the playlist as a class so it can be accessed later
          //Also making it fade in upoon creation, and display in a row with other playlists
          //newList.className = `${incJSON.name} w3-animate-opacity w3-col w3-container`;
          newList.className = incJSON.name + " w3-animate-opacity  w3-cell w3-padding";

          //Creating a header to hold the name of the playlist and attaching it to the Div
          var head = document.createElement("header");
          head.className = "w3-container w3-gray w3-border-black";
          head.innerHTML = "<h1>Playlist name: " + incJSON.name;
          //head.onclick = dropDown(incJSON.name);
          //head.addEventListener("click", dropDown(incJSON.name));
          newList.appendChild(head);

          //Creating a div to hold the songs, allows it to have w3 CSS applied to it
          var listBlock = document.createElement("div");
          listBlock.className = "w3-container w3-white";
          listBlock.id = "list";
          for (var i = 0; i < incJSON.length; i++) {
            //Create the paragraph element
            var _info = document.createElement("p");

            //Formatting the information
            _info.innerHTML = "<p>" + incJSON.songs[i].orderInList + ". " + incJSON.songs[i].song + " - " + incJSON.songs[i].artist;
            _info.className = incJSON.songs[i].orderInList + " w3-border-black";
            listBlock.appendChild(_info);
          }

          //Adding the list of songs to the list
          newList.appendChild(listBlock);
          //Adding the newly created element to the specific area
          content.appendChild(newList);
          //Incrementing the amount of playlists
          totalArea.innerHTML = "<span>" + (totalNum + 1) + "</span>";
        }
    } else if (type == "search") {

      //Retrieving the area to display the search results
      var resultsArea = document.querySelector("#resultsArea");

      var _incJSON = JSON.parse(xhr.response);
      //console.log(incJSON);
      if (_incJSON.total != 0) {
        //Accompanies a 200 status code upon successful results
        messageArea.innerHTML = "<b>Retrieved Results!</b>";
        //Seeting up a display for the search results
        resultsArea.innerHTML = "<b>Here are your results:</b>";

        //Creating a table
        var resultsTable = document.createElement('table');
        //Styling it using w3 School's framework
        resultsTable.className = "w3-table-all";

        //Giving it an easy id so it can be retrieved later
        resultsTable.id = "results";

        //Adding it to the results area
        resultsArea.append(resultsTable);

        //Creating the top row of cells which will give the columns their names
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

            //Creating the new row to hold the cells
            var newRow = resultsTable.insertRow();

            //Creating cells for each piece of data
            var songCol = newRow.insertCell();
            var artistCol = newRow.insertCell();
            var buttonCol = newRow.insertCell();

            //Setting the info from the request
            songCol.innerHTML = "" + _incJSON.data[index].title_short;
            artistCol.innerHTML = "" + _incJSON.data[index].artist.name;

            //Creating a button which can be used to add it to the playlist
            buttonCol.innerHTML = "<input type=\"button\" class=\"w3-button w3-round-large w3-right-align\" value=\"Add to Playlist\" id=\"" + index + "\">";
          }

          //Saving the number of songs displayed
          displayedSongs = _incJSON.total;

          //Adding an event listener to the whole results area, and checking what is clicked
          //Based on the idea of the code from here https://stackoverflow.com/a/34896387
          resultsArea.addEventListener('click', function (e) {

            //Checking which button is being clicked, if any
            for (var _index = 0; _index < _incJSON.total; _index++) {
              if (e.target.id == _index) {
                //Getting the name of the playlist the user entered
                var playlistName = document.querySelector("#playlistInput").querySelector('#playlistField');

                //Checking the name to make sure it is not just blank
                var name = playlistName.value;
                name = name.trim();

                //If the playlist name is not blank, send a request to add it
                if (name != "") {
                  addToPlaylist(e, _incJSON.data[_index].title_short, _incJSON.data[_index].artist.name, name);
                  break;
                }

                //Error check to make sure the user does not send a faulty request without having a playlist name
                else {
                    messageArea.innerHTML = "<b>Please input a playlist name!</b>";
                  }
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
              _buttonCol.innerHTML = "<input type=\"button\" class=\"w3-button w3-round-large w3-right-align\" value=\"Add to Playlist\" id=\"" + _index2 + "\">";
            }

            resultsArea.addEventListener('click', function (e) {
              for (var _index3 = 0; _index3 < 5; _index3++) {
                if (e.target.id == _index3) {
                  //Getting the name of the playlist from what the user inputted
                  var playlistName = document.querySelector("#playlistInput").querySelector('#playlistField');

                  //Reassign it so it can be modified
                  var name = playlistName.value;

                  //Remove white space to make sure it is not just spaces
                  name = name.trim();

                  //Only adding the song to the playlist as long as there is a playlist name
                  if (name != "") {
                    addToPlaylist(e, _incJSON.data[_index3].title_short, _incJSON.data[_index3].artist.name, name);
                  }
                  //Error check to notify the user that they need a playlist name before adding
                  else {
                      messageArea.innerHTML = "<b>Please input a playlist name!</b>";
                    }
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

      //If there are previously loaded playlists
      if (_incJSON2.totalPlaylists != 0) {
        //Message which would come witha 200 status code
        messageArea.innerHTML = "<b>Loaded everyone's playlists!</b>";

        var _content = document.querySelector('#displayArea');

        //Looping through all of the playlists stored
        for (var _index4 = 0; _index4 < _incJSON2.totalPlaylists; _index4++) {

          //Getting the counter for the total number of playlists that have been created
          var _totalArea = document.querySelector("#num");

          //Getting the value of it, and then parsing it to an int
          var _totalString = _totalArea.innerText;
          var _totalNum = parseInt(_totalString);
          console.log(_totalNum);
          //This is a check to make it such that after 3 elements being made, it will create a new row to hold the data
          if (_totalNum % 3 == 0 && _totalNum != 0) {
            //Changing the id of the results area so it is not added to again
            _content.id = "oldDisplayArea";

            //Creating a new div and changing its values
            var _tempCont = document.createElement("div");
            _tempCont.id = "displayArea";
            _tempCont.className = "w3-cell-row";

            //Used to insert the new content row after the old display area
            //Utilizes the InsertAfter function from this link 
            //https://plainjs.com/javascript/manipulation/insert-an-element-after-or-before-another-32/
            _content.parentNode.insertBefore(_tempCont, _content.nextSibling);

            //Assigning the newly created div to be the one about to be modified
            _content = _tempCont;
          }
          //Creating the div for the playlist
          var _newList = document.createElement("div");
          _newList.id = _incJSON2.list[_index4].name;
          _newList.className = _incJSON2.list[_index4].name + " w3-animate-opacity  w3-cell w3-padding";

          //Creating a header to hold the name of the playlist and attaching it to the Div
          var _head = document.createElement("header");
          _head.className = "w3-container w3-gray w3-border-black";
          _head.innerHTML = "<h1>Playlist name: " + _incJSON2.list[_index4].name;
          //head.onclick = dropDown(incJSON.name);
          //head.addEventListener("click", dropDown(incJSON.name));
          _newList.appendChild(_head);

          var _listBlock = document.createElement("div");
          _listBlock.className = "w3-container w3-white";
          _listBlock.id = "list";
          //Looping through each playlist and making elements for all of their songs
          for (var j = 0; j < _incJSON2.list[_index4].length; j++) {
            //Creating the element to be added to the list, and then adding it to the div for the playlist
            var _info2 = document.createElement("p");
            _info2.innerHTML = "<p>" + _incJSON2.list[_index4].songs[j].orderInList + ". " + _incJSON2.list[_index4].songs[j].song + " - " + _incJSON2.list[_index4].songs[j].artist;
            _info2.className = _incJSON2.list[_index4].songs[j].orderInList + " w3-border-black";
            _listBlock.appendChild(_info2);
          }
          _newList.appendChild(_listBlock);
          _content.appendChild(_newList);

          //Incrementing the amount of playlists
          _totalArea.innerHTML = "<span>" + (_totalNum + 1) + "</span>";
        }
      }
    }
  }
  //Resetting the results area if there is a bad search
  else {
      var _resultsArea = document.querySelector("#resultsArea");
      _resultsArea.innerHTML = "";
    }
};

/*const dropDown = (currentID) =>{
  let list = document.querySelector(`#${currentID}`).querySelector("#list");
  if(list.className.contains("w3-show"))
  {
    list.className = list.className.replace(" w3-show","");
  }
  else{
    list.className+= " w3-show";
  }
};
*/
/*
function dropDown(currentID)
{
  //let list = document.querySelector(`#${currentID}`).querySelector("#list");
  let block = document.querySelector(`#${currentID}`);
  console.log("here");
  if(block != null)
  {
    console.log("there");
    let list = block.querySelector("#list");
    if(list.className.contains("w3-show"))
    {
      list.className = list.className.replace(" w3-show","");
    }
    else{
      list.className+= " w3-show";
    }
  }
}
*/
var addToPlaylist = function addToPlaylist(e, song, artist, name) {
  //Actual user data inputted
  //If the playlist name includes spaces, set them to be Plus signs instead
  //Gets replaced back to spaces when adding to the playlist
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
  //Creating a loading message to let the user know their search is going through
  var messageArea = document.querySelector("#messageDisplay");
  messageArea.innerHTML = "<b>Searching!</b>";

  //This code is used to 'reset' the results area and remove any event listeners
  //This is necessary because event listeners are added directly to the div
  //If not reset, the event listeners hang around, and causes multiple songs to be added at once
  //Code taken from https://stackoverflow.com/a/9251864
  var resultsArea = document.querySelector("#resultsArea");
  var tempRes = resultsArea.cloneNode(true);
  resultsArea.parentNode.replaceChild(tempRes, resultsArea);

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

  //Sending the request
  xhr.send();
  e.preventDefault();

  return false;
};

//Sending a basic request when the page loads which will load in all of the previously created playlists
var loadSongs = function loadSongs() {

  //Creating request
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

  //Making it so that clicking on the search button will actually search
  var playlistForm = document.querySelector("#playlistInput");
  var songSearch = function songSearch(e) {
    return searchSongs(e, playlistForm);
  };
  playlistForm.addEventListener('submit', songSearch);

  //Preloading the page with all of the playlists which have been created
  loadSongs();
};

window.onload = init;
