var mongoose = require('mongoose');

class Database {
  db;
  constructor() {
    this.db = mongoose.connection;
    mongoose.connect('mongodb://localhost:27017/wafflesdata');
    this.db = mongoose.connection;
    this.db.on('error', console.error.bind(console, 'connection error:'));
    this.db.once('open', function() {
      console.log("connected to mongoDB from database.ts");
    });
  }

  getDatabase() {
    return this.db;
  }
}

export = new Database();
