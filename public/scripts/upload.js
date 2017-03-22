document.getElementById("upload").onclick = function() {
    var file = document.getElementById("file").files[0];
    if (file != null && document.getElementById("roomNumber").value) {
        getS3Request(file);
        return;
    }
    if (!document.getElementById("roomNumber").value) {
        alert("Enter a receiver number.");
    } else {
        alert("No file selected.");
    }
};

function getS3Request(file) {
    var request = new XMLHttpRequest();
    request.open("GET", "/sign?room=" + encodeURIComponent(document.getElementById("roomNumber").value) + "&name=" + encodeURIComponent(file.name) + "&type=" + encodeURIComponent("binary/octet-stream"));
    request.onreadystatechange = function() {

        if (request.readyState == 4) {
            if (request.status == 200) {
                var response = JSON.parse(request.responseText);
                upload(file, response.signedRequest, response.url);
            } else if (request.status == 404) {
                document.getElementById("file_status").innerHTML = "The receiving code entered does not exist.";
            } else {
                document.getElementById("file_status").innerHTML = "Error uploading file: " + request.status;
            }
        }
    };

    request.send();
}

function upload(file, signedRequest, url) {
    document.getElementById("file_status").innerHTML = "Uploading...";

    var request = new XMLHttpRequest();
    request.open("PUT", signedRequest);
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            if (request.status == 200) {
                sendReady(file.name, url, document.getElementById("roomNumber").value);
            } else {
                document.getElementById("file_status").innerHTML = "Error uploading file: " + request.status;
            }
        }
    };

    request.send(file);
}

function sendReady(name, url, room) {

    var request = new XMLHttpRequest();
    request.open("POST", "/ready");
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            if (request.status == 200) {
                document.getElementById("file_status").innerHTML = "Upload successful!";
            } else if (request.status == 404) {
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
