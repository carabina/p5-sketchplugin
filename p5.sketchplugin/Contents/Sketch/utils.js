var runFromFile = false; //can be removed?

//grabs the code from panel and saves it to file for execution
function saveCode(code) {
    var string = [NSString stringWithFormat: "%@", code],
    filePath = "/Users/" + NSUserName() + "/Library/Application Support/com.bohemiancoding.sketch3/Plugins/p5.sketchplugin/Contents/Sketch/sketch.js";
    [string writeToFile:filePath atomically:true encoding:NSUTF8StringEncoding error:nil];
}

//get javascript array from NSArray
function jsArray(array) {
  var length = [array count];
  var jsArray = [];

  while(length--) {
  	jsArray.push([array objectAtIndex: length]);
  }
  return jsArray;
}

//find artboard with name
function getArtboardWithName(name) {
	var artboards = jsArray([doc artboards]);
	for(var i = 0; i < artboards.length; i++) {
	  	var artboard = artboards[i];
	  	//if page matches name
	  	if([artboard name] == name) {
	  		return artboard;
	  	}
	}
	return;
}

//find layer based on layer name and artboard name
function getLayerWithName(layerName, artboardName) {
  var all_layers = getArtboardWithName(artboardName).layers();
    for (x = 0; x < [all_layers count]; x++) {
      if (all_layers.objectAtIndex(x).name() == layerName) {
        return all_layers.objectAtIndex(x);
    }
  }
}

  //filter array using predicate
function predicate(format, array) {

	//make sure that format is speficied
	if(!format || !format.key  || !format.match) return;

	//create predicate
	var predicate = NSPredicate.predicateWithFormat(format.key, format.match);

	//perform query
	var queryResult = array.filteredArrayUsingPredicate(predicate);

	//return result
	return queryResult;
}

function deleteLayer(layer){
	var parent = [layer parentGroup];
	if(parent) [parent removeLayer: layer];
}


function deleteAllLayers(artboardName) {
    var all_layers = getArtboardWithName(artboardName).layers()
    while ([all_layers count] > 0) {
      var i = 0;
      var layer = all_layers.objectAtIndex(i);
      deleteLayer(layer);
      i = i+1;
    }
}

function resizeLayerToFitText(layer) {
	[layer adjustFrameToFit];
    [layer select:true byExpandingSelection:false];
    [layer setIsEditingText:true];
    [layer setIsEditingText:false];
    [layer select:false byExpandingSelection:false];
}

function findSymbolByName(symbolName) {
    var targetSymbols = doc.documentData().allSymbols();
      for (var j = 0; j < targetSymbols.count(); j++) {
          var targetSymbol = targetSymbols.objectAtIndex(j);
          if (targetSymbol.name().isEqualToString(symbolName)) {
              return targetSymbol.newSymbolInstance();
          }
      }
    return false;
}

function openUrlInBrowser(url) {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url));
}

function tryParseJSON (jsonString){
  try {
    var o = JSON.parse(jsonString);
    if (o && typeof o === "object" && o !== null) {
      return o;
    }
  }
  catch (e) { }
  return false;
}

function get( url ) {
  var url = [url];
  var task = NSTask.alloc().init();
  task.setLaunchPath("/usr/bin/curl");
  task.setArguments(url);
  var outputPipe = [NSPipe pipe];
  [task setStandardOutput:outputPipe];
  task.launch();
  var responseData = [[outputPipe fileHandleForReading] readDataToEndOfFile];
  var responseString = [[[NSString alloc] initWithData:responseData encoding:NSUTF8StringEncoding]];
  var parsed = tryParseJSON(responseString);
  if(!parsed) {
    log("Error invoking curl");
    log("args:");
    log(args);
    log("responseString");
    log(responseString);
    throw "Error communicating with server"
  }
  return parsed;
}
