const { test, expect } = require('@jest/globals');
const helper = require('./helper');

test('expect type of generateRandomString to be string', () => {
    randomString = helper.generateRandomString(5);

    expect(typeof(randomString)).toBe('string');

})