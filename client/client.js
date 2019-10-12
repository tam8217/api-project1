//Questions: 204 status, not retrieving parsed JSON
//Get Request with parameters
const handleResponse = (xhr, type) => {

  let messageArea = document.querySelector("#messageDisplay");

  switch(xhr.status)
  {
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
  if(xhr.status != 400 && xhr.status != 404)
  {
    if(type == "add")
    {
      const content = document.querySelector('#displayArea');
      //Parse the JSON and write it out
      const incJSON = JSON.parse(xhr.response);
      //console.log(incJSON);
      {
        //let list = document.querySelector(`.${incJSON.name}`);
        let list = document.getElementsByClassName(`${incJSON.name}`);

        //console.log(list);
        if(list.length == 1)
        {
            let currentList = list[0];
            let currentSpot = incJSON.length-1;
            let info = document.createElement("p");
            info.innerHTML = `<p>${incJSON.songs[currentSpot].orderInList}. ${incJSON.songs[currentSpot].song} - ${incJSON.songs[currentSpot].artist}`;
            info.className = incJSON.songs[currentSpot].orderInList;
            info.style = "display:none";
            currentList.appendChild(info);
            $(`.${incJSON.name} > .${incJSON.songs[currentSpot].orderInList}`).fadeIn("slow", function(){});
        }
        else
        {
          let newList = document.createElement("div");
          newList.id = incJSON.name;
          newList.className = incJSON.name;
          //newList.style = "display:inline";

          //newList.style = "display:none";
          //newList.style = "opacity:0";
          
          const title = document.createElement("h1");
          title.innerHTML = `<h1>Playlist Name: ${incJSON.name}</h1>`;
          newList.appendChild(title);

          for(let i = 0; i < incJSON.length; i++)
          {

            let info = document.createElement("p");
            info.innerHTML = `<p>${incJSON.songs[i].orderInList}. ${incJSON.songs[i].song} - ${incJSON.songs[i].artist}`;
            info.className = incJSON.songs[i].orderInList;
            newList.appendChild(info);
          }
          
          content.appendChild(newList);
          /*$(content).append(newList);
          $(`.${incJSON.name}`).fadeIn("slow", function(){
            //$(`.${incJSON.name}`).css("display", "inline");
          });
          */
        }
      }
    }
    else if (type == "search")
    {
      let resultsArea = document.querySelector("#resultsArea");

      const incJSON = JSON.parse(xhr.response);
      //console.log(incJSON);
      if(incJSON.total != 0)
      {
        resultsArea.innerHTML = "<b>Here are your results:</b>";
        //resultsArea.addEventListener('click', function(){console.log("s")});
        let resultsTable = document.createElement('table');
        resultsTable.className = "w3-table-all";
        resultsTable.id = "results";
        resultsArea.append(resultsTable);

        let headRow = resultsTable.insertRow();
        let songHead = headRow.insertCell();
        let artistHead = headRow.insertCell();
        let blankHead = headRow.insertCell();
        
        //Code for adding rows and cells comes from https://www.geeksforgeeks.org/html-dom-table-insertrow-method/#targetText=The%20Table%20insertRow()%20method,%3E%20or%20elements.&targetText=index%20%3AIt%20is%20used%20to,the%20row%20to%20be%20inserted.
        songHead.innerHTML = "<b>Song</b>";
        songHead.addEventListener('click',function(){console.log("s")});
        artistHead.innerHTML = "<b>Artist</b>";
        blankHead.innerHTML = "";

        //Defaulting the number of songs shown to 5, will be changed if there is less
        let displayedSongs = 5;

        //Only displaying a certain number of results
        if(incJSON.total <= 5)
        {
          for (let index = 0; index < incJSON.total; index++) {
            let newRow = resultsTable.insertRow();
            let songCol = newRow.insertCell();
            let artistCol = newRow.insertCell();
            let buttonCol =  newRow.insertCell();

            songCol.innerHTML = `${incJSON.data[index].title_short}`;
            artistCol.innerHTML = `${incJSON.data[index].artist.name}`;
            
            buttonCol.innerHTML = `<input type="submit" class="w3-button w3-round-large" value="Add to Playlist" id="${index}">`;


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
                addToPlaylist(e, incJSON.data[index].title_short, incJSON.data[index].artist.name);
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
            buttonCol.innerHTML = `<input type="submit" class="w3-button w3-round-large" value="Add to Playlist" id="${index}">`;
          }

          resultsArea.addEventListener('click', function(e){
            for (let index = 0; index < 5; index++) {
              if(e.target.id == index)
              {
                addToPlaylist(e, incJSON.data[index].title_short, incJSON.data[index].artist.name);
              }
            }
          });
        }

        //Displaying the number of results
        resultsArea.innerHTML += `<p>Displaying ${displayedSongs} out of ${incJSON.total}`;
      }
      else
      {
        //Resetting the area to have a message displayed instead of a table
        resultsArea.innerHTML = "<b>No songs found! Try refining your search.</b>";
      }
    }
    else if(type == "load")
    {
      const incJSON = JSON.parse(xhr.response);
      //console.log(incJSON);

      //If there are previously loaded playlists
      if(incJSON.totalPlaylists != 0)
      {
        const content = document.querySelector('#displayArea');

        //Looping through all of the playlists stored
        for (let index = 0; index < incJSON.totalPlaylists; index++) 
        {
          let newList = document.createElement("div");
          newList.id = incJSON.name;
          newList.className = incJSON.name;

          
          const title = document.createElement("h1");
          title.innerHTML = `<h1>Playlist Name: ${incJSON.list[index].name}</h1>`;
          newList.appendChild(title);

          //Looping through each playlist and making elements for all of their songs
          for (let j = 0; j < incJSON.list[index].length; j++) 
          {
            let info = document.createElement("p");
            info.innerHTML = `<p>${incJSON.list[index].songs[j].orderInList}. ${incJSON.list[index].songs[j].song} - ${incJSON.list[index].songs[j].artist}`;
            info.className = incJSON.list[index].songs[j].orderInList;
            newList.appendChild(info);
          }  
          content.appendChild(newList);
        }
      }
    }
  }
  else
  {
    let resultsArea = document.querySelector("#resultsArea");
    resultsArea.innerHTML = "";
  }
};


const addToPlaylist = (e, song, artist) =>{
  //Actual user data inputted
  const playlistName = document.querySelector("#playlistInput").querySelector('#playlistField');
  
  let name = playlistName.value;
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

const searchSongs = (e, playlistForm) =>{
  let messageArea = document.querySelector("#messageDisplay");

  messageArea.innerHTML = "<b>Searching!</b>";
  //Actual user data inputted
  const artist = playlistForm.querySelector('#artistField');
  const song = playlistForm.querySelector('#songField');

  //Create request
  const xhr = new XMLHttpRequest();
  const url = `/searchSong?artist=${artist.value}&song=${song.value}`

  //Setting up the request
  xhr.open('GET', url);

  //Setting headers for sending out
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');

  //Setting what happens when it's done
  xhr.onload = () => handleResponse(xhr,"search");

  xhr.send();
  e.preventDefault();

  return false;
};

//Sending a basic request when the page loads which will load in all of the previously created playlists
const loadSongs = ()=>{

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
const init = () => {

  const playlistForm = document.querySelector("#playlistInput");
  const songSearch = (e) => searchSongs(e, playlistForm);
  loadSongs();
  playlistForm.addEventListener('submit', songSearch);
};

window.onload = init;
