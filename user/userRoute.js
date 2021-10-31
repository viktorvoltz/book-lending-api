const User = require('./user');
const userUtil = require('./userFileUtil');
const fileUtil = require('../lib/fileUtil');


let userRouteHandler = {}

userRouteHandler.User = (data, callback) => {
  const acceptableHeaders = ["post", "get", "put"];
  if (acceptableHeaders.indexOf(data.method) > -1) {
    userRouteHandler._users[data.method](data, callback);
  } else {
    callback(405);
  }
};
//main user route object
userRouteHandler._users = {};

//create new user
userRouteHandler._users.postt = (data, callback) => {
  const newUser = new User(data.payload.username);
  const userId = newUser.id;

  userUtil.create('user', userId, newUser, (err) => {
    if (!err) {
      callback(200, { message: "new user", data: null });
    } else {
      callback(400, { message: "could not add user" });
    }
  });
};

userRouteHandler._users.post = (data, callback) => {

  if (data.query.name && data.query.userid) {
    userUtil.read('users', data.query.userid, (err, user) => {
      if (!user) {
        callback(404, { message: "user not found" })
        return
      }
      if (user.collection.indexOf(data.query.name) > -1) {

        fileUtil.read('books', data.query.name, (err, book) => {
          if (!err) {
            book.copies += 1
            const updatedBook = JSON.stringify(book)
            fileUtil.update('userCollection', data.query.name, updatedBook, (msg) => {
              if (msg) {

                const returnedBookIndex = user.collection.indexOf(data.query.name)
                user.collection.splice(returnedBookIndex, 1)
                const updatedUser = JSON.stringify(user)
                userUtil.update('users', data.query.userid, updatedUser, (msg) => {
                })
                callback(200, { message: "Book returned successfully" })
              }
            });
            // remove book from file
            fileUtil.delete('books', data.query.name, (err) => {
              if (!err) {
                callback(200, { message: 'book deleted successfully' });
              } else {
                callback(400, { err: err, message: 'could not delete book' });
              }
            });
          }

        })

      }
    })
  } else {
    userRouteHandler._users.postt(data, callback);
  }

}

userRouteHandler._users.get = (data, callback) => {
  userUtil.read('users', data.query.userid, (err, user) => {
    if (err) {
      callback(404, { message: "user not found" })
      return
    }
    if (user.collection.indexOf(data.query.name) > -1 && data.query.name) {
      callback(401, { message: 'You already borrowed this book' })
    } else {
      fileUtil.read('books', data.query.name, (err, book) => {
        if (!err && book) {

          if (book.copies < 1) {
            callback(404, { message: 'Book unavailable' })
            return
          }
          book.copies -= 1
          const updatedBook = JSON.stringify(book)
          userUtil.update('books', data.query.name, updatedBook, (err, book) => {
            if (!err) {
              callback(200, { message: "resource updated" })
            }
          })

          user.collection.push(data.query.name)
          const updatedUser = JSON.stringify(user)
          userUtil.update('users', data.query.userid, updatedUser, (err, user) => {
            if (!err) {
              callback(200, { message: "user updated" })
            }

          })
          callback(200, { message: 'book borrowed', book });

        } else {
          callback(404, { err: err, data: data, message: 'could not retrieve user' });
        }
      })
    }
  })
}

module.exports = userRouteHandler;