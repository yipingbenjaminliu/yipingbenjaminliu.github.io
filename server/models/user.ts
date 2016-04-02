///<reference path="../../shared/interfaces.ts" />
///<reference path='../../typings/mongoose/mongoose.d.ts' />
///<reference path="./comiccomment.ts" />


var mongoose = require('mongoose');

import ComicCommentModel = require('./comiccomment');

class UserModel implements User {

  userSchema;
  userModel;
  name: string;
  email: string;
  password: string;
  desc: string;
  contributor: boolean;
  strips: ComicStrip[];
  comics: Comic[];
  comments: ComicComment[];
  ComicCommentModel = ComicCommentModel.getModel();

  constructor() {
    var Schema = mongoose.Schema;
    this.userSchema = new Schema({
      name: String,
      desc: String,
      email: String,
	    password: String,
      contributor: Boolean,
      strips: [mongoose.Schema.ObjectId],
      comics: [mongoose.Schema.ObjectId],
      comments: []
    });

    this.userSchema.methods.toJSON = function() {
      var obj = this.toObject();
      delete obj.password;
      return obj;
    }
    this.userModel = mongoose.model('user', this.userSchema);
  }

  addUser(n: string, p: string, e: string, d: string, c: boolean) {
    var newUser = new this.userModel({
      name: n,
      password: p,
      email: e,
      desc: d,
      contributor: c,
      strips: [],
      comics: [],
      comments: []
    });
      newUser.save();
      console.log("A new user " + n + " has been added!");
      return newUser;
  }

  demo(n: string, p: string, e: string, d: string, c: boolean) {
    var newComment = new this.ComicCommentModel({
      author: this.userModel,
      body: "TEST COMMENT",
      date: "0",
      votes: 43
    });
    newComment.save();
    console.log("A new comment has been added!");

    var newUser = new this.userModel({
      name: n,
      password: p,
      email: e,
      desc: d,
      contributor: c,
      strips: [],
      comics: [],
      comments: [newComment]
    });
    newUser.save();
    console.log("A new user " + n + " has been added!");
  }
}

export = new UserModel();
