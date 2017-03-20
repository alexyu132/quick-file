var express = require('express');
var aws = require('aws-sdk');

const AWS_KEY = process.env.AWS_KEY,
      AWS_SECRET = process.env.AWS_SECRET,
      S3_BUCKET = process.env.BUCKET;

var app = express();

app.use(express.static('public'));

app.get("/sign", function(req, res) {
  var s3 = new aws.S3();
  var fileName = req.query.name;
  var fileType = req.query.type;
  var parameters = {
    Bucket: S3_BUCKET;
    Key: fileName,
    Expires: 60,
    ContentType = fileType,
    ACL: "public-read"
  };

  s3.getSignedUrl("putObject", parameters, function (err, data) {
    if(err) {
      console.log(err);
      return res.end();
    }

    var returnData = {
      signedRequest: data,
      url: "https://" + S3_BUCKET + ".s3.amazonaws.com/" + fileName;
    };

    res.write(JSON.stringify(returnData));
    res.end();
  });
});

app.listen(process.env.PORT || 8080, function() {
  console.log("Server running at port " + server.address().port);
});
