/// <reference path="interfaces.ts" />

class ModelURLs {
  authorURL(author: User) {
    if (!author) {
      return "";
    }
    return "/author/"+author.name;
  }
  comicURL(comic: Comic) {
    if (!comic) {
      return "";
    }
    return "/comic/"+comic.title;
  }
  stripURL(comic: Comic, strip: ComicStrip) {
    if (!comic || !strip) {
      return "";
    }
    return this.comicURL(comic) + '/' + strip.title;
  }
}
class UserUtil {
  contributor(user: User) {
    return user && user.contributor;
  }
}
class SearchUtil {
  results(search, a, b) {
    if (search && search.length > 0) {
      return a;
    }
    return b;
  }
}
