'use strict';
require('dotenv').config()
const express     = require('express');
const bodyParser  = require('body-parser');
const MongoClient = require('mongodb').MongoClient
const apiRoutes   = require('./routes/api.js');
const app         = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Use method-override to pull delete request from the client side
const methodOverride = require('method-override'); 
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it as req.body will not be parsed
    // Return the method that will replace the 'form' method on the client side
    var method = req.body._method
    delete req.body._method
    return method
  }
}))

// Serve static content
app.use('/public', express.static(process.cwd() + '/public'));

// Set view parameters for templating tool
app.set('views', process.cwd() + '/views');
app.set('view engine', 'ejs');

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
  // Get all the books currently in the library from DB
  MongoClient.connect(process.env.DB_URI, { useUnifiedTopology: true }, function(err, db) {
  if (err) throw err;
  var books_collection = db.db("database").collection("bks");
  books_collection.find({}).toArray(function(err, result) {
    db.close();
    if (err) { console.log(err) } else {
      // Pass book titles, their ids and respective comments into the template
      res.render('index', {books: result})
    }
  })
  });
});

//Routing for API 
apiRoutes(app); 

//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('html')
    .send('<h1 style="text-align:center;margin-top:5vh;">Not Found</h1>');
});

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT);
    
});

