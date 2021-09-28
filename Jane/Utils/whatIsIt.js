// const { Util } = require("discord.js");
// const terminal = require("./terminal");

const stringConstructor = 'test'.constructor
const arrayConstructor = [].constructor
const objectConstructor = {}.constructor

module.exports = function whatIsIt (object) {
  try {
    JSON.parse(object)
    return 'jsonString'
  } catch (e) {}
  if (object === null) {
    return 'null'
  }
  if (object === undefined) {
    return 'undefined'
  }
  if (object.constructor === stringConstructor) {
    return 'String'
  }
  if (object.constructor === arrayConstructor) {
    return 'Array'
  }
  if (object.constructor === objectConstructor) {
    return 'Object'
  }
  return 'unknown'
}
