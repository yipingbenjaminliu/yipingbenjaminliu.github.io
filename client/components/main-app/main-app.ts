/// <reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />
/// <reference path="../../../typings/page/page.d.ts" />

@component("main-app")
class MainApp extends polymer.Base {
  route: string;
  path: string;
  params: {property: string};

  constructor() {
    super();

    document.getElementById('logout').addEventListener('iron-form-response', function(event) {
    logoutToast.open();

    FB.getLoginStatus(function(response) {
    if (response && response.status === 'connected') {
      FB.logout(function(response) {
      document.querySelector('main-app').userDetails = null;
      });
      }
    });
    document.querySelector('#userDetails').generateRequest();
    window.location = '/';
    });
    
    var self = this;

    page('*', function(ctx, next) {
      self.path = ctx.path;
      next();
    });
    page('/', function(ctx, next) {
      self.route = 'home';
    });
    page('/comics', function(ctx, next) {
      self.route = 'comics';
    });
    page('/signup', function(ctx, next) {
      self.route = 'signup';
    });
    page('/login', function(ctx, next) {
      self.route = 'login';
    });
    page('/popular', function(ctx, next) {
      self.route = 'popular';
    });
    page('/profile', function(ctx, next) {
      self.route = 'profile';
    });
    page('/comic/:comic', function(ctx, next) {
      self.route = 'comic-overview';
      self.params = ctx.params;
    });
    page('/comic/:comic/:strip', function(ctx, next) {
      self.route = 'comic';
      self.params = ctx.params;
    });
    page('/authors', function(ctx, next) {
      self.route = 'authors';
    });
    page('/author/:author', function(ctx, next) {
      self.route = 'author';
      self.params = ctx.params;
    });
    page('/new', function(ctx,next) {
      self.route = 'new';
    });
    page('/new/draw', function(ctx,next) {
      self.route = 'draw';
    });
    page('/mycomics', function(ctx,next) {
      self.route = 'mycomics';
    });
    page('/mycomics/editcomics/:strip', function(ctx,next) {
      self.route = 'editcomics';
      self.params = ctx.params;
    });
    page('*', function(ctx, next) {
      self.route = 'not-found';
    });
    page();
  }
}

MainApp.register();
