module.exports = class Command {
  constructor (client, ops) {
    this.client = client
    this.name = ops.name
    this.aliases = ops.aliases
    this.category = ops.category
    this.description = ops.description
    this.usage = ops.usage
    this.cooldown = ops.cooldown
    this.minArgs = ops.minArgs
    this.maxArgs = ops.maxArgs
    this.devOnly = ops.devOnly
    this.authorPermission = ops.authorPermission
    this.clientPermission = ops.clientPermission
  }

  async run (message, args) {
    throw new Error(`${this.name} is missing a run method.`)
  }
}
