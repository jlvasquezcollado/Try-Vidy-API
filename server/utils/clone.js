let fs = require('fs')
let cmd = require('node-cmd')
let shortid = require('shortid')
let scrape = require('website-scraper')
var ncp = require('copy-paste')
const AWS = require('aws-sdk');
const path = require('path');
const mime = require('mime');
const rimraf = require('rimraf');
const async1 = require('async');


var clone = (url, unique_id,res) => {
let unique = unique_id;

  let outputDirectory = '/tmp/' + unique

  console.warn('- Scraping:', url)

  function upload(s3Path, bucketName){

      AWS.config.update( {accessKeyId: process.env['S3_KEY'], secretAccessKey: process.env['S3_SECRET'] });
      let s3 = new AWS.S3();
      function walkSync(currentDirPath, callback) {
          fs.readdirSync(currentDirPath).forEach(function (name) {
              var filePath = path.join(currentDirPath, name);
              var stat = fs.statSync(filePath);
              if (stat.isFile()) {
                  let temp = callback(filePath, stat);
              } else if (stat.isDirectory()) {
                  walkSync(filePath, callback);
              }
          });
      } //end of walkSync FUNCTION DEFINTION

       walkSync(s3Path, function(filePath, stat) {
          let bucketPath = filePath.substring(s3Path.length + 1);
          let params = {Bucket: bucketName, Key: bucketPath, Body: fs.readFileSync(filePath), ACL:'public-read', ContentType: mime.getType(filePath)};

              s3.putObject(params, function(err, data) {
                  if (err) {
                      console.log(err)
                  } else {
                      console.log('Successfully uploaded '+ bucketPath +' to ' + bucketName);
                  }
              });
      }); // end of walkSync CALL
    }; // end of upload definition

  new Promise((resolve, reject) => {
    scrape({ urls: [ url ], directory: outputDirectory }).then((result)=>{
     console.warn("done scraping");
     fs.readFile('/app/server/utils/install-vidy.txt', 'utf8', (err, installScript)=>{
     console.warn('- Installing Vidy')
     fs.readFile(outputDirectory + '/index.html', 'utf8', (err,data)=>{
       if (err) return console.log(err)
       let result = data.replace('</body>', `${installScript}</body>`)
       fs.writeFile(outputDirectory + '/index.html', result, 'utf8', (err)=>{
         if (err) return console.log(err)
         console.log("finshed installing vidy");
          upload(outputDirectory, `vidystaticdemos/${unique}`);
          setTimeout(()=>{
            resolve();
          },10000);
       })//writeFIle
    }) //readFile
  }) // readFile
 }).catch((err)=>{
   console.warn('- Error scraping page', err)
   })
 }).then(() => {
   setTimeout(()=>{
       rimraf(`/tmp/${unique}`, (err) => { console.log(err); });
       console.log("removed temp stuff");
     },50000*10);
 });
}
module.exports = {
  clone,
}
