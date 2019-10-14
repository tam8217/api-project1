//Manages responses from the handler
//Has multiple different cases inside 
//Add: A song was added to a playlists, or a new playlsit was made
//Search: A song was searched, and the results will be displayed for the user to interact with
//Load: The page has been refreshed/loaded, and if there are playlists already made, load them onto the page
const handleResponse = (xhr, type) => {

  //Getting the place to display the message
  let messageArea = document.querySelector("#messageDisplay");

  //Used to check if a bad response comes through
  let dontParse = false;

  //Notifying the user the status of their request
  //Handles bad requests, as successful requests are handled inside their respective checks
  switch(xhr.status)
  {
    //Passing through positive status requests so it does not default
    //They are handled individually in the separate calls
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
  if(dontParse == false)
  {
    if(type == "add")
    {
      //Grabbing the area where the playlists will be displayed
      let content = document.querySelector('#displayArea');

      //Parse the JSON and write it out
      const incJSON = JSON.parse(xhr.response);

      //Getting elements on the page that have the class name corresponding to the name of the playlist that came back
      let list = document.getElementsByClassName(`${incJSON.name}`);

      //If there is a playlist that matches the class, add the object to the playlist instead of remaking the playlist
      if(list.length == 1)
      {
        //Would be the message that shows up whena 204 status code comes through
        //However, since to update something, data is necessary, it comes in with a 201 status code instead
        messageArea.innerHTML = "<b>Playlist Updated!</b>";
        
        //Getting the list we are looking at
        let currentList = list[0];

        let songList = currentList.querySelector("#list");
        //Looking at the song at the end of the list 
        let currentSpot = incJSON.length-1;

        //Creating a paragraph to be added on to the list
        let info = document.createElement("p");

        //Formatting the contents to contain the important information
        info.innerHTML = `<p>${incJSON.songs[currentSpot].orderInList}. ${incJSON.songs[currentSpot].song} - ${incJSON.songs[currentSpot].artist}`;

        //Making the order in list accessible in the class - also making the element fade in with the w3 schools CSS framework
        info.className = `${incJSON.songs[currentSpot].orderInList} w3-animate-opacity w3-border-black`;

        //Add the paragraph to the rest of the playlist
        //currentList.appendChild(info);
        songList.appendChild(info);
      }

      //If there is not an element on the page which already has the class name 
      //aka the playlist has not been created
      else
      {
        //Message which accompanies a 201 status code
        messageArea.innerHTML = "<b>Playlist Created!</b>";

        //Getting the counter for the total number of playlists that have been created
        let totalArea = document.querySelector("#num");

        //Getting the value of it, and then parsing it to an int
        let totalString = totalArea.innerText;
        let totalNum = parseInt(totalString);

        //This is a check to make it such that after 3 elements being made, it will create a new row to hold the data
        //Also makes sure it is not the first element, so that it does not try to make a new row instantly
        if(totalNum % 3 == 0 && totalNum!=0)
        {
          //Changing the id of the results area so it is not added to again
          content.id = "oldDisplayArea";

          //Creating a new div and changing its values
          let tempCont = document.createElement("div");
          tempCont.id = "displayArea";
          tempCont.className = "w3-cell-row"

          //Used to insert the new content row after the old display area
          //Utilizes the InsertAfter function from this link 
          //https://plainjs.com/javascript/manipulation/insert-an-element-after-or-before-another-32/
          content.parentNode.insertBefore(tempCont, content.nextSibling);

          //Assigning the newly created div to be the one about to be modified
          content = tempCont;
        }
        //Create a div to hold the playlist 
        let newList = document.createElement("div");

        newList.id = incJSON.name;

        //Giving the div the name of the playlist as a class so it can be accessed later
        //Also making it fade in upoon creation, and display in a row with other playlists
        newList.className = `${incJSON.name} w3-animate-opacity  w3-cell w3-padding`;

        //Creating a header to hold the name of the playlist and attaching it to the Div
        const head = document.createElement("header");
        head.className = "w3-container w3-gray w3-border-black";
        head.innerHTML = `<h1>Playlist name: ${incJSON.name}`;

        newList.appendChild(head);

        //Creating a div to hold the songs, allows it to have w3 CSS applied to it
        let listBlock = document.createElement("div");
        listBlock.className = "w3-container w3-white";
        listBlock.id = "list";
        for(let i = 0; i < incJSON.length; i++)
        {
          //Create the paragraph element
          let info = document.createElement("p");

          //Formatting the information
          info.innerHTML = `<p>${incJSON.songs[i].orderInList}. ${incJSON.songs[i].song} - ${incJSON.songs[i].artist}`;
          info.className = `${incJSON.songs[i].orderInList} w3-border-black`;
          listBlock.appendChild(info);
        }

        //Adding the list of songs to the list
        newList.appendChild(listBlock);
        //Adding the newly created element to the specific area
        content.appendChild(newList);
        //Incrementing the amount of playlists
        totalArea.innerHTML = `<span><b>${totalNum+1}</b></span>`;
      }
    }
    //If the user has searched for a song, go through the process of formatting the results
    else if (type == "search")
    {
      
      //Retrieving the area to display the search results
      let resultsArea = document.querySelector("#resultsArea");

      const incJSON = JSON.parse(xhr.response);

      if(incJSON.total != 0)
      {
        //Accompanies a 200 status code upon successful results
        messageArea.innerHTML = "<b>Retrieved Results!</b>";
        //Seeting up a display for the search results
        resultsArea.innerHTML = "<b>Here are your results:</b>";
        
        //Creating a table
        let resultsTable = document.createElement('table');
        //Styling it using w3 School's framework
        resultsTable.className = "w3-table-all";

        //Giving it an easy id so it can be retrieved later
        resultsTable.id = "results";

        //Adding it to the results area
        resultsArea.append(resultsTable);

        //Creating the top row of cells which will give the columns their names
        let headRow = resultsTable.insertRow();
        let songHead = headRow.insertCell();
        let artistHead = headRow.insertCell();
        let blankHead = headRow.insertCell();
        
        //Code for adding rows and cells comes from https://www.geeksforgeeks.org/html-dom-table-insertrow-method/#targetText=The%20Table%20insertRow()%20method,%3E%20or%20elements.&targetText=index%20%3AIt%20is%20used%20to,the%20row%20to%20be%20inserted.
        songHead.innerHTML = "<b>Song</b>";
        artistHead.innerHTML = "<b>Artist</b>";
        blankHead.innerHTML = ""; //Blank, becuase this column does not need a header, it is the column for the add to playlist buttons

        //Defaulting the number of songs shown to 5, will be changed if there is less
        let displayedSongs = 5;

        //Only displaying a certain number of results
        if(incJSON.total <= 5)
        {
          //Looping through the amount of results that are available
          for (let index = 0; index < incJSON.total; index++) {

            //Creating the new row to hold the cells
            let newRow = resultsTable.insertRow();

            //Creating cells for each piece of data
            let songCol = newRow.insertCell();
            let artistCol = newRow.insertCell();
            let buttonCol =  newRow.insertCell();

            //Setting the info from the request
            songCol.innerHTML = `${incJSON.data[index].title_short}`;
            artistCol.innerHTML = `${incJSON.data[index].artist.name}`;
            
            //Creating a button which can be used to add it to the playlist
            buttonCol.innerHTML = `<input type="button" class="w3-button w3-round-large w3-right-align" value="Add to Playlist" id="${index}">`;
          }

          //Saving the number of songs displayed
          displayedSongs = incJSON.total;

          //Adding an event listener to the whole results area, and checking what is clicked
          //Based on the idea of the code from here https://stackoverflow.com/a/34896387
          resultsArea.addEventListener('click', function(e){

            //Checking which button is being clicked, if any
            for (let index = 0; index < incJSON.total; index++) {
              if(e.target.id == index)
              {
                //Getting the name of the playlist the user entered
                const playlistName = document.querySelector("#playlistInput").querySelector('#playlistField');
                
                //Checking the name to make sure it is not just blank
                let name = playlistName.value;
                name = name.trim();
                
                //If the playlist name is not blank, send a request to add it
                if(name != "")
                {
                  addToPlaylist(e, incJSON.data[index].title_short, incJSON.data[index].artist.name, name);
                  break;
                }

                //Error check to make sure the user does not send a faulty request without having a playlist name
                else
                {
                  messageArea.innerHTML = "<b>Please input a playlist name!</b>";
                }
              }
            }
          });
        }
        //Setting a cap of 5 results if there are more than 5 songs in the returned JSON
        else
        {
          for (let index = 0; index < 5; index++) {
            let newRow = resultsTable.insertRow();
            let songCol = newRow.insertCell();
            let artistCol = newRow.insertCell();
            let buttonCol =  newRow.insertCell();

            songCol.innerHTML = `${incJSON.data[index].title_short}`;
            artistCol.innerHTML = `${incJSON.data[index].artist.name}`;
            buttonCol.innerHTML = `<input type="button" class="w3-button w3-round-large w3-right-align" value="Add to Playlist" id="${index}">`;
          }

          //Adding an event listener to the results area to be used to select songs to be added to the playlist
          resultsArea.addEventListener('click', function(e){
            for (let index = 0; index < 5; index++) {
              if(e.target.id == index)
              {
                //Getting the name of the playlist from what the user inputted
                const playlistName = document.querySelector("#playlistInput").querySelector('#playlistField');
                
                //Reassign it so it can be modified
                let name = playlistName.value;

                //Remove white space to make sure it is not just spaces
                name = name.trim();

                //Only adding the song to the playlist as long as there is a playlist name
                if(name != "")
                {
                  addToPlaylist(e, incJSON.data[index].title_short, incJSON.data[index].artist.name, name);
                }
                //Error check to notify the user that they need a playlist name before adding
                else
                {
                  messageArea.innerHTML = "<b>Please input a playlist name!</b>";
                }
              }
            }
          });
        }
        //Displaying the number of results
        resultsArea.innerHTML += `<p><b>Displaying ${displayedSongs} out of ${incJSON.total}</b></p>`;
      }
      else
      {
        //Resetting the area to have a message displayed instead of a table
        resultsArea.innerHTML = "<b>No songs found! Try refining your search.</b>";
      }
    }
    //If the page is loading for the first time/reloading
    //Will be used to populate the screen with playlists if there are some that have already been made
    else if(type == "load")
    {
      const incJSON = JSON.parse(xhr.response);

      //If there are previously loaded playlists
      if(incJSON.totalPlaylists != 0)
      {
        //Message which would come witha 200 status code
        messageArea.innerHTML = "<b>Loaded everyone's playlists!</b>";
        
        let content = document.querySelector('#displayArea');

        //Looping through all of the playlists stored
        for (let index = 0; index < incJSON.totalPlaylists; index++) 
        {
          
          //Getting the counter for the total number of playlists that have been created
          let totalArea = document.querySelector("#num");

          //Getting the value of it, and then parsing it to an int
          let totalString = totalArea.innerText;
          let totalNum = parseInt(totalString);
          
          //This is a check to make it such that after 3 elements being made, it will create a new row to hold the data
          if(totalNum % 3 == 0 && totalNum!=0)
          {
            //Changing the id of the results area so it is not added to again
            content.id = "oldDisplayArea";

            //Creating a new div and changing its values
            let tempCont = document.createElement("div");
            tempCont.id = "displayArea";
            tempCont.className = "w3-cell-row"

            //Used to insert the new content row after the old display area
            //Utilizes the InsertAfter function from this link 
            //https://plainjs.com/javascript/manipulation/insert-an-element-after-or-before-another-32/
            content.parentNode.insertBefore(tempCont, content.nextSibling);

            //Assigning the newly created div to be the one about to be modified
            content = tempCont;
          }
          //Creating the div for the playlist
          let newList = document.createElement("div");
          newList.id = incJSON.list[index].name;
          newList.className = `${incJSON.list[index].name} w3-animate-opacity  w3-cell w3-padding`;
          
         //Creating a header to hold the name of the playlist and attaching it to the Div
          const head = document.createElement("header");
          head.className = "w3-container w3-gray w3-border-black";
          head.innerHTML = `<h1>Playlist name: ${incJSON.list[index].name}`;
          newList.appendChild(head);

          //Creating div to hold the songs
          let listBlock = document.createElement("div");
          listBlock.className = "w3-container w3-white";
          listBlock.id = "list";
          //Looping through each playlist and making elements for all of their songs
          for (let j = 0; j < incJSON.list[index].length; j++) 
          {
            //Creating the element to be added to the list, and then adding it to the div for the playlist
            let info = document.createElement("p");
            info.innerHTML = `<p>${incJSON.list[index].songs[j].orderInList}. ${incJSON.list[index].songs[j].song} - ${incJSON.list[index].songs[j].artist}`;
            info.className = `${incJSON.list[index].songs[j].orderInList} w3-border-black`;
            listBlock.appendChild(info);
          }  
          newList.appendChild(listBlock);
          content.appendChild(newList);
          
          //Incrementing the amount of playlists
          totalArea.innerHTML = `<span><b>${totalNum+1}</b></span>`;
        }
      }
    }
  }
  //Resetting the results area if there is a bad search
  else
  {
    let resultsArea = document.querySelector("#resultsArea");
    resultsArea.innerHTML = "";
  }
};

//Adding songs to the playlist with a certain name, or making a new one if one does not exist
const addToPlaylist = (e, song, artist, name) =>{
  //Actual user data inputted
  //If the playlist name includes spaces, set them to be Plus signs instead
  //Gets replaced back to spaces when adding to the playlist
  if(name.includes(" "))
  {
    name = name.replace(" ", "+");
  }

  
  //Create request
  const xhr = new XMLHttpRequest();

  //Setting up the request
  xhr.open('POST', '/addPlaylist');

  //Setting headers for sending out
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');

  //Setting what happens when it's done
  xhr.onload = () => handleResponse(xhr,"add");

  //Sending the parameters
  const formData = `playlistName=${name}&artist=${artist}&song=${song}`;
 
  
  xhr.send(formData);

  e.preventDefault();

  return false;
};

//Search for a song using the parameters that the user has inputted
const searchSongs = (e, playlistForm) =>{
  //Creating a loading message to let the user know their search is going through
  let messageArea = document.querySelector("#messageDisplay");
  messageArea.innerHTML = "<b>Searching!</b>";

  //This code is used to 'reset' the results area and remove any event listeners
  //This is necessary because event listeners are added directly to the div
  //If not reset, the event listeners hang around, and causes multiple songs to be added at once
  //Code taken from https://stackoverflow.com/a/9251864
  let resultsArea = document.querySelector("#resultsArea");
  let tempRes = resultsArea.cloneNode(true);
  resultsArea.parentNode.replaceChild(tempRes, resultsArea);

  //Actual user data inputted
  const artist = playlistForm.querySelector('#artistField');
  const song = playlistForm.querySelector('#songField');

  //Create request
  const xhr = new XMLHttpRequest();

  //Request URL, trimming the values so that the user cannot search for spaces
  const url = `/searchSong?artist=${artist.value.trim()}&song=${song.value.trim()}`;

  //Setting up the request
  xhr.open('GET', url);

  //Setting headers for sending out
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');

  //Setting what happens when it's done
  xhr.onload = () => handleResponse(xhr,"search");

  //Sending the request
  xhr.send();
  e.preventDefault();

  return false;
};

//Sending a basic request when the page loads which will load in all of the previously created playlists
const loadSongs = ()=>{

  //Creating request
  const xhr = new XMLHttpRequest();
  
  //Setting up the request
  xhr.open('GET', '/loadPlaylists');

  //Setting headers for sending out
  xhr.setRequestHeader('Accept', 'application/json');

  //Setting what happens when it's done
  xhr.onload = () => handleResponse(xhr,"load");

  xhr.send();
  return false;
};

//Intialize the page
const init = () => {

  //Making it so that clicking on the search button will actually search
  const playlistForm = document.querySelector("#playlistInput");
  const songSearch = (e) => searchSongs(e, playlistForm);
  playlistForm.addEventListener('submit', songSearch);

  //Preloading the page with all of the playlists which have been created
  loadSongs();
};

window.onload = init;
