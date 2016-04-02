/// <reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />
/// <reference path="../../../typings/page/page.d.ts" />
/// <reference path="../../../shared/interfaces.ts" />
/// <reference path="../../../shared/util.ts" />
/// <reference path="../../../shared/loading.ts" />

@component("comic-overview-page")
@behavior(ModelURLs)
@behavior(UserUtil)
class ComicOverviewPage extends polymer.Base {
  resp: Comic;

  @property({type: Object, value: {}})
  params: { [s: string]: string};

  constructor() {
    super();

    this.resp = new LoadingComic();
  }

  url(comic: string) {
    return '/api/comic/'+comic;
  }
  commentURL(comic: string) {
    return '/api/comic/'+comic+'/comment';
  }
  create() {
    this.$.form.submit();
  }
  submitted(e) {
    var strip = e.detail.response;
    page(this.stripURL(this.resp, strip));
  }
}

ComicOverviewPage.register();
