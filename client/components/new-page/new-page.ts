///<reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />
///<reference path="../../../typings/page/page.d.ts" />
///<reference path="../../../shared/interfaces.ts" />
///<reference path="../../../shared/util.ts" />
///<reference path="../js-deps.html" />

@component("new-page")
@behavior(ModelURLs)
@behavior(UserUtil)
class NewPage extends polymer.Base {
  constructor() {
    super();
    $(document).ready(function(){
      $('.bubble').addClass('opening');
      $('h1').addClass('opening2');
      $('h3').addClass('opening3');
    });    
  }
  create() {
    this.$.form.submit();
  }
  
  submitted(e) {
    var comic = e.detail.response;
    page(this.comicURL(comic));
  }
}

NewPage.register()
