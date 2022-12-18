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
}
module.exports = HtmlParser
var dir = "D:\\webstorm\\souslesensVocables\\public\\vocables\\snippets\\lineage"
HtmlParser.parseHtmlDir(dir, function (err, result) {
    HtmlParser.htmlMapToCsv(result)

})