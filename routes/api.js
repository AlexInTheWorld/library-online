'use strict';

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

module.exports = function (app) {
  
    app.route('/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      // Check first if the ID string for the searched book in DB is valid
      var isIDvalid = ObjectID.isValid(bookid);
      
      if (isIDvalid) {
        MongoClient.connect(process.env.DB_URI, { useUnifiedTopology: true }, function(err, db) {
        if (err) { return res.redirect('/') }
        var books_collection = db.db('database').collection('bks');
        books_collection.findOne({_id: new ObjectID(bookid)}, function(err, result) {
          db.close();
          if(err) { return res.redirect(500, 'https://personal-library-modified.glitch.me') } 
          if (result) {
            res.json(result);
          } else {
            res.type('text').send('no book exists');
          }
          });
        });
      } else {
        res.type('text').send('no book exists');
      }
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var isIDvalid = ObjectID.isValid(bookid);
      var comment = req.body.comment;
      console.log(comment);
      //json res format same as .get
      if (comment) {
        if (isIDvalid) {
          MongoClient.connect(process.env.DB_URI, { useUnifiedTopology: true }, function(err, db) {
          if (err) { return res.redirect(500, 'https://personal-library-modified.glitch.me') }
          var books_collection = db.db('database').collection('bks');
          books_collection.findOneAndUpdate({_id: new ObjectID(bookid)}, {$inc: {commentcount: 1}, $push: {comments: {$each: [{comment: comment, posted_on: Date.now()}], $sort: {posted_on: -1}}}}, {projection: {_id: true, title: true, comments: true}, returnOriginal: false}, function(err, result) {
            db.close();
            if(err) { return res.redirect(500, 'https://personal-library-modified.glitch.me') } 
            if (result.value) {
              res.redirect('/')
            } else {
              res.status(500).send('<h3 style="text-align:center;color:#6b0e2f;margin-top:5vh;">No such book exists in our library</h3>');
            }
            });
          });
        } else {
          res.status(500).send('<h3 style="text-align:center;color:#6b0e2f;margin-top:5vh;">No such book exists in our library</h3>');
        }
      } else {
          res.status(500).send('<h3 style="text-align:center;color:#6b0e2f;margin-top:5vh;">Missing required comment field</h3>');
      } 
    })
    
    .delete(function (req, res){
      //if successful, response will be 'delete successful'
      var bookid = req.params.id;
      var isIDvalid = ObjectID.isValid(bookid);
      
      if (isIDvalid) {
        MongoClient.connect(process.env.DB_URI, { useUnifiedTopology: true }, function(err, db) {
        if (err) { return res.redirect('/') }
        var books_collection = db.db('database').collection('bks');
        books_collection.deleteOne({_id: new ObjectID(bookid)}, function(err, result) {
          db.close();
          if (err) { return res.redirect(500, 'https://personal-library-modified.glitch.me') }
          if (result.deletedCount === 1) {;
            res.redirect('/')
          } else {
            res.type('text').send('no book exists');
          }
        })
      });
      } else {
        res.type('text').send('no book exists');
      }
  });
  
  
  app.route('/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(process.env.DB_URI, { useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;
        var books_collection = db.db("database").collection("bks");
        books_collection.find({}).toArray(function(err, result) {
          db.close();
          if (err) { return res.redirect('/') } 
            // Pass book titles, their ids and respective comments' count as a response
            for (let i = 0; i < result.length; i++) {
              delete result[i].comments;
            }
            res.json(result);
        })
      });
    })
    
    .post(function (req, res){
      var title = req.body.title.trim().toString();
      var book_id = new ObjectID;
      //response will contain new book object including atleast _id and title
      if (title) {
        MongoClient.connect(process.env.DB_URI, { useUnifiedTopology: true }, function(err, db) {
          if (err) { 
            let e = new Error(err);
            res.status(500).send(e.toString());
          } else {
            var books_collection = db.db("database").collection("bks");
            books_collection.insertOne({title: title, _id: book_id, comments: [], commentcount: 0, posted_on: []}, function(err, result) {
            db.close();
            if (err) { 
              let e = new Error(err);
              res.status(500).send(e.toString());
            } else {
              res.type('json').send({title: title, _id: book_id});
            }
          });
          }       
        });
    } else {
      let e = new Error('missing required title field');
      res.status(500).send(e.toString());
    }
    })
  
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      MongoClient.connect(process.env.DB_URI, { useUnifiedTopology: true }, function(err, db) {
        if (err) { return res.redirect('/') }
        var books_collection = db.db("database").collection("bks");
        // Delete all docs in within 'books' collection
        books_collection.deleteMany({ }, function(err, deleted) {
          db.close();
          if (err) {return res.redirect(500, '/') }
          res.redirect('/')
        })        
      });
    });
  
    app.route('/comments/:id').get(function(req, res) {
      var bookid = req.params.id;
      
      // Check first if the ID string for the searched book in DB is valid
      var isIDvalid = ObjectID.isValid(bookid);
      if (isIDvalid){
        MongoClient.connect(process.env.DB_URI, { useUnifiedTopology: true}, function(err, db) {
          if (err) { return res.redirect('/') }
          var books_collection = db.db("database").collection("bks");
          books_collection.findOne({_id: new ObjectID(bookid)}, function(err, doc) {
            db.close();
            if(err) { return res.redirect(500, 'https://personal-library-modified.glitch.me') } 
            if (doc) {
              res.render('comments', {bookobj: doc})
            } else {
              res.type('html').send('<h3 style="text-align:center;color:#6b0e2f;margin-top:5vh;">No such book exists in our library</h3>');
            }
          })
        })        
      } else {
        res.status(404).send('<h2 style="text-align:center;color:#430e6b;margin-top:15vh;">Dead end.</h2><h3 style="text-align:center;color:#6b0e2f;">Sorry, we cannot find that!</h3>');
      }
    })
};
