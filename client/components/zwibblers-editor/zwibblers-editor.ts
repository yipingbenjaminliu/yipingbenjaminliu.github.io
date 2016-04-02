/// <reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />
/// <reference path="../../../typings/page/page.d.ts" />

@component("zwibblers-editor")
class ZwibblersEditor extends polymer.Base {
  zwibbler;

  @property({ type: String, notify: true })
  png: string;

  @property({ type: String, notify: true})
  zwibbler3: string;

  lastZwibbler3: string;

  constructor() {
    super();
  }
  ready() {
    var self = this;
    this.zwibbler = Zwibbler.create(this.$.zwibbler1, {
      showPropertyPanel: true,
      showImageTool: true,
    });
    if (this.zwibbler3) {
      this.change();
    }
    this.zwibbler.on("document-changed", function() {
      console.log('changed');
      self.png = self.zwibbler.save('png');
      var zwibbler3 = self.zwibbler.save('zwibbler3');
      self.lastZwibbler3 = zwibbler3;
      self.zwibbler3 = zwibbler3;
    })
  }
  attached() {
    this.zwibbler.resize();
  }
  @observe('zwibbler3,zwibbler')
  change() {
    console.log('change!');
    if (!this.zwibbler || !this.zwibbler3 || (this.zwibbler3 && this.zwibbler3.length == 0)) {
      return;
    }
    if (this.zwibbler3 != this.lastZwibbler3) {
      console.log('load');
      this.zwibbler.load('zwibbler3', this.zwibbler3);
      this.lastZwibbler3 = this.zwibbler3;
    }
  }
}

ZwibblersEditor.register();
