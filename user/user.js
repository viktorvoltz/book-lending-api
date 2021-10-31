//import { libraryIdGenerator } from '../lib/helper';
const random = require('../lib/helper');

class User {
    constructor(username) {
        this.username = username;
        //this.password = password;
        this.id = random.generateRandomString(5);
        this.collection = [];
    }
};

module.exports = User;