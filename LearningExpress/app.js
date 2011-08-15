
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Globals
var g_NumClients = 0;
var g_Clients = {};
var PLAINTEXT = { 'Content-Type' : 'text/plain' };

var sendToAll = function (sMessage) {
  for (var id in g_Clients) {
    if(g_Clients.hasOwnProperty(id)) {
      g_Clients[id].send(sMessage, PLAINTEXT, 200);
      //delete g_Clients[id]; 
    } 
  }
};

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Long Poll Test',
    locals: {
      clientId: g_NumClients++
    }
  });
});

// New message
app.post('/message', function(req, res){
  sendToAll(req.body.message);
});

// Long polling handler
app.get('/messages', function(req, res){
  g_Clients[req.query.id] = res;
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
