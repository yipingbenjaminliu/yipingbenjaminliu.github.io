/// <reference path="../../shared/interfaces.ts" />

var mongoose = require('mongoose');

class CommentableModel implements Commentable {
  commentableSchema;
  commentableModel;
  comments: ComicComment[];
  
  constructor() {
    this.commentableSchema = mongoose.Schema({
      comments: [mongoose.Schema.ObjectId]
    });
    this.commentableModel = mongoose.model('commentable', this.commentableSchema);
  }
}

export = new CommentableModel();
