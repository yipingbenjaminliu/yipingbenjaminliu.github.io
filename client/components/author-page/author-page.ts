/// <reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />
/// <reference path="../../../shared/interfaces.ts" />
/// <reference path="../../../shared/util.ts" />
/// <reference path="../../../shared/loading.ts" />

@component("author-page")
@behavior(ModelURLs)
class AuthorPage extends polymer.Base {
  resp: User;

  @property({type: Object, value: {}})
  params: { [s: string]: string};

  constructor() {
    super();

    var user = new LoadingUser();
    user.strips.push(new LoadingComicStrip());
    user.comments.push(new LoadingComment());
    this.resp = user;
  }

  url(user: string) {
    return '/api/user/'+user
  }
  commentURL(user: string) {
    return '/api/user/'+user+'/comment';
  }
}

AuthorPage.register();
