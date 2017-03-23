const express = require('express'),
      aws = require('aws-sdk'),
      io = require('socket.io'),
      bodyParser = require('body-parser'),
      shortid = require('shortid');
const S3_BUCKET = process.env.BUCKET;

// Variables for Express, S3 and Socket.IO
var app = express(), socket, s3 = new aws.S3({apiVersion: '2006-03-01', signatureVersion: 'v4'});

// App variables
var receiving = []; // Array of receiving

aws.config.update({region: 'us-east-1'});
app.use(express.static('public'));
app.use(bodyParser.json());

function initRoom(client) {
  var roomNumber = 1 + Math.random() * 100000 | 0, unique;

  do{
    unique = true;
    for(var i = 0; i < receiving.length; i++) {
      if(receiving[i].roomNumber == roomNumber) {
        unique = false;
        roomNumber = Math.random() * 10000 | 0;
        break;
      }
    }
  } while(!unique);

  receiving.push({
    roomNumber: roomNumber,
    ioSession: client.id,
    prospectiveFiles: []  // Array of files to delete when receiver disconnects
  });

  console.log("Receiving user connected with number " + roomNumber);

  return roomNumber;
}

function getRoomById(roomNumber) {
  for(var i = 0; i < receiving.length; i++) {
    if(receiving[i].roomNumber == roomNumber) {
      return receiving[i];
    }
  }
  return null;
}

function deleteFile(name) {
  console.log("Deleting "+name);

  s3.deleteObject({
      Bucket: S3_BUCKET,
      Key: name
  }, function(err, data) {
    if(err) {
      console.log(err);
    }
  });
}

socket = io(app.listen(process.env.PORT || 8080, function() {
  console.log("Server running at port " + this.address().port);
}));

socket.on("connection", function(client) {
  client.emit("id", initRoom(client));
  client.on("disconnect", function() {
    for(var i = 0; i < receiving.length; i++) {
      if(receiving[i].ioSession == client.id) {
        console.log("Removing " + receiving[i].roomNumber);
        for(var j = 0; j < receiving[i].prospectiveFiles.length; j++) {
          deleteFile(receiving[i].prospectiveFiles[j]);
        }
        receiving.splice(i, 1);
        break;
      }
    }
  });
});

app.get("/sign", function(req, res) {
  if(!req.query['name'] || !req.query['type'] || !req.query['room']) {
    return res.status(400).end();
  }

  if(!getRoomById(req.query['room'])) {
    return res.status(404).end();
  }

  var fileName = shortid.generate() + "_" + req.query['name'];
  var fileType = req.query['type'];

  var parameters = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 60,
    ContentType : fileType,
    ACL: "public-read"
  };

  s3.getSignedUrl("putObject", parameters, function (err, data) {
    if(err) {
      console.log(err);
      return res.status(500).end();
    }

    getRoomById(req.query['room']).prospectiveFiles.push(fileName);

    const returnData = {
      signedRequest: data,
      url: "https://" + S3_BUCKET + ".s3.amazonaws.com/" + encodeURIComponent(fileName)
    };

    res.send(returnData);
  });
});

app.get("/receive", function(req,res) {
  res.sendFile("receive.html", {root:__dirname});
});

app.get("/send", function(req,res) {
  res.sendFile("upload.html", {root:__dirname});
});
app.post("/ready", function(req,res) {

  if(!req.body.room || !req.body.file || !req.body.url) {
    return res.status(400).end();
  }

  var room = getRoomById(req.body.room);

  if(!room) {
    return res.status(404).end();
  }

  socket.to(room.ioSession).emit("file", req.body.file, req.body.url);

  res.end();
});
