var http  = require('http');
var sys   = require('sys');
var fs    = require('fs');

// This will hold our override patterns.
// Populated using the files in the overrides directory.
var patterns = {}

// Populate it, loops the dir and gets the files.
// This could be smarter, it could walk sub dirs and
// match proper paths.. but for now it works.
fs.readdir('./overrides',function(err, files){
  for(f in files) {
    var filename = files[f];
    // read the file and store it in the global dictionary:
    data = fs.readFileSync('overrides/'+filename);
    sys.log("WATCHING FOR: "+filename);
    patterns[filename] = data;
  }
});

// Create a server:
http.createServer(function(request, response) {
  // Create a client:
  var proxy = http.createClient(80, request.headers['host'])
  var prequest = proxy.request(request.method, request.url, request.headers);

  prequest.addListener('response', function (presponse) {
    // check if we match any of the overrides:
    var overridden = false;
    for(pattern in patterns) {
      // This section is really not event based. it just
      // spits out our override file:
      if(request.url.match(".*\/"+pattern)) {
        response.write(patterns[pattern]);     
        response.writeHead(presponse.statusCode);  
        response.end();  
        sys.log("OVERRIDE: "+request.url+" ("+pattern+")");
        overridden = true;
        break;
      }  
    }
    
    // Otherwise, proxy it.
    if(!overridden)
    {
      sys.log("PASSTHRU: "+request.url);
      // Listen for data and write it to the response:
      presponse.addListener('data', function(chunk) { response.write(chunk, 'binary'); });

      // End the response:
      presponse.addListener('end', function() { response.end(); });
      
      // Write the response code - we AREN'T passing headers, since it helps us 
      // NOT cache our proxied data in the browser.
      response.writeHead(presponse.statusCode);      
    }
  });

  // Data handler:
  request.addListener('data', function(chunk) { prequest.write(chunk, 'binary'); });

  // Request end handler:
  request.addListener('end', function() { prequest.end(); });

}).listen(8080);