import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // ========== Authorization ==========

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ========== User Watchlist ==========

  let watchlists = Map.empty<Principal, List.List<Text>>();

  public query ({ caller }) func getWatchlist() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view watchlists");
    };
    switch (watchlists.get(caller)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public shared ({ caller }) func addToWatchlist(symbol : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify watchlists");
    };
    let list = switch (watchlists.get(caller)) {
      case (null) { List.empty<Text>() };
      case (?existing) { existing };
    };
    if (not list.contains(symbol)) {
      list.add(symbol);
      watchlists.add(caller, list);
    };
  };

  public shared ({ caller }) func removeFromWatchlist(symbol : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify watchlists");
    };
    switch (watchlists.get(caller)) {
      case (null) {};
      case (?list) {
        let filtered = list.values().filter(func(s) { s != symbol });
        let newList = List.fromIter(filtered);
        watchlists.add(caller, newList);
      };
    };
  };

  public shared ({ caller }) func clearWatchlist() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify watchlists");
    };
    watchlists.add(caller, List.empty<Text>());
  };

  // ========== Articles/Insights ==========

  type Article = {
    title : Text;
    body : Text;
    author : Text;
    timestamp : Int;
    published : Bool;
  };

  module Article {
    public func compare(article1 : Article, article2 : Article) : Order.Order {
      Int.compare(article2.timestamp, article1.timestamp);
    };
  };

  let articles = Map.empty<Principal, List.List<Article>>();

  public shared ({ caller }) func createArticle(title : Text, body : Text, author : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create articles");
    };
    let article : Article = {
      title;
      body;
      author;
      timestamp = Time.now();
      published = false;
    };
    let list = switch (articles.get(caller)) {
      case (null) { List.empty<Article>() };
      case (?existing) { existing };
    };
    list.add(article);
    articles.add(caller, list);
  };

  public shared ({ caller }) func publishArticle(timestamp : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can publish articles");
    };
    let list = switch (articles.get(caller)) {
      case (null) { Runtime.trap("Article not found") };
      case (?existing) {
        let updatedArticles = existing.values().map(
          func(article) {
            if (article.timestamp == timestamp) {
              { article with published = true };
            } else {
              article;
            };
          }
        );
        List.fromIter<Article>(updatedArticles);
      };
    };
    articles.add(caller, list);
  };

  public query func getPublishedArticles() : async [Article] {
    // Published articles are viewable by anyone, including guests
    let allArticles = articles.values().flatMap(
      func(list) {
        list.values();
      }
    );
    let publishedArticles = allArticles.filter(
      func(article) {
        article.published;
      }
    );
    publishedArticles.toArray().sort();
  };

  public query ({ caller }) func getOwnArticles() : async [Article] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view own articles");
    };
    switch (articles.get(caller)) {
      case (null) { [] };
      case (?existing) {
        existing.toArray().sort();
      };
    };
  };

  // ========== HTTP Outcalls ==========

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    // No authorization check - this is called by the system for HTTP outcalls
    OutCall.transform(input);
  };

  public shared ({ caller }) func fetchStockQuote(symbol : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch stock quotes");
    };
    let url = ("https://query1.finance.yahoo.com/v8/finance/chart/".concat(symbol).concat("?interval=1d&range=5d"));
    await OutCall.httpGetRequest(url, [], transform);
  };

  public shared ({ caller }) func fetchFinancialNews(symbol : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch financial news");
    };
    let url = ("https://query1.finance.yahoo.com/v1/finance/search?q=".concat(symbol).concat("&newsCount=5"));
    await OutCall.httpGetRequest(url, [], transform);
  };

  public shared ({ caller }) func fetchMarketSummary() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch market summary");
    };
    let url = "https://query1.finance.yahoo.com/v7/finance/quote?symbols=%5EGSPC,%5EIXIC,%5EDJI,BTC-USD";
    await OutCall.httpGetRequest(url, [], transform);
  };
};
