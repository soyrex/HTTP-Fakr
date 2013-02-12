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
  url =  request.url.replace(request.headers['host'],'').replace('http://','').replace('https://','');
  if(url.match('^media/'))
    url = '/'+url;
  sys.log("HOST: "+request.headers['host'])
  sys.log("URL: "+url)

  var options = {
      port     : 80,
      host     : request.headers['host'],
      method   : request.method,
      path     : url
}


  var prequest = http.request(options, function (presponse) {
    // check if we match any of the overrides:
    var overridden = false;
    for(pattern in patterns) {
      // This section is really not event based. it just
      // spits out our override file:
      if(request.url.match(".*\/"+pattern)) {
        response.writeHead(presponse.statusCode);  
        response.write(patterns[pattern]);     
        response.addTrailers(presponse.trailers);
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
      sys.log("RESPONSE STATUS CODE: "+presponse.statusCode);
      response.writeHead(presponse.statusCode, presponse.headers);
      presponse.on("data", function(chunk)  {
        response.write(chunk);
      });
      presponse.on("end", function () {
          response.addTrailers(presponse.trailers);
          response.end();
      });
    }
  }).on('error',function(e) {
    sys.log('err');
    sys.log(e.message);
  });

  // Data handler:
  request.addListener('data', function(chunk) { prequest.write(chunk, 'binary'); });

  // Request end handler:
  request.addListener('end', function() { prequest.end(); });

}).listen(8080);