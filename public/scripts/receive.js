var socket = io.connect();

socket.on("id", function(id) {
  document.getElementById("identifier").innerHTML = id;
});

socket.on("file", function(name, url) {
  var li = document.createElement("li");
  li.innerHTML = name + " " + "<a href=\"" + url + "\" target=\"_blank\" download>Download</a>";
  document.getElementById("files").appendChild(li);
});

//Animated ellipsis
var dots = 0;
var animated = document.getElementById("animated");
var ellipsis = "";

setInterval(function() {
  ellipsis = "";

  for(var i = 0; i < dots; i++) {
    ellipsis+=".";
  }

  animated.innerHTML = "Waiting for files" + ellipsis;

  dots++;
  dots%=4;
}, 500);
