/// <reference path="../../shared/interfaces.ts" />

import UserModule = require('./user');
var mongoose = require('mongoose');

class ComicCommentModel implements ComicComment {
  comicCommentSchema;
  comicCommentModel;
  author: User;
  body: string;
  date: Date;
  votes: number;
  constructor() {
    this.comicCommentSchema = mongoose.Schema({
      author: mongoose.Schema.ObjectId,
      body: String,
      date: Date,
      votes: Number
    });
    this.comicCommentModel = mongoose.model('comiccomment', this.comicCommentSchema);
  }

  getModel(){
    return this.comicCommentModel;
  }

  addComment(author: User, comment: string) {
    var newComment = new this.comicCommentModel({
      author: author._id,
      body: comment,
      date: new Date(),
      votes: 0,
    });
    newComment.save();
    return newComment;
  }
}

export = new ComicCommentModel();
