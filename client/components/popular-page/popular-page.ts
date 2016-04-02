/// <reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />
/// <reference path="../../../shared/interfaces.ts" />
/// <reference path="../../../shared/loading.ts" />
/// <reference path="../../../shared/util.ts" />

@component("popular-page")
@behavior(ModelURLs)
@behavior(SearchUtil)
class PopularPage extends polymer.Base {
  resp: ComicStrip[];
  masonry: any;

  constructor() {
    super();

    $('.bubble').addClass('opening');
    $('h1').addClass('opening2');


    var colors = ["#ccb3ff","#b380ff","#ff99cc", "#99e699"];
    var rand = Math.floor(Math.random()*colors.length);
    setTimeout(function(){
      $('.grid-item').css("background-color", colors[rand]);
      $('.grid-item').css('opacity', '1').addClass('opening2');
    }, 100);
    this.resp = [new LoadingComicStrip()];
  }
  @observe('resp,search')
  layout(resp) {
    var self = this;
    setTimeout(function() {
      new Masonry( self.$.container, { itemSelector: '.grid-item' });
    }, 100);
    var searchable = [];
    resp.forEach(function(strip) {
      if (strip.comic) {
        strip.comictitle = strip.comic.title;
      }
      searchable.push(strip);
    });
    this.searchable = searchable;
  }
}

PopularPage.register();
