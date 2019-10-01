
const handleResponse = (xhr) => {
    const content = document.querySelector("#content");
  
    const obj = JSON.parse(xhr.response);
  
    console.dir(obj);
  
    switch(xhr.status) {
      case 200: 
        content.innerHTML = `<b>Success</b>`;
        break;
      case 400:
        content.innerHTML = `<b>Bad Request</b>`;
        break;
      default: 
        content.innerHTML = `Error code not implemented by client.`;
        break;
    }
  };
  
  const sendAjax = (url) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader ("Accept", 'application/json');
  
    xhr.onload = () => handleResponse(xhr);
  
    xhr.send();
  };
  
  const init = () => {
    const successButton = document.querySelector("#success");
    const badRequestButton = document.querySelector("#badRequest");
    const notFoundButton = document.querySelector("#notFound");
  
    const success = () => sendAjax('/success');
    const badRequest = () => sendAjax('/badRequest');
    const notFound = () => sendAjax('/notFoundURL');
  
    successButton.addEventListener('click', success);
    badRequestButton.addEventListener('click', badRequest);
    notFoundButton.addEventListener('click', notFound);
  };
  
  window.onload = init;