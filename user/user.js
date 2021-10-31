const random = require('../lib/helper');

class User {
    constructor(username) {
        this.username = username;
        this.id = random.generateRandomString(5);
        this.collection = [];
    }
};

module.exports = User;