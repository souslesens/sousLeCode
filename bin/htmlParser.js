var fs = require('fs')
var path = require('path')
var util2 = require('./util.')
const acorn = require("acorn");


var HtmlParser = {
    iconsMap: {
        "arrow-icon": "../../icons/KGATheme/caret-right-KGA.png",
        "search-icon": "../../icons/KGATheme/SearchIcon-KGA.png",
        "add-icon": "../../icons/CommonIcons/add-icon.png",
        "moreOptions-icon": "../../icons/KGATheme/MoreOptionsIcon-KGA.png",
        "lineage-logo": "../../icons/KGATheme/lineageLogo-KGA.png",
        "KGquery-logo": "../../icons/KGATheme/Kgquery-KGA.png",
        "KGcreator-logo": "../../icons/KGATheme/Kgcreator-KGA.png",
        "SPARQL-logo": "../../icons/KGATheme/SPARQL-KGA.png",
        "admin-logo": "../../icons/KGATheme/Admin-KGA.png",
        "ConfigEditor-logo": "../../icons/KGATheme/ConfigEditor-KGA.png",
        "GraphManagement-logo": "../../icons/KGATheme/GraphManagement-KGA.png",
        "OntoCreator-logo": "../../icons/KGATheme/OntoCreator-KGA.png",
        "TimeLine-logo": "../../icons/KGATheme/TimeLine-KGA.png",
        "logoInstance-icon": "../../icons/KGATheme/KGALogo.png",
        "slsvLogo-icon": "../../icons/CommonIcons/slsvLogo.png",
        "saveIcon": "../../icons/KGATheme/SaveIcon-KGA.png",
        "deleteIcon": "../../icons/KGATheme/DeleteIcon-KGA.png",
        "filterIcon": "../../icons/CommonIcons/Filtre.png",
        "allPropertyIcon": "../../icons/BluishVioletTheme/SelectionAllIcon-bluishViolet.png",
        "currentPropertyIcon": "../../icons/BluishVioletTheme/SelectionIcon-bluishViolet.png",
        "jqueryClose": "../../icons/KGATheme/CrossIcon-KGA.png",
        "resetIcon": "../../icons/KGATheme/ResetIcon-KGA.png",
        "previousIcon": "../../icons/KGATheme/PreviousIcon-KGA.png",
        "isDarkTheme": false,
        "whiteBoardIcon": "../../icons/CommonIcons/WhiteboardIcon.png",
        "propertiesIcon": "../../icons/CommonIcons/propertiesIcon.png",
        "containersIcon": "../../icons/CommonIcons/ContainerIcon.png",
        "classesIcon": "../../icons/CommonIcons/classesIcon.png"
    },

    parseHtmlDir: function (rootDir, callback) {


        var map = {}

        var allButtons = []
        var allIcons = []
        var allClassIcons = []
        var allSelects = []
        var allInputs = []
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

                        var module=dirName.replace(rootDir,"").replace(/\\/g,"/")
                        if(module=="")
                            module="root"

                        // bouttons avec  icons fixes
                        var imgElements = root.getElementsByTagName("IMG")
                        imgElements.forEach(function (element) {

                            var srcValue = element.getAttribute("src")
                            //   console.log(srcValue)
                            if (srcValue && srcValue.indexOf("icon") > -1) {
                                var buttonElement = element.parentNode

                                var attributes = buttonElement.attributes


                                for (var key in attributes) {
                                    if (!actionsMap[file.name + "_" + attributes[key]]) {
                                        actionsMap[file.name + "_" + attributes[key]] = 1
                                        if (key.indexOf("on") == 0) {
                                            allButtons.push({
                                                file: file.name,
                                                dir: module,
                                                type: "commonIconButton",
                                                icon: srcValue,
                                                innerHTML: buttonElement.innerHTML.replace(/[\r\t\n]/g, ""),
                                                action: attributes[key]

                                            })

                                        }
                                        //  console.log(element.innerHTML + "  " + key + "  " + attributes[key])
                                    }

                                }
                            }


                        })


                        var buttonElements = root.getElementsByTagName("BUTTON")


                        // bouttons sans icons fixes correspondant à une classe css
                        buttonElements.forEach(function (buttonElement) {


                            var attributes = buttonElement.attributes

                            if (!actionsMap[file.name + "_" + attributes[key]]) {
                                actionsMap[file.name + "_" + attributes[key]] = 1
                                for (var key in attributes) {
                                    if (key.indexOf("class") == 0) {
                                        var classes = attributes[key]
                                        for (var cssClass in HtmlParser.iconsMap) {
                                            if (classes.indexOf(cssClass) > -1) {
                                                allButtons.push({
                                                    file: file.name,
                                                    dir: module,
                                                    type: "iconButton",
                                                    icon: cssClass,
                                                    innerHTML: buttonElement.innerHTML.replace(/[\r\t\n]/g, ""),
                                                    action: attributes["onclick"] || attributes["onchange"]

                                                })

                                            }
                                        }
                                    }
                                }
                            }
                        })


                        //bouttons standard sans icons
                        var buttonElements = root.getElementsByTagName("BUTTON")

                        buttonElements.forEach(function (buttonElement) {


                            var attributes = buttonElement.attributes


                            for (var key in attributes) {
                                if (key.indexOf("on") == 0) {

                                    if (!actionsMap[file.name + "_" + attributes[key]]) {
                                        actionsMap[file.name + "_" + attributes[key]] = 1
                                        allButtons.push({
                                            file: file.name,
                                            dir: module,
                                            type: "simpleButton",
                                            icon: "none",
                                            innerHTML: buttonElement.innerHTML.replace(/[\r\t\n]/g, ""),
                                            action: attributes[key]

                                        })
                                    }
                                }
                            }
                        })


                        var buttonElements = root.getElementsByTagName("SELECT")


                        // select avec ou sans actions
                        buttonElements.forEach(function (buttonElement) {


                            var attributes = buttonElement.attributes


                            for (var key in attributes) {
                                var action = ""
                                var actionType = ""
                                if (key.indexOf("on") == 0) {
                                    action = attributes[key]
                                    actionType = key
                                }


                                allSelects.push({
                                    file: file.name,
                                    dir: module,
                                    type: "select",
                                    icon: attributes["id"] || "",
                                    innerHTML: buttonElement.innerHTML.replace(/[\r\t\n]/g, ""),
                                    action: action,
                                    actionType: actionType

                                })

                            }
                        })

                        var inputElements = root.getElementsByTagName("INPUT")


                        // select avec ou sans actions
                        inputElements.forEach(function (buttonElement) {


                            var attributes = buttonElement.attributes


                            for (var key in attributes) {
                                var action = ""
                                var actionType = ""
                                if (key.indexOf("on") == 0) {
                                    action = attributes[key]
                                    actionType = key
                                }

                                allInputs.push({
                                    file: file.name,
                                    dir: module,
                                    type: "input",
                                    icon: attributes["id"] || "",
                                    innerHTML: buttonElement.innerHTML.replace(/[\r\t\n]/g, ""),
                                    action: action,
                                    actionType: actionType

                                })

                            }
                        })


                    })

                }

            }
        })


        HtmlParser.writeArray(allButtons, "slsbuttons")

        HtmlParser.writeArray(allSelects, "slsSelects")
        HtmlParser.writeArray(allInputs, "slsInputs")


    },
    writeArray: function (array, fileName) {
        var str = "file;dir;type;icon;action;innerHtml;actionType\n"
        array.forEach(function (item) {
            str += item.file + ";" + item.dir + ";" + item.type + ";" + item.icon + ";" + item.action + ";" + item.innerHTML + "\r"
        })
        fs.writeFileSync("C:\\Users\\claud\\Downloads\\" + fileName + ".csv", str)
        var x = str

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