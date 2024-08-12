var fs = require('fs')
var path = require('path')
var util = require('./util.')
const acorn = require("acorn");

var HtmlParser = {


    parseHtmlDir: function (filePath, callback) {


        var map = {}


        var recurse = function (filePath, rootObject, level) {

            if (fs.lstatSync(filePath).isDirectory()) {
                var files = fs.readdirSync(filePath)
                files.forEach(function (file) {
                    recurse(filePath + path.sep + file)
                })
            } else {
                var html = "" + fs.readFileSync(filePath)
                var regexExport = /export default (.*)[\n\r ]/
                var array  = regexExport.exec(html)
                    if (array && array.length== 2) {
                        var classId=array[1]
                        html+="\nwindow."+classId+"="+classId+";"
                        fs.writeFileSync(filePath,html)
                        return;
                    }

                return;






                var regexId = /id=['"]([^'^".]*)['"]/g
                var DOMids = []
                var array = []
                while ((array = regexId.exec(html)) != null) {
                    if (array && array.length > 0) {
                        DOMids.push(array[1])
                    }
                }


                var regexFn = /on[clickchange]*=[ "']([^"^'.]*.[^"^'^\(.]*)[^>.]*>([^<.]*)/g
                var actions = []
                var array = []
                while ((array = regexFn.exec(html)) != null) {
                    if (array && array.length > 0) {
                        actions.push({function:array[1].trim(),label:array[2].trim()})
                    }
                }


            }

            map[filePath] = {DOMids: DOMids, actions: actions}


        }

        recurse(filePath, "root", "", 0)

        return callback(null, map)

    }
    , htmlMapToCsv: function (htmlMap) {
        var strIds = "DOMids\tpage\tlevel2\tlevel3\tlevel4\n"
        var strFns = "label\tfunction\tpage\tfeature\n"

        for (var html in htmlMap) {
            var htmlObj = htmlMap[html]

            var page = html.replace("D:\\webstorm\\souslesensVocables\\public\\vocables\\snippets\\", "")
            var pageArray = page.split(path.sep)
         /*   pageArray = pageArray.reverse()
            var pageStr = ""
            for (var i = 0; i < 4; i++) {
                var strx = ""
                if (pageArray.length > i)
                    strx = pageArray[i];
                else
                    strx = "level" + (i + 1);
                if (i > 0)
                    pageStr += "\t"
                pageStr += strx
            }*/
            var pageStr=pageArray[1]+"\t"+pageArray[0]


            var functions = ""
            if (htmlObj.actions) {
                htmlObj.actions.forEach(function (action, index) {
                    if (action.function.indexOf("$") < 0)
                        strFns +=  action.label + "\t"+action.function + "\t" + pageStr + "\n"
                })
            }
            var DOMids = ""
            if (htmlObj.DOMids) {

                htmlObj.DOMids.forEach(function (id, index) {
                    strIds += id + "\t" + pageStr + "\n"
                })

            }


        }
        strIds = strIds.replace(/undefined/g, "")
        strFns = strFns.replace(/undefined/g, "")

        fs.writeFileSync("D:\\sousLeSens\\code\\htmlIds.txt", strIds)
        fs.writeFileSync("D:\\sousLeSens\\code\\actions.txt", strFns)


    }
    , extractEvents:function(filePath){
        var str=""+fs.readFileSync(filePath)
        var regex=/on(click|change)=["']([^"]+)"/gmi
var str2=""+str
        var array=[]
        var map= {}
        map= {}
        while((array=regex.exec(str))!=null){
 var id=HtmlParser.getRandomHexaId(5)
            str2=str2.replace(array[0],"data-eventId='"+id+"'")
            map[id]={file:filePath,event:array[1],fn:array[2]}
        }


        var x=str2;
        var y =map


    },
   getRandomHexaId: function (length) {
        const str = Math.floor(Math.random() * Math.pow(16, length)).toString(16);
        return "0".repeat(length - str.length) + str;
    }
}
module.exports = HtmlParser

if( true) {
    var dir = "D:\\webstorm\\souslesensVocables\\public\\vocables\\modules"
    HtmlParser.parseHtmlDir(dir, function (err, result) {
     //   HtmlParser.htmlMapToCsv(result)

    })
}
if( false){
    var file = "D:\\webstorm\\souslesensVocables\\public\\vocables\\modules\\lineage\\lineageLeftPanel.html"
    HtmlParser.extractEvents(file, function (err, result) {
    })

}