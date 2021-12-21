const Mafia = require('./mafianew')
module.exports = class interactionHandler {
  constructor () {
    return undefined
  }

  static handleInteraction (interaction) {
    interaction.deferUpdate()
  }

  static handleMafiaInteraction (interaction) {
    switch (interaction.customId) {
      case 'wolfCount':
      case 'detectiveCount':
      case 'witchCount':
      case 'hunterCount':
      case 'guardCount':
        Mafia.handleInteraction(interaction)
        break
      case 'guardAction':
      case 'detectiveAction':
      case 'wolfAction':
      case 'witchAction':
        Mafia.handleRoleAction(interaction)
        break
    }
  }
}
