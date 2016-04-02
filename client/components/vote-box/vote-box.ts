/// <reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />
/// <reference path="../../../shared/interfaces.ts" />
/// <reference path="../../../shared/util.ts" />
/// <reference path="../../../shared/loading.ts" />

@component("vote-box")
@behavior(ModelURLs)
class VoteBox extends polymer.Base {
  @property({ type: Object, value: {} })
  votable: Votable;
  @property({ type: String, value: '' })
  url: string;
  voteDir: number;
  constructor() {
    super();
    console.log('votable', this.votable);
  }
  @observe('votable')
  ensureNumber(votable: Votable) {
    if (!votable.votes) {
      this.set('votable.votes', 0);
    }
  }
  up() {
    this.vote(1);
  }
  down() {
    this.vote(-1);
  }
  vote(dir: number) {
    if (this.voteDir != dir) {
      this.$.vote.body = {dir:dir};      
      this.$.vote.generateRequest();
      this.set('votable.votes', this.votable.votes+dir);
    }
    this.voteDir = dir;
  }
}
VoteBox.register();
