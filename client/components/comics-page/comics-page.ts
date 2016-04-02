/// <reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />
/// <reference path="../../../shared/interfaces.ts" />
/// <reference path="../../../shared/loading.ts" />
/// <reference path="../../../shared/util.ts" />

@component("comics-page")
@behavior(ModelURLs)
@behavior(SearchUtil)
class ComicsPage extends polymer.Base {
  resp: Comic[];
  constructor() {
    super();

    $('.bubble').addClass('opening');
    $('h1').addClass('opening2');
    this.resp = [new LoadingComic()];
  }

  sort(a, b) {
    return new Date(b.date) - new Date(a.date);
  }
}
ComicsPage.register();
