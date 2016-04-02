///<reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />
///<reference path="../../../shared/interfaces.ts" />
///<reference path="../../../shared/loading.ts" />
///<reference path="../../../shared/util.ts" />

@component("comic-page")
@behavior(ModelURLs)
class ComicPage extends polymer.Base {
  resp: ComicStrip;
  editMode: boolean;
  prevItem: ComicStrip;
  nextItem: ComicStrip;
  socket: any;
  zwibblerDirty: boolean;

  constructor() {
    super();
    this.resp = new LoadingComicStrip();
    this.socket = io(window.location.origin);
    this.socket.on('connect', function(){
    });
    var self = this;
    this.socket.on('zwibbler-update', function(data) {
      if (data.page !== page.current) {
        return;
      }
      self.zwibblerDirty = true;
      self.set('resp.img', data.img);
      self.set('resp.zwibbler3', data.update);
      console.log('zwibbler-update!', data);
    });
    this.socket.on('disconnect', function(){});
  }
  url(comic: string, strip: string) {
    return '/api/comic/'+comic+'/'+strip;
  }
  patchURL(comic: string, strip: string) {
    return '/api/comic/'+comic+'/'+strip+'/patch';
  }
  voteURL(comic: string, strip: string) {
    return '/api/comic/'+comic+'/'+strip+'/vote';
  }
  commentURL(comic: string, strip: string) {
    return '/api/comic/'+comic+'/'+strip+'/comment';
  }
  next(resp: ComicStrip) {
    var item = resp.next;
    if (!item) {
      return null;
    }
    this.nextItem = item;
    return item;
  }
  prev(resp: ComicStrip) {
    var item = resp.prev;
    if (!item) {
      return null;
    }
    this.prevItem = item;
    return item;
  }
  @observe('resp.desc,resp.title')
  updateDetails(desc, title) {
    if (!this.editMode) {
      return;
    }
    this.$.patch.body = {
      desc: desc,
      title: title,
    };
    this.$.patch.generateRequest();
  }

  @observe('resp.zwibbler3')
  updatedComic(zwibbler3) {
    if (!this.editMode) {
      return;
    }
    if (this.zwibblerDirty) {
      this.zwibblerDirty = false;
      return;
    }
    this.$.patch.body = {
      zwibbler3: zwibbler3,
      img: this.resp.img,
    };
    this.$.patch.generateRequest();
    this.socket.emit('zwibbler-update', {
      page: page.current,
      update: zwibbler3,
      img: this.resp.img,
    });
  }
  err(err) {
    alert('error');
    console.log(err);
  }
}

ComicPage.register();
