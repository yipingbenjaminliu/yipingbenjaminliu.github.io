/// <reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />
/// <reference path="../../../typings/page/page.d.ts" />
/// <reference path="../../../shared/interfaces.ts" />
/// <reference path="../../../shared/util.ts" />
/// <reference path="../../../shared/loading.ts" />

@component("mycomics-page")
class MyComicsPage extends polymer.Base {
  resp: Comic[];

	constructor() {
    super();
    $(document).ready(function(){
      $('.bubble').addClass('opening');
      $('h1').addClass('opening2');
      $('h3').addClass('opening3');
      });    
	}

	editURL(title) {
		return '/mycomics/editcomics/' + title;
  }

  create(){
  	this.$.form.submit();
  }

  toggle(){
    this.$.filtersort.toggle()
  }


}

MyComicsPage.register();