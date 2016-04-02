/// <reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />
/// <reference path="../../../shared/interfaces.ts" />
/// <reference path="../../../shared/util.ts" />
/// <reference path="../../../shared/loading.ts" />

@component("comment-box")
@behavior(ModelURLs)
class CommentBox extends polymer.Base {

  @property({ type: Array, value: [] })
  comments: ComicComment[];

  @property({ type: String, value: '' })
  url: string;

  constructor() {
    super();

    console.log(this.comments)
  }

  resp() {
    window.location.reload();
  }
  voteURL(item: ComicComment) {
    return '/api/comment/'+item._id+'/vote';
  }
  submit() {
    this.$.form.submit();
  }
  err(err) {
    alert('err');
  }
}

CommentBox.register();
