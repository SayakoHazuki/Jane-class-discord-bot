module.exports = class Event {
  constructor (client, name) {
    this.client = client
    this.name = name
  }

  async run (...args) {
    throw new Error(`${this.name} doesn't have a run method.`)
  }
}
