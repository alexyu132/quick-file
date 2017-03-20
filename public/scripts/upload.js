document.getElementById("upload").onclick = function() {
  var file = document.getElementById("file").files[0];
  if(file != null) {
    getS3Request(file);
    return;
  }

  alert("No file selected.");
};

function getS3Request(file) {
  var request = new XMLHttpRequest();
  request.open("GET", "/sign?name=" + encodeURIComponent(file.name) + "&type=" + encodeURIComponent(file.type));
  request.onreadystatechange = function () {

    if(request.readyState == 4) {
      if(request.status == 200) {
        var response = JSON.parse(request.responseText);
        sendReady(file.name, response.url, document.getElementById("roomNumber").value, function() {
          upload(file, response.signedRequest, response.url);
        });
      } else {
        document.getElementById("file_status").innerHTML = "Error getting signed URL.";
      }
    }
  };

  request.send();
}

function upload(file, signedRequest, url) {
  document.getElementById("file_status").innerHTML = "Uploading...";

  var request = new XMLHttpRequest();
  request.open("PUT", signedRequest);
  request.onreadystatechange = function () {
    if(request.readyState == 4) {
      if(request.status == 200) {
        document.getElementById("file_status").innerHTML = "Upload successful!";
      } else {
        document.getElementById("file_status").innerHTML = "Error uploading file: " + request.status;
      }
    }
  };

  request.send(file);
}

function sendReady(name, url, room, callback) {

  var request = new XMLHttpRequest();
  request.open("POST", "/ready");
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.onreadystatechange = function () {
    if(request.readyState == 4) {
      if(request.status == 200) {
        callback();
      } else if(request.status == 404){
        document.getElementById("file_status").innerHTML = "The receiving code entered does not exist.";
      } else {
        document.getElementById("file_status").innerHTML = "Error uploading file: " + request.status;
      }
    }
  };

  request.send(JSON.stringify({
    room: room,
    file: name,
    url: url
  }));
}
