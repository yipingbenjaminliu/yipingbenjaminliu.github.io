/// <reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />
/// <reference path="../../../shared/interfaces.ts" />
/// <reference path="../../../shared/util.ts" />
/// <reference path="../../../shared/loading.ts" />

@component("authors-page")
@behavior(ModelURLs)
@behavior(SearchUtil)
class AuthorsPage extends polymer.Base {
  resp: User[];
  constructor() {
    super();
    this.resp = [new LoadingUser()];
	$(document).ready(function(){
      $('bubble').addClass('opening');
      $('h1').addClass('opening2');
      $('form').addClass('opening2');
      $('#authorlist').addClass('opening3');
    });
  }
  contributor(user: User) {
    return user.contributor || user.strips.length > 0;
  }
}
AuthorsPage.register();
