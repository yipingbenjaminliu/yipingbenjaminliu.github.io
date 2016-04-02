// <reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />
/// <reference path="../../../typings/page/page.d.ts" />
/// <reference path="../../../shared/interfaces.ts" />
/// <reference path="../../../shared/util.ts" />
/// <reference path="../../../shared/loading.ts" />

@component("editcomic-strip")
class EditComicStrip extends polymer.Base {

  @property({ type: Object, value: ""})
  strip: Object;

	constructor() {
    super();
    
  }

  comicstripupdate() {
    this.$.updateform.submit();

  }

  comicstripdelete(){
    this.$.deleteform.submit();
  }

  url(comic: string) {
    return '/api/mycomics/editcomics/comicstrip/'+comic;
  }

  comicstripupdated(e){
    this.$.reload();
  }

  comicstripsremoved(e){
    this.$.reload();
  }


}

EditComicStrip.register()
