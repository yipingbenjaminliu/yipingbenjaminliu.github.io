/// <reference path="interfaces.ts" />

// Default loading implementations

class LoadingComic implements Comic {
  title = "Loading...";
  date = new Date();
  authors = [new LoadingUser()];
  latestStrip = new LoadingComicStrip();
  numStrips = 0;
  strips = [this.latestStrip];
  votes = 0;
  comments = [new LoadingComment()];
}

class LoadingStubComic implements Comic {
  title = "Loading...";
  date = null
  authors = [];
  latestStrip = null
  numStrips = 0;
  strips = [];
  votes = 0;
  comments = [];
}

class LoadingComment implements ComicComment {
  author = new LoadingUser();
  body = "Loading...";
  date = new Date();
  votes = 0;
}

class LoadingUser implements User {
  name = "Loading...";
  desc = "Loading...";
  contributor = false;
  strips = [];
  comics = [];
  comments = [];
  votes = 0;
}


class LoadingComicStrip implements ComicStrip{
  title = "Loading...";
  authors = [new LoadingUser()];
  date = new Date();
  desc = "Loading...";
  img = "https://placekitten.com/900/350";
  zwibbler3 = null;
  comic = new LoadingStubComic();
  votes = 0;
  prev = new LoadingComicStripStub();
  next = null;
  comments = [new LoadingComment()];
}

class LoadingComicStripStub implements ComicStrip{
  title = "Loading...";
  authors = [];
  date = null;
  desc = null;
  img = null;
  zwibbler3 = null;
  comic = null;
  votes = 0;
  next = null;
  prev = null;
  comments = [];
}