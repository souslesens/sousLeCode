var CodeEdition = (function () {

    var self = {}

    self.viewCode = function (nodeData) {
        if (!nodeData)
            nodeData = Main.currentGraphNode.data
        self.currentFunctionData = nodeData
        var payload = {
            getCode: true,
            data: JSON.stringify(nodeData),
            options: JSON.stringify({start: nodeData.range[0], end: nodeData.range[1]})
        }
        $.ajax({
            type: "POST",
            url: "/server",
            data: payload,
            dataType: "json",
            success: function (result, textStatus, jqXHR) {
                self.currentFunction = result
                $("#mainDialogDiv").load("/snippets/functionEditionDialog.html")

                $("#mainDialogDiv").dialog("open");
                {

                    setTimeout(function () {
                        $("#fnCodeDiv").html(result.html);
                        if (result.comments && result.comments.length > 0)
                            $("#fnCommentTA").val(result.comments[0].content);


                    }, 200)
                }
            }, error(err) {
                alert(err);
            }
        })
    }

    self.initFnComment = function () {
        var fn = self.currentFunctionData.id
        var params = Main.currentCodeMap[fn].data.params


        /**
         * Represents a book.
         * @constructor
         * @param {string} title - The title of the book.
         * @param {string} author - The author of the book.
         */


        var str = "/**\n" +
            "*              .\n" +
            "* @constructor\n"
        params.forEach(function (param) {
            str += "* @param " + param + "         .\n"
        })
        str += "*/"

        $("#fnCommentTA").val(str)

    }
    self.saveFnComment = function () {
        var comment = $("#fnCommentTA").val();


    }



    self.saveComment=function() {
        var nodeData = Main.currentTreeNodeData
        var comment = $("#commentEditionTA").val()
        if(comment=="")
        return;
        var payload = {
            saveFile: true,
            fileName: nodeData.name+".txt",
            content: comment
        }


        $.ajax({
            type: "POST",
            url: "/server",
            data: payload,
            dataType: "json",
            success: function (result, textStatus, jqXHR) {
              ;
            }, error(err) {
                return alert(err.toString())
            }
        })

    }

    self.editComments=function() {
        var nodeData = Main.currentTreeNodeData

        $("#infosDiv").load("/snippets/commentEditionDialog.html")

        setTimeout(function () {

            var payload = {
                getFileContent: true,
                fileName:nodeData.name+".txt",

            }


            $.ajax({
                type: "POST",
                url: "/server",
                data: payload,
                dataType: "json",
                success: function (result, textStatus, jqXHR) {
                    if(result.done)
                        return;
                    $("#commentEditionTA").val(result.result)
                }, error(err) {
                    return alert(err.toString())
                }
            })
        },200)

    }


    return self;


})()