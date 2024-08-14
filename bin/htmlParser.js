var fs = require('fs')
var path = require('path')
var util2 = require('./util.')
const acorn = require("acorn");


var HtmlParser = {


    parseHtmlDir: function (rootDir, callback) {


        var map = {}

        var allButtons = []
        var allIcons = []
        var allClassIcons=[]
        var allSelects=[]
        var allInputs=[]
        var actionsMap = {}
        var options = {}
        util2.getFilesInDirRecursively(rootDir, options, function (err, dirs) {
            if (!options) {
                options = {}
            }

            var count = Object.keys(dirs)
            var i = 0;

            for (var dirName in dirs) {


                var dirOk = true

                if (dirOk) {

                    var dir = dirs[dirName]
                    // console.log(dirName);
                    dir.forEach(function (file) {

                        var filePath = dirName + file.name
                        if (!filePath.endsWith("html")) {
                            return;
                        }
                      //  console.log(filePath);


                        var html = "" + fs.readFileSync(filePath)


                        var parser = require('node-html-parser');

                        const root = parser.parse(html)

                        var x = root

                        // bouttons avec  icons fixes
                        var imgElements = root.getElementsByTagName("IMG")
                        imgElements.forEach(function (element) {

                            var srcValue = element.getAttribute("src")
                         //   console.log(srcValue)
                            if (srcValue && srcValue.indexOf("icon") > -1) {
                                var buttonElement = element.parentNode


                                var attributes = buttonElement.attributes


                                for (var key in attributes) {
                                    if (key.indexOf("on") == 0) {
                                        allIcons.push({
                                            file: file.name,
                                            dir: dirName,
                                            icon: srcValue,
                                            innerHTML: buttonElement.innerHTML.replace(/[\r\t\n]/g, ""),
                                            action: attributes[key]

                                        })
                                        actionsMap[file.name + "_" + attributes[key]] = 1
                                        //  console.log(element.innerHTML + "  " + key + "  " + attributes[key])
                                    }

                                }
                            }


                        })


                        var buttonElements = root.getElementsByTagName("BUTTON")


                        // bouttons sans icons
                        buttonElements.forEach(function (buttonElement) {


                            var attributes = buttonElement.attributes


                            for (var key in attributes) {
                                if (key.indexOf("on") == 0) {

                                    if (!actionsMap[file.name + "_" + attributes[key]]) {
                                        allButtons.push({
                                            file: file.name,
                                            dir: dirName,
                                            icon: "none",
                                            innerHTML: buttonElement.innerHTML.replace(/[\r\t\n]/g, ""),
                                            action: attributes[key]

                                        })
                                    }
                                }
                            }
                        })


                        var buttonElements = root.getElementsByTagName("BUTTON")


                        // bouttons sans icons fixes correspondant à une classe css
                        buttonElements.forEach(function (buttonElement) {


                            var attributes = buttonElement.attributes


                            for (var key in attributes) {
                                if (key.indexOf("class") == 0) {
                                    allClassIcons.push({
                                        file: file.name,
                                        dir: dirName,
                                        icon: attributes[key],
                                        innerHTML: buttonElement.innerHTML.replace(/[\r\t\n]/g, ""),
                                        action: attributes["onclick"] || attributes["onchange"]

                                    })

                                }
                            }
                        })



                        var buttonElements = root.getElementsByTagName("SELECT")


                        // select avec ou sans actions
                        buttonElements.forEach(function (buttonElement) {


                            var attributes = buttonElement.attributes


                            for (var key in attributes) {
                                var action=""
                                var actionType=""
                                if (key.indexOf("on") == 0) {
                                    action=attributes[key]
                                    actionType=key
                                }


                                        allSelects.push({
                                            file: file.name,
                                            dir: dirName,
                                            icon: attributes["id"] || "",
                                            innerHTML: buttonElement.innerHTML.replace(/[\r\t\n]/g, ""),
                                            action: action,
                                            actionType:actionType

                                        })

                            }
                        })

                        var inputElements = root.getElementsByTagName("INPUT")


                        // select avec ou sans actions
                        inputElements.forEach(function (buttonElement) {


                            var attributes = buttonElement.attributes


                            for (var key in attributes) {
                                var action=""
                                var actionType=""
                                if (key.indexOf("on") == 0) {
                                    action=attributes[key]
                                    actionType=key
                                }

                                    allInputs.push({
                                        file: file.name,
                                        dir: dirName,
                                        icon: attributes["id"] || "",
                                        innerHTML: buttonElement.innerHTML.replace(/[\r\t\n]/g, ""),
                                        action: action,
                                        actionType:actionType

                                    })

                            }
                        })



                    })

                }

            }
        })




HtmlParser.writeArray(allButtons,"slsbuttons")

        HtmlParser.writeArray(allIcons,"slsIcons")
        HtmlParser.writeArray(allClassIcons,"slsClassIcons")
        HtmlParser.writeArray(allSelects,"slsSelects")
        HtmlParser.writeArray(allInputs,"slsInputs")





    },
    writeArray:function(array,fileName){
        var str="file\tdir\ticon\taction\tinnerHtml\tactionType\n"
        array.forEach(function(item){
            str+=item.file+"\t"+item.dir+"\t"+item.icon+"\t"+item.action+"\t"+item.innerHTML+"\r"
        })
        fs.writeFileSync("C:\\Users\\claud\\Downloads\\"+fileName+".csv",str)
        var x=str

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
            var pageStr = pageArray[1] + "\t" + pageArray[0]


            var functions = ""
            if (htmlObj.actions) {
                htmlObj.actions.forEach(function (action, index) {
                    if (action.function.indexOf("$") < 0) {
                        strFns += action.label + "\t" + action.function + "\t" + pageStr + "\n"
                    }
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
    , extractEvents: function (filePath) {
        var str = "" + fs.readFileSync(filePath)
        var regex = /on(click|change)=["']([^"]+)"/gmi
        var str2 = "" + str
        var array = []
        var map = {}
        map = {}
        while ((array = regex.exec(str)) != null) {
            var id = HtmlParser.getRandomHexaId(5)
            str2 = str2.replace(array[0], "data-eventId='" + id + "'")
            map[id] = {file: filePath, event: array[1], fn: array[2]}
        }


        var x = str2;
        var y = map


    },
    getRandomHexaId: function (length) {
        const str = Math.floor(Math.random() * Math.pow(16, length)).toString(16);
        return "0".repeat(length - str.length) + str;
    }
}
module.exports = HtmlParser

if (true) {
    var dir = "D:\\projects\\souslesensVocables\\public\\vocables\\"
    HtmlParser.parseHtmlDir(dir, function (err, result) {
        //   HtmlParser.htmlMapToCsv(result)

    })
}
if (false) {
    var file = "D:\\webstorm\\souslesensVocables\\public\\vocables\\modules\\lineage\\lineageLeftPanel.html"
    HtmlParser.extractEvents(file, function (err, result) {
    })

}