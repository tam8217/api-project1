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
  console.log(xhr.response);
  //Parsing JSON if necessary
  //Not parsing if it's only an update coming through
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
      console.log(xhr.response);
    }
  }
};


const addToPlaylist = (e, playlistForm) =>{

  //Getting the URL to send to and the POST request type
  const action = playlistForm.getAttribute('action');
  const method = playlistForm.getAttribute('method');

  //Actual user data inputted
  const playlistName = playlistForm.querySelector('#playlistField');
  const artist = playlistForm.querySelector('#artistField');
  const song = playlistForm.querySelector('#songField');

  //Create request
  const xhr = new XMLHttpRequest();

  //Setting up the request
  xhr.open(method, action);

  //Setting headers for sending out
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');

  //Setting what happens when it's done
  xhr.onload = () => handleResponse(xhr,"add");

  //Sending the parameters
  const formData = `playlistName=${playlistName.value}&artist=${artist.value}&song=${song.value}`;

  xhr.send(formData);

  e.preventDefault();

  return false;
};

const searchSongs = (e, playlistForm) =>{

  //Getting the URL to send to and the POST request type
  

  //Actual user data inputted
  const artist = playlistForm.querySelector('#artistField');
  const song = playlistForm.querySelector('#songField');

  //Create request
  const xhr = new XMLHttpRequest();
  const url = `/searchSong?artist=${artist.value}&song=${song.value}`
  console.log(url);
  //Setting up the request
  xhr.open('GET', url);

  //Setting headers for sending out
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');

  //Setting what happens when it's done
  xhr.onload = () => handleResponse(xhr,"search");

  //Sending the parameters
  //const formData = `artist=${artist.value}&song=${song.value}`;

  //xhr.send(formData);
  xhr.send();
  e.preventDefault();

  return false;
};
const init = () => {

  const playlistForm = document.querySelector("#playlistInput");

  const addPlaylist = (e) => searchSongs(e, playlistForm);
  //const addPlaylist = (e) => addToPlaylist(e, playlistForm);

  playlistForm.addEventListener('submit', addPlaylist);
};

window.onload = init;