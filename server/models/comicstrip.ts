///<reference path="../../shared/interfaces.ts" />
///<reference path='../../typings/mongoose/mongoose.d.ts' />

var mongoose = require('mongoose');

class ComicStripModel implements ComicStrip {
  comicStripSchema;
  comicStripModel;
  title: string;
  authors: User[];
  desc: string;
  date: Date;
  img: string;
  zwibbler3: string;
  comic: Comic;
  next: ComicStrip;
  prev: ComicStrip;
  votes: number;
  comments: ComicComment[];

  constructor(){
    var Schema = mongoose.Schema;
    this.comicStripSchema = new Schema({
      title: String,
      authors: [],
      desc: String,
      date: Date,
      img: String,
      zwibbler3: String,
      comic: {},
      next: [],
      prev: [],
      votes: Number,
      comments: []
    });
    this.comicStripModel = mongoose.model('comicstrip', this.comicStripSchema);
  }

  addComicStrip(t: string, a: User[], comic: Comic){
    var newComicStrip = new this.comicStripModel({
      title: t,
      authors: a,
      desc: "",
      date: new Date(),
      img: "",
      zwibbler3: "",
      comic: comic._id,
      next: null,
      prev: null,
      votes: 0,
      comments: []
    });
    newComicStrip.save(function(err) {
      if (err != null) {
        console.log('new strip err', err);
      }
    });
    console.log("A new comicstrip " + t + " has been added")
    return newComicStrip;
  }

  uploadComicStrip(filename: string, filestring: string, user: User){
    var newComicStrip = new this.comicStripModel({
      title: filename,
      authors: user,
      desc: "",
      date: new Date(),
      img: filestring,
      zwibbler3: "",
      comic: null,
      next: null,
      prev: null,
      votes: 0,
      comments: []
    });
    newComicStrip.save(function(err) {
      if (err != null) {
        console.log('new strip err', err);
        return;
      }
    });
    console.log("A new comicstrip " + filename + " has been added")
    return newComicStrip;
  }

}

export = new ComicStripModel();
