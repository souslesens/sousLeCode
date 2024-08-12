let acorn = require("acorn");
var fs = require('fs')
var util = require('./util.')
var path = require('path')
var async = require('async')


var JsCodeParser = {


    /**
     *
     *
     * @param filePath
     * @param options
     * @param callback
     * @returns {*}
     */
    getFunctionDeclarations: function (filePath, options, callback) {


        var functions = {}
        var currentDeclaredFn


        var processExpression = function (expression, rootObject) {


            var range = [expression.start, expression.end]
            var objectName = expression.left.object.name;
            if (objectName == "self")
                objectName = rootObject

            var fnName = expression.left.property.name;

            var right = expression.right

            var paramNames = []

            var params = right.params
            if (params) {
                params.forEach(function (item) {
                    paramNames.push(item.name)
                })
            }
            fnName = objectName + "." + fnName

            if (!functions[fnName])
                functions[fnName] = {
                    range: range,
                    params: paramNames,
                    rootObject: rootObject,
                    calledFns: []
                };

            /*   if (right.body && right.body.body) {
                   right.body.body.forEach(function (bodyElt) {
                       if(!bodyElt.expression || bodyElt.expression["callee"])
                           return;
                       var callee = bodyElt.expression["callee"]
                       if (callee && callee.type == "MemberExpression") {
                           var calleeObject = callee.object.name;
                           if (objectName == "self")
                               objectName = rootObject
                           var calleeFnName = callee.property.name;

                           calleeFnName = calleeObject + "." + calleeFnName


                           if (!functions[fnName]) {
                               if (functions[fnName].targetFns.indexOf(calleeFnName) < 0) {
                                   functions[fnName].targetFns.push(
                                       calleeFnName
                                   );

                               }
                           }
                       }
                   })
               }*/


            //    console.log(key)


        }


        var recurse = function (parent, parentFn, rootObject, level) {

            if (Array.isArray(parent)) {
                parent.forEach(function (child) {

                    if (child["type"] && child["type"] == "VariableDeclarator")
                        rootObject = child.id.name
                 //   var level2 = level++
                    recurse(child, null, rootObject, level+1);
                })
            } else {
                for (var key in parent) {


                    var child = parent[key]

                    if (Array.isArray(child))
                        recurse(child, null, rootObject, level++)
                    else if ((typeof child == "object")) {
                        for (var key2 in child) {
                            var type = typeof child[key2]
                            if (type === "object") {
                                if (key2 == "expression" || key == "expression") {
                                    if (child.left && child.right && child.left.object && child.right.type == "FunctionExpression")
                                        processExpression(child, rootObject)
                                }
                            }
                        }
                        recurse(child, null, rootObject, level+1)

                    } else {
                        var x = child
                    }

                }
            }
        }


        var codeStr = "" + fs.readFileSync(filePath)
        if (filePath.indexOf("common") > -1)
            var x = 3
        try {
            var comments = []
            var code = acorn.parse(codeStr, {
                ecmaVersion: 2020,
                onComment: comments,
                sourceType :"module"
            })
            var selfVar=null;
            code.body.forEach(function(item){
                if(item.type=="VariableDeclaration"){
                    selfVar=item
                }
            })
            if(!selfVar){
                console.log( "no variable declaration found")
                return callback()
            }

            recurse(selfVar, "root", "", 0)
        } catch (e) {
            console.log(filePath) + e.toString()
        }

        //   console.log(JSON.stringify(Object.keys(functions), null, 2))

        return callback(null, functions)


        /*  setTimeout(function () {
              return callback(null, functions)
          }, 2000)*/
    }


    , parseCodeDir: function (rootDir, options, callback) {
        var functionsMap = {}

        util.getFilesInDirRecursively(rootDir, options, function (err, dirs) {
                if (!options) {
                    options = {}
                }

                var count = Object.keys(dirs)
                var i = 0;

                for (var key in dirs) {


                    var dirOk = true
                    if (options.excludeDirs) {
                        options.excludeDirs.forEach(function (item) {
                            if (key.indexOf(item) > 0)
                                dirOk = false
                        })

                    }

                    if (dirOk) {

                        var dir = dirs[key]
                        console.log(key);
                        dir.forEach(function (file) {

                            if (options.file && file.name.indexOf(options.file) < 0)
                                return;
                            JsCodeParser.getFunctionDeclarations(file.parent + file.name, null, function (err, result) {

                                for (var fn in result) {
                                    if (!functionsMap[fn])
                                        functionsMap[fn] = {dir: key, file: file.name, data: result[fn]}

                                }


                                //   console.log(JSON.stringify(functionsMap, null, 2))

                            })
                        })

                    }
                }
                JsCodeParser.setFunctionCalls(functionsMap, function (err, result) {
                    if (callback)
                        return callback(null, result);
                })


            }
        )


    },
    setFunctionCalls: function (functionsMap, callback) {
        var fnNames = Object.keys(functionsMap)
        var currentFilePath = ""
        var fileCodeStr = ""
        async.eachSeries(fnNames, function (fnName, callbackEach) {


            var fn = functionsMap[fnName]
            var filePath = fn.dir + fn.file;

            if (currentFilePath != filePath) {
                fileCodeStr = "" + fs.readFileSync(filePath)
                currentFilePath = filePath
            }
            var range = fn.data.range


            var fnCodeStr = fileCodeStr.substring(range[0], range[1])

            fnCodeStr = fnCodeStr.replace(/self/g, fn.data.rootObject)
            //  var length = range[1] - range[0]
            //  console.log(fnName+"  "+length+"   "+range[1]+"  "+ range[0])
            var regex = /\$\(["']#([^"^'.]*)["']/g

            var DOMids = [];
            var array = []
            while ((array = regex.exec(fnCodeStr)) != null) {
                if (array && array.length > 0) {
                    DOMids.push(array[1])
                }
            }

            functionsMap[fnName].data.DOMids = DOMids;

            for (var fnName2 in functionsMap) {
                if (fnName2 == "ADLmappings.clearMappings")
                    var x = 3;
                if (fnName2 != fnName) {
                    if (fnCodeStr.indexOf(fnName2) > -1) {
                        if (functionsMap[fnName].data.calledFns.indexOf(fnName2) < 0)
                            functionsMap[fnName].data.calledFns.push(fnName2)
                    } else if (true) {
                        var p = fnName2.indexOf(".")
                        if (p > 0) {
                            var fnNameSelf = "self" + fnName2.substring(p)
                            if (fnCodeStr.indexOf(fnNameSelf) > -1) {
                                // console.log(fnNameSelf)
                                if (functionsMap[fnName].data.calledFns.indexOf(fnName2) < 0)
                                    functionsMap[fnName].data.calledFns.push(fnName2)
                            }
                        }
                    }
                }

            }
            // fs.close(fd);
            callbackEach()

        }, function (err) {
            callback(null, functionsMap);
        })


    },
    getCodeStr: function (data, options, callback) {
        if (!options)
            options = {}
        var sep = path.sep
        var filePath
        if (options.filePath)
            filePath = options.filePath
        else {
            filePath = data.dir + data.file;
            filePath = filePath.replace("" + sep + sep, sep)
        }
        if (!fs.existsSync(filePath))
            return callback("file not exists " + filePath)
        var str = "" + fs.readFileSync(filePath)


        //extract commments
        var comments = []
        var regex = /\/\*\*\s*\n([^\*]|\*[^\/])*\*\//g
        var array
        while ((array = regex.exec(str)) != null) {

            var comment = array[0]
            var index = array.index

            if (options.start) {
                var commentFnStr = str.substring(index + comment.length + 1, options.start);
                commentFnStr = commentFnStr.replace(/[\s\n\r\t]*/g, "")
                if (commentFnStr.length == 0)
                    comments.push({index: array.index, content: comment})
            } else {
                comments.push({index: array.index, content: comment})
            }


        }


        if (options.end)
            str = str.substring(0, options.end)


        if (options.start)
            str = str.substring(options.start)


        var hljs = require('highlight.js');


        var html = hljs.highlight(str, {language: 'js'}).value
        html = html.replace(/\n/g, "<br>")
        return callback(null, {html: html, content: str, comments: comments})
    }
    ,
    getCodeJson: function (filePath) {
        var comments = []
        var codeStr = "" + fs.readFileSync(filePath)
        try {
            var code = acorn.parse(codeStr, {
                ecmaVersion: 2020,
                onComment: comments,
               sourceType: "module"
            })
        }
        catch(e){
            console.log("error " +e)
        }
        var x = code
    }, functionsMapToCsv: function (functionsMap) {
        var str = "dir\tfile\tfunction\tparams\tcalledFunction\tDOMids\n"
        for (var fn in functionsMap) {
            var fnObj = functionsMap[fn]
            var dir = fnObj.dir.replace("D:\\webstorm\\souslesensVocables\\public\\vocables\\", "")
            var calledFns = fnObj.data.calledFns
            str += dir + "\t" + fnObj.file + "\t" + fn + "\t" + "\n"
            var params = ""
            fnObj.data.params.forEach(function (param, index) {
                if (index > 0)
                    params += "|"
                params += param
            })
            var DOMids = ""
            fnObj.data.DOMids.forEach(function (id, index) {
                if (index > 0)
                    DOMids += "|"
                DOMids += id
            })
            if (calledFns) {
                calledFns.forEach(function (item) {
                    str += dir + "\t" + fnObj.file + "\t" + fn + "\t" + params + "\t" + item + "\t" + DOMids + "\n"


                })
            }


        }
        str = str.replace(/undefined/g, "")

        fs.writeFileSync("D:\\webstorm\\sousLeCode\\public\\functions.txt", str)


    },


    getImportAndExports: function (functionsMap) {

        function getRelativeImportPath(file, importFile) {

            var fileArray = file.split(path.sep)
            var importFileArray = importFile.split(path.sep)

            var fileLevels = fileArray.length;
            var importFileLevels = importFileArray.length;

var str=""


            if (importFileLevels == fileLevels)
                str=  path.relative(file,importFile);


            else if (importFileLevels < fileLevels) {
                 str=  path.relative(file,importFile);

            }

            else if (importFileLevels > fileLevels) {
                str=  path.relative(file,importFile);
            }


            str=  str.replaceAll(path.sep, "/")
            str=str.replace("../","./")
             return str;

          /*  var fileArray = file.split(path.sep)
            var importFileArray = importFile.split(path.sep)

            var fileLevels = fileArray.length;
            var importFileLevels = importFileArray.length;


            var importFile2 = importFileArray[importFileArray.length - 1]
            if (importFileLevels == fileLevels)
                return "./" + importFile2


            else if (importFileLevels < fileLevels) {
                var str = ""

                for (var i = 0; i < fileLevels ; i++) {
                   var k=-1
                    if(importFileArray[i]!=fileArray[i]){
                        k=i
                    }
                }




                for (var i = 0; i < (fileLevels - importFileLevels); i++) {
                    str += "../"
                }
                return str + importFile2
            }

                else if (importFileLevels > fileLevels) {
                var fileDir = file.replace(fileArray[fileArray.length - 1], "");
                importFile2 = importFile.replace(fileDir, "")

                return "./" + importFile2.replaceAll(path.sep, "/")

            }*/


        }


        var str = "";
        var jsFiles = {}
        for (var key in functionsMap) {
            var fn = functionsMap[key]
            var filePath = fn.dir + fn.file
            if (!jsFiles[filePath])
                jsFiles[filePath] = {imports: [], exports: []}

            var exportFn = key.split(".")[0]
            if (jsFiles[filePath].exports.indexOf(exportFn) < 0)
                jsFiles[filePath].exports.push(exportFn)

            var importDirs = {}

            if(filePath.indexOf("KGcreator.js")>-1)
                var x=3

            fn.data.calledFns.forEach(function (calledFn) {

                var exportFn = calledFn.split(".")[0];
                if (!exportFn)
                    return;
                var calledFile = functionsMap[calledFn].dir + functionsMap[calledFn].file


                if (calledFile == filePath)
                    return;

                var relativeCalleDirPath = getRelativeImportPath(filePath, calledFile)

                var importStr = "import " + exportFn + " from \"" + relativeCalleDirPath +"\""
                if (jsFiles[filePath].imports.indexOf(importStr) < 0) {
                    jsFiles[filePath].imports.push(importStr)
                }


            })

        }
        return jsFiles
//console.log(JSON.stringify(jsFiles,null,2))
    },


    writeImportAndExports : function (jsFiles) {

        for(var filePath in jsFiles){
            var scriptStr=""+fs.readFileSync(filePath)
           var importsStr=""
            jsFiles[filePath].imports.forEach(function(importStr){
                importsStr+=importStr+"\n"
            })
            var exportsStr=""
            jsFiles[filePath].exports.forEach(function(exportStr,index){
                if(index>0)
                    return;
                exportsStr+="export default "+exportStr+"\n"
            })
           var  str=importsStr+"\n\n\n"+scriptStr+"\n\n\n"+  exportsStr

            var outpuFilePath=filePath.replace(path.sep+"js",path.sep+"modules")

            var dir=path.dirname(outpuFilePath)

            try {
                fs.mkdirSync(dir, { recursive: true })
            } catch (error) {
                var x=error
            };

            fs.writeFileSync(outpuFilePath,str)

        }


        console.log("done")
    }


}

module.exports = JsCodeParser


//var filePath = "D:\\webstorm\\souslesensVocables\\public\\vocables\\js\\tools\\ADL\\mappings\\ADLmappingData.js"
//var filePath = "D:\\webstorm\\souslesensVocables\\public\\vocables\\js\\tools\\ADL\\mappings\\test.js"
//JsCodeParser.getFunctionDeclarations(filePath, {})
//JsCodeParser.getFunctionDeclarations(filePath)
//JsCodeParser.getCodeJson(filePath)
//


var dirPath = "D:\\projects\\souslesensVocables\\public\\vocables\\modules\\"


if (false) {
    JsCodeParser.parseCodeDir(dirPath, {
        excludeDirs: [
            "external", "deleted","html"

        ]
    }, function (err, functionsMap) {
        var jsFiles = JsCodeParser.getImportAndExports(functionsMap)
       // JsCodeParser.writeImportAndExports(jsFiles)
        //  JsCodeParser.functionsMapToCsv(functionsMap)

    })
}



