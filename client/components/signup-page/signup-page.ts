/// <reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />
/// <reference path="../../../server/server.ts"/>

@component("signup-page")
class SignUp extends polymer.Base {
  constructor() {
    super();
    $(document).ready(function(){
      $('.bubble').addClass('opening');
      $('.comment-bubble').addClass('opening3');
    });   
  }
}

SignUp.register();