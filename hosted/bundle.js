"use strict";

var handleResponse = function handleResponse(xhr) {
  var content = document.querySelector("#content");

  var obj = JSON.parse(xhr.response);

  console.dir(obj);

  switch (xhr.status) {
    case 200:
      content.innerHTML = "<b>Success</b>";
      break;
    case 400:
      content.innerHTML = "<b>Bad Request</b>";
      break;
    default:
      content.innerHTML = "Error code not implemented by client.";
      break;
  }
};

var sendAjax = function sendAjax(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.setRequestHeader("Accept", 'application/json');

  xhr.onload = function () {
    return handleResponse(xhr);
  };

  xhr.send();
};

var init = function init() {
  var successButton = document.querySelector("#success");
  var badRequestButton = document.querySelector("#badRequest");
  var notFoundButton = document.querySelector("#notFound");

  var success = function success() {
    return sendAjax('/success');
  };
  var badRequest = function badRequest() {
    return sendAjax('/badRequest');
  };
  var notFound = function notFound() {
    return sendAjax('/notFoundURL');
  };

  successButton.addEventListener('click', success);
  badRequestButton.addEventListener('click', badRequest);
  notFoundButton.addEventListener('click', notFound);
};

window.onload = init;
