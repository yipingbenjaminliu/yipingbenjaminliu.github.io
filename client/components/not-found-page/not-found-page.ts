/// <reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />
/// <reference path="../../../typings/page/page.d.ts" />

@component("not-found-page")
class NotFoundPage extends polymer.Base {
  url: string;

  constructor() {
    super();
  }
}

NotFoundPage.register();
