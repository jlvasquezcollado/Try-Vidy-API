const path = require('path');
const http = require('http');
let shortid = require('shortid');
const express = require('express');
const publicPath = path.join(__dirname, '../public');
const socketIO = require('socket.io');
const clone = require('./utils/clone');
const url = require('url');

const port = process.env.PORT || 3000;
var app = express();

app.use(function(req, res, next) {
  var unique = shortid.generate()
  console.log(req.query.url);
  var url_arg = decodeURIComponent(req.query.url);
  console.log(url_arg);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Access-Control-Allow-Origin ,Origin,Accept, X-Requested-With, Content-Type, Access-Control-Allow-Methods, Access-Control-Request-Headers")
  if ('OPTIONS' === req.method) {
    res.status(200).send("ok");
  }
  else{
    next();
  }
});

app.get('/', (req,res) => {
  var unique = shortid.generate()
  var url_arg = decodeURIComponent(req.query.url);
  console.log(url_arg);
  clone.clone(url_arg, unique,res);
  res.send(`https://s3-us-west-1.amazonaws.com/vidystaticdemos/${unique}/index.html`);
  });

app.listen(port, () => {
  console.log(`server is up on ${port}!`);
})

//
