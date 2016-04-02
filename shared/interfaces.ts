// Comic has represents an entire comic and has a number of strips.
interface Comic extends Votable, Commentable {
  title: string;
  authors: User[];
  date: Date;
  latestStrip: ComicStrip;
  numStrips: number;
  strips: ComicStrip[];
}

// ComicStrip represents a comic strip to be displayed to the client.
interface ComicStrip extends Votable, Commentable {
  title: string;
  authors: User[];
  desc: string;
  date: Date;
  img: string;
  zwibbler3: string;
  comic: Comic;
  next: ComicStrip;
  prev: ComicStrip;
}

// ComicComment represents a comment made by a user.
interface ComicComment extends Votable {
  author: User|string;
  body: string;
  date: Date;
}

// User represents a user.
interface User extends Commentable {
  name: string;
  desc: string;
  contributor: boolean;
  strips: ComicStrip[];
  comics: Comic[];
}

// Votable represents a object that can be voted for.
interface Votable {
  votes: number;
}

// Commentable represents an object that can have comments added to.
interface Commentable {
  comments: ComicComment[];
}
