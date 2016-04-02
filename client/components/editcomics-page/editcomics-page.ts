// <reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />
/// <reference path="../../../typings/page/page.d.ts" />
/// <reference path="../../../shared/interfaces.ts" />
/// <reference path="../../../shared/util.ts" />
/// <reference path="../../../shared/loading.ts" />

@component("editcomics-page")
class EditComicsPage extends polymer.Base {
  resp: ComicStrip[]

	
	constructor() {
    super();
    $(document).ready(function(){
      $('.bubble').addClass('opening');
      $('h1').addClass('opening2');
      $('h3').addClass('opening3');

    });


  }

  save() {

    var images = this.querySelector('input[type=file]').files;
    var filenames = [];
    var filestrings = [];
    var self = this;

    function readfile(image: file){
      var reader = new FileReader();
      reader.addEventListener("load", function() {
        self.$.updateform.elements.namedItem('filename').value = image.name
        self.$.updateform.elements.namedItem('filestring').value = reader.result
        self.$.updateform.submit()
      }, false)
      if (image) {
        reader.readAsDataURL(image);
      };    
    }

    if (images){
      [].forEach.call(images, readfile);
    }    
    
  }

  deleteconfirm() {
    this.$.deletetoast.open();    
  }

  delete(){
    this.$.deleteform.submit();
  }

  lowertoast(){
    this.$.deletetoast.toggle();
  }

  url(comic: string) {
    return '/api/mycomics/editcomics/'+comic;
  }

  updated(e){
    var comicstrip = e.detail.response["comicstrip"];
    var comic = e.detail.response["comic"];
    comicstrip = comicstrip.substring(0, comicstrip.length - 4);

    var toast = this.$.toast0;
    var raisetoast = toast.cloneNode(true);
    raisetoast.setAttribute("id", comicstrip);
    raisetoast.setAttribute("text", e.detail.response["comicstrip"] + " has been added " + comic);
    this.$.toastarea.appendChild(raisetoast);
    this.$.toastarea.getElementsByTagName("paper-toast")[comicstrip].open()
    
    page('/mycomics/editcomics/'+comic);
  }

  removed(e) {
    page('/mycomics');
  }

}

EditComicsPage.register()
