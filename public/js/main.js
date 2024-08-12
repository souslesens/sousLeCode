var Main = (function () {

    var self = {}

    self.propertyColors = {}
    self.rootCodeDir = "D:\\projects\\souslesensVocables\\public\\vocables\\modules\\"
    self.currentCodeMap = {}
    self.showCodeTree = function (dir) {
        var nodeData = {}
        if (!dir) {
            nodeData.dir = self.rootCodeDir
        } else
            nodeData.dir = dir
        var options = {
            excludeDirs: [
                "external",
                "graph"
            ]
        }

        self.getCode(nodeData, options, function (err, result) {
            var jsTreedata = [];
            self.currentCodeMap = result;

            var existingNodes = {}


            for (var fn in result) {
                var color = self.getObjetColor(result[fn].dir)
                var dir = result[fn].dir;

                var dirLabel
                if (dir == self.rootCodeDir)
                    dirLabel = "_"
                else
                    dirLabel = dir.replace(self.rootCodeDir, "")
                dirLabel = dirLabel.replace(/\\/g, "")
                var dirName = dirLabel.replace(/\//g,"")
                dirLabel = "<span style='color:" + color + "'>" + dirLabel + "</span>"
                var file = result[fn].file
                var range = result[fn].data.range
                var array = fn.split(".")
                var obj = array[0];
                var fnLabel = array[1];

                if (!existingNodes[dir]) {
                    existingNodes[dir] = 1
                    jsTreedata.push(
                        {
                            id: dir,
                            text: dirLabel,
                            parent: "#",
                            data: {
                                type: "dir",
                                name: dirName,
                                id: dir,
                                text: dirLabel,
                                rootCodeDir: self.rootCodeDir

                            }
                        }
                    )
                }

                if (!existingNodes[file]) {
                    existingNodes[file] = 1

                    jsTreedata.push(
                        {
                            id: file,
                            text: file,
                            parent: dir,
                            data: {
                                type: "file",
                                id: file,
                                name: dirName + "_" + file,
                                text: file,
                                file: file,
                                dir: dir,
                                rootCodeDir: self.rootCodeDir

                            }
                        }
                    )
                }
                if (!existingNodes[obj]) {
                    existingNodes[obj] = 1
                    jsTreedata.push(
                        {
                            id: obj,
                            text: obj,
                            parent: file,
                            data: {
                                type: "object",
                                id: obj,
                                name: dirName + "_" + file + "_" + obj,
                                text: obj,
                                file: file,
                                dir: dir,
                                rootCodeDir: self.rootCodeDir,
                                range: range,
                            }
                        }
                    )
                }
                if (!existingNodes[fn]) {
                    existingNodes[fn] = 1
                    jsTreedata.push(
                        {
                            id: fn,
                            text: fnLabel,
                            parent: obj,
                            data: {
                                type: "function",
                                id: fn,
                                name: dirName + "_" + file + "_" + obj + "_" + fn,
                                text: fnLabel,
                                file: file,
                                dir: dir,
                                rootCodeDir: self.rootCodeDir,
                                range: range,

                            }
                        }
                    )
                }

            }

            var options = {
                selectTreeNodeFn: Main.onTreeNodeClick,
                withCheckboxes: true,
                contextMenu: self.jsTreecontextMenuFn()

            }
            common.jstree.loadJsTree("fnTreeDiv", jsTreedata, options)
        })

    }

    self.jsTreecontextMenuFn = function () {
        var items = {}
        items.drawCalledFunctions = {
            label: "drawCalledFunctions",
            action: function (e, xx) {// pb avec source
                Main.drawFunctionsGraph(self.currentTreeNodeData)
            }
        }
        items.drawCallingFunctions = {
            label: "drawCallingFunctions",
            action: function (e, xx) {// pb avec source
                Main.drawFunctionsGraph(self.currentTreeNodeData, true)
            }
        }
        items.viewCode = {
            label: "viewCode",
            action: function (e, xx) {// pb avec source
                CodeEdition.viewCode(self.currentTreeNodeData)
            }
        }
        return items;
    }

    self.onTreeNodeClick = function (event, obj) {
        var nodeData = obj.node.data;
        self.currentTreeNodeData = nodeData
        CodeEdition.editComments()
        if (nodeData.type == "object" || nodeData.type == "function")
            visjsGraph.focusOnNode(nodeData.id)
    }


    self.getCode = function (nodeData, options, callback) {
        options.file = nodeData.file;
        options.object = nodeData.object;
        options.function = nodeData.function;

        var payload = {
            parseDirCode: true,
            rootDir: nodeData.dir,

            options: JSON.stringify(options)
        }
        $.ajax({
            type: "POST",
            url: "/server",
            data: payload,
            dataType: "json",
            success: function (result, textStatus, jqXHR) {
                return callback(null, result)
            }, error(err) {
                return callback(err);
            }
        })
    }
    self.drawAllCode = function (dir) {

        var functions = Object.keys(self.currentCodeMap)


        var visjsData = self.getCodeVisjsData(self.currentCodeMap, {functions: functions})
        var options = {
            onclickFn: Main.onGraphNodeClick,
            onRightClickFn: function (obj) {
                self.currentGraphNode = obj
                self.setGraphPopupMenus(obj, params.event);
                common.showGraphPopupMenu(point, "graphPopupDiv")
            },
            nodes: {
                size: 5,
            }
        }
        var w = $(window).width()
        var h = $(window).height()
        $("#graphDiv").width(w) - 300
        $("#graphDiv").height(h)
        visjsGraph.draw("graphDiv", visjsData, options)
    }

    self.onGraphNodeClick = function (obj, point, options) {

    }


    self.getObjetColor = function (label, palette) {
        if (!palette)
            palette = "paletteIntense"
        if (!self.propertyColors[label])
            self.propertyColors[label] = common[palette][Object.keys(self.propertyColors).length]
        return self.propertyColors[label];
    }


    self.drawFunctionsGraph = function (nodeData, drawCallingFunctions, addToGraph) {
        if (!nodeData)
            nodeData = self.currentGraphNode.data
        var functions = []
        if (nodeData.type == "function")
            functions = [nodeData.id]
        else if (nodeData.type == "object") {
            for (var key in self.currentCodeMap) {
                var objName = key.split(".")[0]
                if (objName == nodeData.id)
                    functions.push(key)

            }
        } else if (nodeData.type == "file") {
            for (var key in self.currentCodeMap) {
                if (self.currentCodeMap[key].file == nodeData.id)
                    functions.push(key)
            }
        } else if (nodeData.type == "dir") {
            for (var key in self.currentCodeMap) {
                if (self.currentCodeMap[key].dir == nodeData.id)
                    functions.push(key)
            }
        }


        var visjsData = self.getCodeVisjsData(self.currentCodeMap, {
            functions: functions,
            drawCallingFunctions: drawCallingFunctions,
            addToGraph: addToGraph
        })


        if (addToGraph) {
            visjsGraph.data.nodes.add(visjsData.nodes)
            visjsGraph.data.edges.add(visjsData.edges)

        } else {
            var options = {
                onclickFn: Main.onGraphNodeClick,
                onRightClickFn: function (obj, point, event) {
                    self.currentGraphNode = obj
                    self.setGraphPopupMenus(obj, null);
                    point.x += $("#fnTreeDiv").width()
                    common.showPopup(point, "graphPopupDiv")
                },
                nodes: {
                    size: 5,
                }
            }
            var w = $(window).width()
            var h = $(window).height()
            $("#graphDiv").width(w) - 300
            $("#graphDiv").height(h)
            visjsGraph.draw("graphDiv", visjsData, options)
        }


    }


    self.setGraphPopupMenus = function (node, event) {
        if (!node)
            return;

        var html =
            " <div onclick='common.hidePopup()'> <span  id= class=\"popupMenuItem\" onclick=\"Main.drawFunctionsGraph(null,null,true);\"> draw calledFunctions</span>" +
            "<br><span class=\"popupMenuItem\" onclick=\"Main.drawFunctionsGraph(null,true,true);\"> draw callingFunctions</span>" +
            "<br><span class=\"popupMenuItem\" onclick=\"CodeEdition.viewCode(null);\"> view Code</span>" +
            "</div> "


        $("#graphPopupDiv").html(html);

    }

    self.getCodeVisjsData = function (result, options) {


        var visjsData = {nodes: [], edges: []}
        var existingNodes = {}
        if (options.addToGraph)
            existingNodes = visjsGraph.getExistingIdsMap()

        function drawFn(fnObj) {
            var dir = fnObj.dir;
            var dirLabel
            if (dir == self.rootCodeDir)
                dirLabel = "_"
            else
                dirLabel = dir.replace(self.rootCodeDir, "")
            dirLabel = dirLabel.replace(/\\/g, "/")

            var file = fnObj.file
            var range = fnObj.data.range
            var color = self.getObjetColor(dir)

            var array = fnObj.name.split(".")
            var obj = array[0];

            if (false && !existingNodes[obj]) {
                existingNodes[obj] = 1
                visjsData.nodes.push({
                    id: obj,
                    label: obj,
                    shape: "box",
                    color: color,
                    size: 10,
                    data: {
                        type: "function",
                        id: obj,
                        text: obj,
                        file: file,
                        dir: dir,
                        rootCodeDir: self.rootCodeDir,


                    }

                })

            }

            if (!existingNodes[fnObj.name]) {
                existingNodes[fnObj.name] = 1
                visjsData.nodes.push({
                    id: fnObj.name,
                    label: fnObj.name,
                    shape: "dot",
                    color: color,
                    size: 10,
                    data: {
                        type: "function",
                        id: fnObj.name,
                        text: fnObj.name,
                        file: file,
                        dir: dir,
                        rootCodeDir: self.rootCodeDir,
                        range: range

                    }

                })
                var edgeId = obj + "_" + fnObj.name
                if (false && !existingNodes[edgeId]) {
                    existingNodes[edgeId] = 1
                    visjsData.edges.push({
                        id: edgeId,
                        from: obj,
                        to: fnObj.name,
                        dashes: true,
                        arrow: {to: false}


                    })
                }


            }
        }

        if (options.drawCallingFunctions) {
            var callingFns = {}
            for (var fn in self.currentCodeMap) {
                var fnObj = self.currentCodeMap[fn]
                fnObj.data.calledFns.forEach(function (fnLinkedName) {
                    if (options.functions && options.functions.indexOf(fnLinkedName) > -1) {
                        callingFns[fn] = 1
                        var fnLinkedObj = self.currentCodeMap[fn]
                        fnLinkedObj.name = fn
                        drawFn(fnLinkedObj)
                    }
                })
            }

            for (var fn in self.currentCodeMap) {
                if (options.functions && options.functions.indexOf(fn) > -1) {
                    var fnObj = self.currentCodeMap[fn]
                    fnObj.name = fn
                    drawFn(fnObj)

                    for (var linkedFn in callingFns) {

                        var edgeId = linkedFn + "_" + fnObj.name
                        if (!existingNodes[edgeId]) {
                            existingNodes[edgeId] = 1
                            visjsData.edges.push({
                                id: edgeId,
                                from: linkedFn,
                                to: fnObj.name,
                                arrows: {to: true}

                            })
                        }
                    }

                }
            }
        } else {
            for (var fn in self.currentCodeMap) {
                if (options.functions && options.functions.indexOf(fn) > -1) {
                    var fnObj = self.currentCodeMap[fn]
                    fnObj.name = fn
                    drawFn(fnObj)


                    fnObj.data.calledFns.forEach(function (fnLinkedName) {
                        var fnLinked = self.currentCodeMap[fnLinkedName]
                        fnLinked.name = fnLinkedName
                        drawFn(fnLinked)

                        var edgeId = fnObj.name + "_" + fnLinked.name
                        if (!existingNodes[edgeId]) {
                            existingNodes[edgeId] = 1
                            visjsData.edges.push({
                                id: edgeId,
                                from: fnObj.name,
                                to: fnLinked.name,
                                arrows: {to: true}

                            })
                        }
                    })


                }
            }
        }


        return visjsData
        //  fs.writeFileSync("D:\\webstorm\\sousLeCode\\data\\visjsData.json", JSON.stringify(visjsData, null, 2))
    }


    return self;


})
()