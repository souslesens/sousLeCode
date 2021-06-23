var express = require('express');
var router = express.Router();

var JsCodeParser=require("../bin/jsCodeParser")
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post("/server", function (req, response) {
//  console.log(JSON.stringify(req.body,null,2))

if (req.body.parseDirCode) {

  JsCodeParser.parseCodeDir(req.body.rootDir,JSON.parse(req.body.options),function(err, result){
    processResponse(response,err,result)
  })
}
  if (req.body.getCode) {

    JsCodeParser.getCodeStr(JSON.parse(req.body.data),JSON.parse(req.body.options),function(err, result){
      processResponse(response,err,result)
    })
  }


})

function processResponse(response, error, result) {
  if (response && !response.finished) {
    /*   res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
        res.setHeader('Access-Control-Allow-Credentials', true); // If needed.setHeader('Content-Type', 'application/json');*/

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    response.setHeader('Access-Control-Allow-Credentials', true); // If needed*/


    if (error) {

      if (typeof error == "object") {
        if (error.message)
          error = error.message
        else
          error = JSON.stringify(error, null, 2);
      }
      console.log("ERROR !!" + error);
      //   socket.message("ERROR !!" + error);
      return response.status(404).send({ERROR: error});

    } else if (!result) {
      return response.send({done: true});
    } else {

      if (typeof result == "string") {
        resultObj = {result: result};
        //  socket.message(resultObj);
        response.send(JSON.stringify(resultObj));
      } else {
        if (result.contentType && result.data) {
          response.setHeader('Content-type', result.contentType);
          if (typeof result.data == "object")
            response.send(JSON.stringify(result.data));
          else
            response.send(result.data);
        } else {
          var resultObj = result;
          response.setHeader('Content-type', "application/json");
          // response.send(JSON.stringify(resultObj));
          response.send(resultObj);
        }
      }
    }


  }
}

  module.exports = router;





