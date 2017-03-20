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
  request.open("GET", "/sign?name=" + encodeURIComponent(file.name) + "&type=" + encodeURIComponent(file.type));
  request.onreadystatechange = function () {

    if(request.readyState == 4) {
      if(request.status == 200) {
        var response = JSON.parse(request.responseText);

        upload(file, response.signedRequest, response.url);
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
  console.log(signedRequest);
  request.open("PUT", signedRequest);
  request.onreadystatechange = function () {
    if(request.readyState == 4) {
      if(request.status == 200) {
        document.getElementById("file_status").innerHTML = "Upload successful: " + url;
      } else {
        document.getElementById("file_status").innerHTML = "Error uploading file: " + request.status;
      }
    }
  };

  request.send(file);
}
