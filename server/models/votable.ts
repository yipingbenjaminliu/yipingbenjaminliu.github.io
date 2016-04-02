/// <reference path="../../shared/interfaces.ts" />

var mongoose = require('mongoose');

class VotableModel implements Votable {
  votableSchema;
  votableModel;
  votes: number;
    
  constructor() {
    this.votableSchema = mongoose.Schema({
      votes: Number
    });
    this.votableModel = mongoose.model('votable', this.votableSchema);
  }
}

export = new VotableModel();
