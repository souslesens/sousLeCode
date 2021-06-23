let acorn = require("acorn");
var fs = require('fs')
var util = require('./util.')
var path = require('path')


var JsCodeParser = {


    /**
     *
     *
     * @param filePath
     * @param options
     * @param callback
     * @returns {*}
     */
    parseCodeFile: function (filePath, options, callback) {


        var functions = {}
        var currentDeclaredFn


        var recurse = function (parent, parentFn, rootObject, level) {
            if (Array.isArray(parent)) {
                parent.forEach(function (child) {
                    if (child.type && child.type == "VariableDeclarator") {
                        var object = child.id.name

                        if (object != "self") {
                            if (rootObject == "")
                                rootObject = object;
                            else
                                rootObject += "." + object
                        } else
                            var x = 3
                    }
                    recurse(child, fnName || parentFn, rootObject, level++);
                })

            } else {

                var fnName = null;


                for (var key in parent) {
                    if (typeof parent[key] == "object") {

                        if (key == "right" && parent.right.type == "FunctionExpression") {
                            if (parent.left.property) {

                                fnName = rootObject + "." + parent.left.property.name
                                var paramNames = []
                                var params = parent.right.params
                                if (params) {
                                    params.forEach(function (item) {
                                        paramNames.push(name)
                                    })
                                }
                                if (!functions[fnName])
                                    functions[fnName] = {
                                        start: parent.start,
                                        end: parent.end,
                                        params: paramNames,
                                        targetFns: []
                                    };

                                currentDeclaredFn = fnName

                            }
                        }
                        if (key == "callee") {

                            if (parent.callee.type == "MemberExpression") {
                                var x = parent[key]
                                //   var fnName = parent[key].property.name
                                var objectName = parent[key]["object"].name
                                if (objectName) {// only take objects functions


                                    var fnName = parent[key]["object"].name + "." + parent[key].property.name
                                    if (functions[currentDeclaredFn])
                                        functions[currentDeclaredFn].targetFns.push({
                                            start: parent.start,
                                            end: parent.end,
                                            name: fnName
                                        });

                                }
                            }
                        }
                        //    console.log(key)
                        recurse(parent[key], fnName || parentFn, rootObject, level++)
                    }
                }

            }

        }
        var codeStr = "" + fs.readFileSync(filePath)
        try {
            var comments=[]
            var code = acorn.parse(codeStr, {
                ecmaVersion: 2020,
                ranges: true,
                onComment: comments,
            })
            recurse(code.body[0], "root", "", 0)
        } catch (e) {
            console.log(filePath) + e.toString()
        }

        return callback(null, functions)


        /*  setTimeout(function () {
              return callback(null, functions)
          }, 2000)*/
    }


    , parseCodeDir: function (rootDir, options, callback) {
        var functionsMap = {}

        util.getFilesInDirRecursively(rootDir, null, function (err, dirs) {
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
                        dir.forEach(function (file) {
                            JsCodeParser.parseCodeFile(file.parent + file.name, null, function (err, result) {

                                for (var fn in result) {
                                    if (!functionsMap[fn])
                                        functionsMap[fn] = {dir: key, file: file.name, data: result[fn]}

                                }


                                //   console.log(JSON.stringify(functionsMap, null, 2))

                            })
                        })

                    }
                }
                return callback(null, functionsMap);


            }
        )


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
                var  commentFnStr=str.substring(index+comment.length+1,options.start);
                commentFnStr=commentFnStr.replace(/[\s\n\r\t]*/g,"")
                if( commentFnStr.length==0)
                    comments.push({index: array.index, content: comment})
            }else {
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
        var comments=[]
        var codeStr = "" + fs.readFileSync(filePath)
        var code = acorn.parse(codeStr, {
            ecmaVersion: 2020,
            ranges: true,
            onComment: comments,})
        var x = code
    }


}
module.exports = JsCodeParser

var filePath="D:\\webstorm\\souslesensVocables\\public\\vocables\\js\\tools\\ADL\\mappings\\ADLmappingData.js"

JsCodeParser.parseCodeFile(filePath, {})
//JsCodeParser.getCodeJson("D:\\webstorm\\souslesensVocables\\public\\vocables\\js\\tools\\ADL\\mappings\\test.js")
//JsCodeParser.getCodeStr(null, {filePath: })
//



