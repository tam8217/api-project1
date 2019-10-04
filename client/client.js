const handleResponse = (xhr, parseResp) => {

  const content = document.querySelector('#displayArea');

  switch(xhr.status)
  {
    case 200: 
      content.innerHTML = `<b>Success!</b>`;
      break;

    case 201:
      content.innerHTML = `<b>Created!</b>`;
      break;

    case 204:
      content.innerHTML = `<b>Updated!</b>`;
      break;
    case 400:
      content.innerHTML = `<b>Bad Request</b>`;
      break;
      
    case 404:
      content.innerHTML = `<b>Resource Not Found!</b>`;
      break;

    default:
      content.innerHTML = `<b>Status Code Not Implemented by Client!</b>`;
      break;
  }



  //Parsing JSON if necessary
  //Not parsing if it's only an update coming through
  if(parseResp)
  {
    //Parse the JSON and write it out
    const incJSON = JSON.parse(xhr.response);
    console.log(incJSON);

    //If JSON has a message, write that out
    if(incJSON.message)
    {
      content.innerHTML += `<p>Message: ${incJSON.message}</p>`;
    }

    else
    {
      let list = document.querySelector(`#${incJSON.name}`);
      console.log(list);
      if(list != null)
      {

      }
      else
      {
        let newList = document.createElement("div");
        newList.id = incJSON.name;
        
        const title = document.createElement("h1");
        title.innerHTML = `<h1>Playlist Name: ${incJSON.name}</h1>`;
        newList.appendChild(title);

        for(let i = 0; i < incJSON.length; i++)
        {

          let info = document.createElement("p");
          info.innerHTML = `<p>${incJSON.songs[i].orderInList}. ${incJSON.songs[i].song} -${incJSON.songs[i].artist}`;
          newList.appendChild(info);
        }
        content.appendChild(newList);
      }
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
  xhr.onload = () => handleResponse(xhr,true);

  //Sending the parameters
  const formData = `playlistName=${playlistName.value}&artist=${artist.value}&song=${song.value}`;

  xhr.send(formData);

  e.preventDefault();

  return false;
};
const init = () => {

  const playlistForm = document.querySelector("#playlistInput");

  const addPlaylist = (e) => addToPlaylist(e, playlistForm);

  playlistForm.addEventListener('submit', addPlaylist);
};

window.onload = init;