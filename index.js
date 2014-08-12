'use strict';
var fs = require('fs');
var path = require('path');
var express = require('express');
var svg2png = require('svg2png');
var favicon = require('serve-favicon');
var app = express();

var template = fs.readFileSync(path.join(__dirname, 'template.svg'), 'utf8');
var re = new RegExp('{{fill}}');

var outdir = path.join(__dirname, 'public');

fs.mkdir(outdir, function () {});

app.use(favicon(__dirname + '/favicon.ico'));
app.use(express.static(outdir));

app.get(/(.*?)\.png$/, function(req, res, next){
  var url = req.params[0];
  url = url.replace(/.png$/, '');
  url = url.replace(/[^a-zA-Z0-9_\-]+/g, '');

  fs.writeFile(path.join(outdir, url + '.svg'), template.replace(re, 'hsl(' + hash(url, true) + ',100%,50%)'), 'utf8', function (error) {
    if (error) {
      console.error(error);
      return next(error);
    }

    svg2png(path.join(outdir, url + '.svg'), path.join(outdir, url + '.png'), function (error) {
      if (error) {
        console.error(error);
        return next(error);
      }
      url = '/' + url + '.png';
      console.log('done and redirect to ' + url);
      res.redirect(url);
    });
  });
});

app.listen(process.env.PORT || 8000);



function hash(seed) {
  /*jshint bitwise:false */
  var i, l;
      // username as seed instead of a string and a possible string?
  var hval = (seed === undefined) ? 0x811c9dc5 : seed;

  // i didn't change this, i have absolutely no knowledge of creating hashes.
  for (i = 0, l = seed.length; i < l; i++) {
    hval ^= seed.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }

  // max of 8 numbers to prevent hitting upper level, no
  return ((hval >>> 0).toString()).substr(-8);
}
