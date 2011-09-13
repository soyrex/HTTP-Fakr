HTTP Fakr
=========
Basic Node.js proxy server that will pass all HTTP traffic through.

In the overrides/ directory you can place simple files that you want to override, the proxy
will then return these to the browser without requesting from the server. Allowing you
to inject different content into your browser.

That's all.

Basic Usage
-----------
1) To use it. You'll need Node.js installed. Then you just run: node httpfakr.js
2) Configure your browser to proxy through port 8080 on your local machine - easiest with Firefox.
3) By default the is a file called $ in the overrides, once the proxy is running, this will
override any root web request with a simple hello message... you probably want to remove that file.

TODO 
----
It would be nice if the overrides directory replicated web paths, not just files. so you could override
ONLY images in the img/ dir, or some such.

License
-------
Free. Do what you want. I accept no responsibility. Let me know if you fork it.