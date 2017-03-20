var socket = io.connect();

socket.on("id", function(id) {
  document.getElementById("identifier").innerHTML = id;
});

socket.on("file", function(name, url) {
  var li = document.createElement("li");
  li.innerHTML = name + " " + "<a href=" + url + ">Download</a>";
  document.getElementById("files").appendChild(li);
});
