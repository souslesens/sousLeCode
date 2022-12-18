
var fs=require('fs');
var util=require('./util.')
var StackParser={


    parse: function(filePath){
        var str=""+fs.readFileSync(filePath)

        var csvStr="featureName,id,from,to,index,file,fnName,line\n"
        var featuresArray=str.trim().split("/*")

        featuresArray.forEach(function(featureStr){


        var lines=featureStr.split("\n")


        var usefullLines=[]

      var stringsToSskip=[
         "*" ,"async","anonymous","jquery","getStackTrace","succes"
      ]

            var featureName="?"
        lines.forEach(function(line) {
            var ok=true
            if( line.startsWith("*")) {
                featureName = line.substring(1).trim()
                featureName=util.formatStringForTriple(featureName,true)
                ok=false;
            }
            else
            stringsToSskip.forEach(function(str) {

                    if (line.indexOf(str) > -1)
                        ok=false


                })
            if(ok)
                usefullLines.push(line.trim())
            })

            var stack=[]
        usefullLines.forEach(function(line){
            var regex=/(.*) \((.*):(.*)\)/g
            var array=regex.exec(line)
if(!array || array.length<3)
    return;
            var fileObject=array[2];
            fileObject=fileObject.substring(0,1).toUpperCase()+fileObject.substring(1,fileObject.length-3)
            var id=array[1].replace("self",fileObject)
            if( id=="onclick")
                id=featureName+"."+id;
            if( id=="onchange")
                id=featureName+"."+id;
            var stackLine={
                fnFile:array[2],
                fnLine:array[3],
                fnName:array[1],
                id:id
            }

            stack.push(stackLine)

        })

            stack=stack.reverse()

            stack.forEach(function(line, index){
//str+=featureName+","+index+","+line.fnFile+","+line.fnName+","+line.fnLine+"\n"
                if(index==0)
                    return;
                csvStr+=featureName+","+(featureName+"_"+index)+","+stack[index-1].id+","+line.id+","+index+","+line.fnFile+","+line.fnName+","+line.fnLine+"\n"
            })


        })

fs.writeFileSync(filePath.replace(".txt","_calls.csv"),csvStr)
    }






}

var file="D:\\sousLeSens\\code\\AllLineageDraw.txt"
//file="NodeInfos","D:\\sousLeSens\\code\\nodeInfosStack.txt"
StackParser.parse(file)