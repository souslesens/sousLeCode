var fs = require('fs')
var path = require('path')
var async = require('async')



var FilesManager = {
    getFilePath: function (fileName) {
        var filePath = path.join(__dirname, "../data/" + fileName)
        return path.resolve(filePath)
    },


    saveFile: function (source, jsonStr, callback) {

        var filePath = FilesManager.getFilePath(source);
        fs.writeFile(filePath, jsonStr, null, function (err, result) {
            callback(err)
        })
    },
    getFileContent: function (source, callback) {

        var filePath = FilesManager.getFilePath(source);
        if (!fs.existsSync(filePath))
            return callback(null, null)
        fs.readFile(filePath, function (err, result) {
            if(filePath.indexOf(".json")>-1) {
                try {
                    var json = JSON.parse(result)

                    callback(err, json)
                } catch (e) {
                    callback(e);
                }
            }else{
                return callback(null,""+result);
            }


        })
    },




}


module.exports = FilesManager;
