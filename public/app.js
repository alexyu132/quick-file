document.getElementById("file").onchange = function() {
  var file = document.getElementById("file").files[0];
  if(file != null) {
    getS3Request(file);
    return;
  }

  alert("No file selected.");
};

function getS3Request(file) {
  var request = new XMLHttpRequest();
  request.open("GET", "/sign?name=" + file.name + "&type=" + file.type);
  request.onreadystatechange = function () {
    if(request.readyState == 4) {
      if(request.status == 200) {
        var response = JSON.parse(request.responseText);

        console.log(response.signedRequest + " " + response.url + "\n");

        upload(file, response.signedRequest, response.url);
      } else {
        document.getElementById("file_status").value = "Error getting signed URL.";
      }
    }
  };

  request.send();
}

function upload(file, signedRequest, url) {

  document.getElementById("file_status").value = "Uploading...";

  var request = new XMLHttpRequest('PUT', signedRequest);
  request.open("PUT", signedRequest);
  request.onreadystatechange = function () {
    if(request.readyState == 4) {
      if(request.status == 200) {
        document.getElementById("file_status").value = "Upload successful: " + url;
      } else {
        document.getElementById("file_status").value = "Error uploading file";
      }
    }
  };

  request.send(file);
}
