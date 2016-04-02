/// <reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />
/// <reference path="../../../typings/page/page.d.ts" />

@component("home-page")
class HomePage extends polymer.Base {
  constructor() {
    super();
    $(document).ready(function(){
      $('.bubble').addClass('opening');
      $('h1').addClass('opening2');
      $('h3').addClass('opening2');
      $('.link').addClass('opening3');
    });
  }
}

HomePage.register();