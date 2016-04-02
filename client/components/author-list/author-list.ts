/// <reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />
/// <reference path="../../../shared/interfaces.ts" />
/// <reference path="../../../shared/util.ts" />
/// <reference path="../../../shared/loading.ts" />

@component("author-list")
@behavior(ModelURLs)
class AuthorList extends polymer.Base {

  @property({type: Array, value: []})
  authors: User[];

  constructor() {
    super();
  }
}

AuthorList.register();
