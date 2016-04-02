///<reference path="../../shared/interfaces.ts" />
///<reference path='../../typings/mongoose/mongoose.d.ts' />

var mongoose = require('mongoose');

class ComicModel implements Comic {

  comicSchema;
  comicModel;
  title: string;
  authors: User[];
  date: Date;
  latestStrip: ComicStrip;
  numStrips: number;
  strips: ComicStrip[];
  votes: number;
  comments: ComicComment[];

  constructor(){
    var Schema = mongoose.Schema;
    this.comicSchema = new Schema({
      title: String,
      authors: [],
      date: Date,
      latestStrip: String,
      numStrips: Number,
      strips: [],
      votes: Number,
      comments: []
    });

    this.comicModel = mongoose.model('comic', this.comicSchema);
  }

  addComic(t: string, as: User) {
    var newComic = new this.comicModel({
    title: t,
    authors: as._id,
    date: new Date(),
    latestStrip: "",
    numStrips: 0,
    strips : [],
    votes: 0,
    comments: []
    });

    newComic.save(function(err) {
      console.log('comic save err', err);
    });
    console.log("A new comic named " + t + " has been added");
    return newComic;
  }


}

export = new ComicModel();
