///<reference path='../typings/node/node.d.ts' />
///<reference path='../typings/express/express.d.ts' />
///<reference path='../typings/express-session/express-session.d.ts' />
///<reference path='../typings/morgan/morgan.d.ts' />
///<reference path='../typings/socket.io/socket.io.d.ts' />
///<reference path='../typings/passport/passport.d.ts' />
///<reference path='../typings/body-parser/body-parser.d.ts' />
///<reference path="../shared/interfaces.ts" />
///<reference path='./database.ts' />
///<reference path='./models/user.ts' />

import bodyParser = require('body-parser');
import express = require("express")
import http = require("http")
import index = require("./routes/index")
import logger = require("morgan");
import path = require("path")
import databaseModule = require("./database");
import userModule = require("./models/user");
import comicModule = require("./models/comic");
import comicStripModule = require("./models/comicstrip");
import comicCommentModule = require("./models/comiccomment");
import socketIO = require("socket.io");
import mongoose = require('mongoose');

var fallback = require('express-history-api-fallback')
var root = __dirname + '/public';
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var session = require('express-session');
var cookieParser = require('cookie-parser');
var fs = require('fs');

class Application {
  io: SocketIO.Server;

  constructor() {
    var app = express();
    var databaseClass = databaseModule;
    var db = databaseClass.getDatabase();
    var UserModel = userModule;
    var ComicCommentModel = comicCommentModule;
    var ComicStripModel = comicStripModule;
    var self = this;


    var passport = require('passport');
    var FacebookStrategy = require('passport-facebook').Strategy;

    app.set('port',  process.env.PORT || 3000);
    //app.use(logger('dev'));
    //app.use(bodyParser);
    //app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(root));
    app.use(fallback('index.html', { root:root }));
    app.use(cookieParser());
    app.use(session({secret: 'cat'}));
    app.use(bodyParser.json({limit: '1gb'}));
    app.use(bodyParser.urlencoded({ extended: false, limit: '1gb'}));
    app.use(passport.initialize());
    app.use(passport.session());

    var ComicModel = comicModule;

    db.once('open', function() {
      console.log("Successfully connected to mongoDB!");
    });

    // loading all files in models dir
    fs.readdirSync(__dirname + '/models').forEach(function(filename) {
      if (~filename.indexOf('.ts')) require(__dirname + '/models/' + filename)
    });

    app.get('/user', function(req, res) {
      console.log("asdf")
      mongoose.model('user').find(function(err, user) {
        res.send(user);
      });
    });

    app.get('/comiccomment', function(req, res) {
      mongoose.model('comiccomment').find(function(err, comiccomment) {
        res.send(comiccomment);
      });
    });

    function fetchComments(on, finished) {
      if (on && on.comments && on.comments.length > 0) {
        var count = on.comments.length;
        var done = function() {
          count -= 1;
          if (count === 0) {
            finished(on);
          }
        }
        on.comments.forEach(function(comment, i) {
          mongoose.model('comiccomment').findById(comment, function(err, found: ComicComment) {
            if (err != null) {
              console.log(err);
              done();
              return;
            }
            on.comments[i] = JSON.parse(JSON.stringify(found));

            console.log('finding author', found.author)
            mongoose.model('user').findById(found.author, function(err, found: User) {
              on.comments[i].author = found;
              done();
            });
          });
        });
      } else {
        finished(on);
      }
    }

    function findStrip(title: string , comicTitle: string, cb: (err: any, strips: ComicStrip[])=>void) {
      mongoose.model('comic').find({ title: comicTitle}, function(err, comic: Comic) {
        if (err) {
          cb(err, []);
          return;
        }
        if (!comic || !comic[0]) {
          cb('comic not found', []);
          return;
        }
        var resps = 0;
        var handle = function(err, resp) {
          resps += 1;
          if (err) {
            if (resps == 2 && cb) {
              console.log('error finding');
              cb(err, resp);
            }
            return;
          }
          if ((resp && resp.length > 0 || resps == 2) && cb) {
            cb(err, resp);
            cb = null;
          }
        }
        mongoose.model('comicstrip').find({
          title: title, comic: comic[0]._id
        }, handle);
        mongoose.model('comicstrip').find({
          title: title, "comic._id": comic[0]._id,
        }, handle);
      });
    }

    app.get('/api/comic/:comictitle/:title', function(req, res) {
      findStrip(req.params.title, req.params.comictitle, function(err, strips: ComicStrip[]) {
        if (err!=null) {
          console.log(err);
          return;
        }
        var strip = strips[0];
        if (!strip) {
          res.status(404).send({ error: "strip not found" });
          return;
        }
        strip = JSON.parse(JSON.stringify(strip));
        self.fetchData('user', strip.authors, function() {
          var next = [strip.next];
          self.fetchData('comicstrip', next, function(next) {
            strip.next = next[0];
            var prev = [strip.prev];
            self.fetchData('comicstrip', prev, function(prev) {
              strip.prev = prev[0];
              var comic = [strip.comic];
              self.fetchData('comic', comic, function(comic) {
                strip.comic = comic[0];
                fetchComments(strip, function() {
                  res.send(strip);
                });
              });
            });
          });
        });
      });
    });

    app.post('/api/comic/:comictitle/:title/patch', function(req, res) {
      if (!req.user || !req.user.contributor) {
        res.status(400).send({ error: "must be logged in and a contributor" });
        return;
      }
      findStrip(req.params.title, req.params.comictitle, function(err, strips: ComicStrip[]) {
        if (err!=null) {
          console.log(err);
          return;
        }
        var strip = strips[0];
        if (!strip) {
          res.status(404).send({ error: "strip not found" });
          return;
        }
        for(var prop in req.body) {
          strip[prop] = req.body[prop];
        }
        strip.save(function(err) {
          if (err != null) {
            res.status(400).send({ error: err });
            return;
          }
          res.send(strip);
        });
      });
    });

    app.post('/api/comic/:comictitle/:title/vote', function(req, res) {
      findStrip(req.params.title, req.params.comictitle, function(err, strips: ComicStrip[]) {
        if (err!=null) {
          console.log(err);
          return;
        }
        var strip = strips[0];

        var dir = parseInt(req.body.dir);
        if (dir > 1 || dir < -1) {
          dir = 0;
        }
        strip.votes = (strip.votes || 0) + dir;
        strip.save(function(err) {
          if (err) {
            console.log('error', err)
          }
        });
        res.send(strip);
      });
    });

    app.post('/api/comment/:id/vote', function(req, res) {
      mongoose.model('comiccomment').findById(req.params.id, function(err, comment: ComicComment) {
        if (err!=null) {
          console.log(err);
          return;
        }

        var dir = parseInt(req.body.dir);
        if (dir > 1 || dir < -1) {
          dir = 0;
        }
        comment.votes = (comment.votes || 0) + dir;
        comment.save(function(err) {
          if (err) {
            console.log('error', err)
          }
        });
        res.send(comment);
      });
    });

    function commentOn(req, res, on) {
      if (!req.user) {
        res.status(400).send({ error: "not logged in" });
        return;
      }

      if (!on.comments) {
        on.comments = [];
      }
      var comment = ComicCommentModel.addComment(req.user, req.body.comment)
      on.comments.push(comment._id);

      on.save(function(err) {
        if (err) {
          console.log('error', err)
        }
      });
      res.send(on);
    }

    app.post('/api/comic/:comictitle/:title/comment', function(req, res) {
      findStrip(req.params.title, req.params.comictitle, function(err, strips: ComicStrip[]) {
        if (err!=null) {
          console.log(err);
          return;
        }
        var strip = strips[0];
        commentOn(req, res, strip);
      });
    });

    app.get('/api/popular/', function(req, res) {
      mongoose.model('comicstrip').find().sort([['votes', 'descending']]).exec(function(err, strips) {
        if (err!=null) {
          console.log(err);
          return;
        }
        var comics: string[] = [];
        strips.forEach(function(strip) {
          comics.push(strip.comic);
        });
        self.fetchData('comic', comics, function(comics) {
          if (strips) {
            strips = JSON.parse(JSON.stringify(strips));
          }
          comics.forEach(function(comic, i) {
            strips[i].comic = comic;
          });
          res.send(strips);
        });
      });
    });

    app.get('/api/comic/:title', function(req, res) {
      mongoose.model('comic').find({title:req.params.title}, function(err, comics: Comic[]) {
        var comic = comics[0];
        if (!comic) {
          res.status(404).send({ error: "comic not found" });
          return;
        }
        self.fetchData('user', comic.authors, function() {
          self.fetchData('comicstrip', comic.strips, function() {
            fetchComments(comic, function(comic) {
              res.send(comic);
            });
          });
        });
      });
    });

    app.post('/api/comic/:title', function(req, res) {
      if (!req.user || !req.user.contributor) {
        res.status(400).send({ error: "must be logged in and a contributor" });
        return;
      }
      var newtitle = req.body.title;

      mongoose.model('comic').find({title:req.params.title}, function(err, comics: Comic[]) {
        var comic = comics[0];
        if (!comic) {
          res.status(404).send({ error: "comic not found" });
          return;
        }
        self.fetchData('comicstrip', comic.strips, function() {
          var last = comic.strips[comic.strips.length-1];
          var strip = ComicStripModel.addComicStrip(newtitle, [req.user._id], comic);
          if (last) {
            strip.prev = last._id;
            last.next = strip._id;
            strip.save();
            last.save();
          }
          if (!comic.strips) {
            comic.strips = [];
          }
          comic.strips.push(strip._id);
          comic.numStrips = comic.strips.length;
          comic.save(function(err) {
            if (err) {
              res.status(500).send({ error: err });
              return;
            }
            res.send(strip);
          });
        })
      });
    });

    app.post('/api/comic/:title/comment', function(req, res) {
      mongoose.model('comic').find({title:req.params.title}, function(err, comic) {
        commentOn(req, res, comic[0]);
      });
    });

    app.get('/api/comic/', function(req, res) {
      mongoose.model('comic').find(function(err, comics) {
        res.send(comics);
      });
    });

    app.get('/api/mycomics/', function(req,res){
      mongoose.model('comic').find(function(err,comics){
        res.send(comics);
      });
    });

  app.post('/api/comic/', function(req, res) {
    if (!req.user || !req.user.contributor) {
      res.status(400).send({ error: "must be logged in and a contributor" });
      return;
    }

    mongoose.model('comic').findOne({title: req.body.title}, function(err, found){
      if(found == null){
        res.send(ComicModel.addComic(req.body.title, [req.user._id]));
      } else{
        res.send('exists')
      }
    });
  });

  app.get('/api/mycomics/', function(req,res){
    mongoose.model('comic').find({ authors: req.user._id }, function(err, comics){
      res.send(comics);
    });       
  });

  app.get('/api/mycomics/editcomics/:title', function(req, res) {
    mongoose.model('comic').findOne({title: req.params.title}, function(err, thiscomic) {
      mongoose.model('comicstrip').find({comic: thiscomic._id}, function(err, comicstrips){
        res.send(comicstrips);
      }) 
    });
  });

  app.post('/api/mycomics/editcomics/:title', function(req, res) {
    var filename = req.body.filename.substring(0, req.body.filename.length - 4);
    var filestring = req.body.filestring;   

    var newComicStrip = ComicStripModel.uploadComicStrip(filename, filestring, req.user._id);

    mongoose.model('comic').findOneAndUpdate(
      { title: req.params.title },
      { $inc: { numStrips: 1 }, $set: { latestStrip: newComicStrip._id }, 
      $addToSet:{ strips: newComicStrip._id, authors: req.user._id}},
      function(err, foundcomic){
      mongoose.model('comicstrip').findOneAndUpdate(
          { title: filename},
          { $set: { prev: newComicStrip._id, next: newComicStrip._id, comic: foundcomic._id}},
          function(err, update) {
        });
      })

    mongoose.model('comic').findOne({ title: req.params.title }, 'strips', function(err, thiscomic){
      var listofcomicstrips = thiscomic.toObject({ getters: true })["strips"];
      if(listofcomicstrips.length == 1){
      } else if(listofcomicstrips.length == 2){
        mongoose.model('comicstrip').findByIdAndUpdate(listofcomicstrips[0],
          {$set: {prev: listofcomicstrips[1], next: listofcomicstrips[1]}},
          function(err, update){
          });
        mongoose.model('comicstrip').findByIdAndUpdate(listofcomicstrips[1],
          {$set: {prev: listofcomicstrips[0], next: listofcomicstrips[0]}},
          function(err, update){
          });
      } else if(listofcomicstrips.length >= 3){
        for (var i = 0; i <= listofcomicstrips.length - 1; i++) {
          if(i == 0){
            mongoose.model('comicstrip').findByIdAndUpdate(listofcomicstrips[i],
              { $set: { prev: listofcomicstrips[listofcomicstrips.length - 1 ] ,  next: listofcomicstrips[i+1]}},
              function(err, update){
              });
          } else if (i == listofcomicstrips.length - 1){
            mongoose.model('comicstrip').findByIdAndUpdate(listofcomicstrips[i],
              { $set: { prev: listofcomicstrips[i-1] , next: listofcomicstrips[0]}},
              function(err, update){
              });
          } else{
            mongoose.model('comicstrip').findByIdAndUpdate(listofcomicstrips[i],
              { $set: {prev: listofcomicstrips[i-1], next: listofcomicstrips[i+1]}},
              function(err, update){

              });
          }
      }

      res.status(200).send({comicstrip:filename, comic:req.params.title});
      
      }
    })


  });

  app.delete('/api/mycomics/editcomics/:title', function(req, res){
    mongoose.model('comic').findOneAndRemove({ title: req.params.title }, function(err, thiscomic) {
      var listofcomicstrips = thiscomic.toObject({ getters: true })["strips"];
      for (var i = listofcomicstrips.length - 1; i >= 0; i--) {
        mongoose.model('comicstrip').findByIdAndRemove(listofcomicstrips[i], function(err, update) { });
      }
    });
    res.send('comic deleted');
  });

  app.post('/api/mycomics/editcomics/comicstrip/:title', function(req, res) {
    var ntitle = req.body.stitle;
    var ndesc = req.body.sdescrip;

    mongoose.model('comicstrip').findOneAndUpdate(
      { title: req.params.title },
      { $set: { title: ntitle, desc: ndesc, date: new Date() } },
      function(err, result) {
        res.status(200).send({ comicstrip: ntitle, message: 'updated no problem' });

      });    

  });

  app.delete('/api/mycomics/editcomics/comicstrip/:title', function(req, res) {
    mongoose.model('comicstrip').findOneAndRemove({title: req.params.title}, function(err, cs){
      var thiscomic = cs.toObject({ getters: true })["comic"];      
      mongoose.model('comic').findByIdAndUpdate(thiscomic,
      { $inc: { numStrips: -1} },
      function(err, comic) {
      var listofcomicstrips = comic.toObject({ getters: true })["strips"]
      for (var i = 0; i <= listofcomicstrips.length - 1; i++) {
        if (i == 0) {
          mongoose.model('comicstrip').findByIdAndUpdate(listofcomicstrips[i],
            { $set: { prev: listofcomicstrips[listofcomicstrips.length - 1], next: listofcomicstrips[i + 1] } },
            function(err, update) {
            });
        } else if (i == listofcomicstrips.length - 1) {
          mongoose.model('comicstrip').findByIdAndUpdate(listofcomicstrips[i],
            { $set: { prev: listofcomicstrips[i - 1], next: listofcomicstrips[0] } },
            function(err, update) {
            });
        } else {
          mongoose.model('comicstrip').findByIdAndUpdate(listofcomicstrips[i],
            { $set: { prev: listofcomicstrips[i - 1], next: listofcomicstrips[i + 1] } },
            function(err, update) {

            });
        }
      }



      });

      res.status(200).send({message:'comicstrip deleted'});
    })
  });

  app.get('/api/user/:name', function(req, res) {
      mongoose.model('user').find({name: req.params.name}, function(err, user) {
        fetchComments(user[0], function(user) {
          res.send(user);
        });
      });
    });


    app.post('/api/user/:name/comment', function(req, res) {
      mongoose.model('user').find({name: req.params.name}, function(err, user) {
        if (err!=null) {
          console.log(err);
          return;
        }
        commentOn(req, res, user[0]);
      });
    });

    app.get('/api/user', function(req, res) {
      mongoose.model('user').find(function(err, users) {
        res.send(users);
      });
    });

    app.get('/api/currentUser', function(req, res) {
      res.send(req.user);
    });

    app.post('/logout', function(req, res) {
      console.log("user has logged out");
      req.logout();
      req.session.destroy();
      res.status(201).send({ error: "test" });
    });

    app.post('/logoutFB', function(req, res) {
      console.log("user has logged out from facebook");
      req.logout();
      req.session.destroy();
      res.status(201).send({ error: "test" });
    });

    app.post('/profile', function(req, res) {
      var userEmail = req.user.email;
      var userName = req.body.name;
      var userPassword = req.body.password;
      var userDesc = req.body.desc;
      var Mname = req.user.name;
      var Mpassword = req.user.password;
      var Mdesc = req.user.desc;
      var confirmPassword = req.body.confirmPassword;
      console.log(confirmPassword);
      if (confirmPassword == userPassword) {
        if (userName != Mname) {
          UserModel.userModel.findOneAndUpdate({ email: userEmail }, { $set: { name: userName } }, { new: true }, function(err, doc) {
            if (err) {
              console.log("Error");
            }
          console.log(doc);
          });
        }
        if (userPassword != Mpassword) {
          UserModel.userModel.findOneAndUpdate({ email: userEmail }, { $set: { password: userPassword } }, { new: true }, function(err, doc) {
            if (err) {
              console.log("Error");
            }
            console.log(doc);
          });
        }
        if (userDesc != Mdesc) {
          UserModel.userModel.findOneAndUpdate({ email: userEmail }, { $set: { desc: userDesc } }, { new: true }, function(err, doc) {
            if (err) {
              console.log("Error");
            }
            console.log(doc);
          });
        }
        res.status(201).send({ test: "" });
      }
      else
        res.status(400).send({ test: "" });
    });

    app.post('/signup', function(req, res, next) {
      var useremail = req.body.email;
      var userpassword = req.body.password;
      var username = req.body.name;
      var cont = req.body.contributor;

      if(cont == null){
        cont = false;
      }
      var query = UserModel.userModel.where({ email: useremail });
        query.count(function(err, count) {
          if (count === 0) {
            UserModel.addUser(username, userpassword, useremail, " ", cont);
            res.status(201).send({test: ""});
          }
          else {
            console.log("Already exist");
            res.status(400).send({ error: "User already exists" });
          }
        });
      });

      passport.serializeUser(function(user, done) {
        done(null, user);
      });

      passport.deserializeUser(function(email, done) {
        UserModel.userModel.findById(email, function (err, user) {
          done(err, user);
        });
      });

      passport.use(new localStrategy({
        usernameField: 'email',
      }, function(email, password, done) {
        UserModel.userModel.findOne({ email: email }, function(err, user) {
          if (err) {
            console.log("err");
            return done(err);
          }
          if (!user) {
            console.log("Please sign up first");
            return done(null, false);
          }
          if(user.password != password){
            console.log("Please check your password");
            return done(null, false);
          }
          console.log("User " + user._id + " is logged in!");
          console.log(user);
          return done(null, user);
        });
      }));

      app.post('/login', passport.authenticate('local'), function(req, res) {
        res.status(201).send({test: ""});
      });

    //catch 404 and forward to error handler
    app.use((req, res, next) => {
      var err = new Error('Not Found');
      err['status'] = 404;
      next(err);
    });

    if (app.get('env') === 'development') {
      app.use((err: any, req, res, next) => {
        res.status(err['status'] || 500);
        res.send({
          message: err.message,
          error: err
        });
      });
    }

    // Routes to serve via the single page app.
    var spaRoutes = [
      '/',
      '/comics', '/comic/:comic', '/comic/:comic/:strip',
      '/authors', '/author/:author',
      '/popular',
      '/search',
      '/new', '/new/draw',
      '/mycomics', '/mycomics/editcomics/:strip',
      '/search',
      '/profile',
      '/login', '/logout',
      '/signup'
     ];

    spaRoutes.forEach(function(route) {
      app.get(route, index.index);
    });

    // production error handler
    // no stacktraces leaked to user
    app.use((err: any, req, res, next) => {
      res.status(err.status || 500);
      res.send({
        message: err.message,
        error: {}
      });
    });

    var server = http.createServer(app);
    server.listen(app.get('port'), function() {
      console.log("Express server listening on port " + app.get('port'));
    });
    this.io = socketIO(server);
    this.registerSocketIOHandlers();
  }
  registerSocketIOHandlers() {
    this.io.on('connection', function(socket){
      socket.on('zwibbler-update', function(data) {
        socket.broadcast.emit('zwibbler-update', data);
        console.log('zwibbler-update!')
      });
    });
  }
  fetchData(model: string, data: (string|any)[], cb: (data: any[]) => void) {
    var count = data && data.length || 0;
    function done() {
      count -= 1;
      if (count == 0) {
        cb(data);
      }
    }
    if (!data || !data.length || data.length === 0) {
      cb(data);
      return;
    }
    data.forEach(function(x, i) {
      var id = x;
      if (x && x._id) {
        console.log(model, x);
        id = x._id;
      }
      mongoose.model(model).findById(id, function(err, found) {
        if (err != null) {
          console.log('fetchData err', err);
        }
        data[i] = found;
        done();
      });
    });
  }
}

new Application();
