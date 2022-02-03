const Mafia = require('./mafia')
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
      case 'voteAction':
        Mafia.handleVote(interaction)
    }
  }

  static handleMafiaButton (interaction) {
    switch (interaction.customId) {
      case 'startDiscussion':
        Mafia.startDiscussion(interaction)
        break
      case 'startVote':
        Mafia.startVote(interaction)
        break
    }
  }
}
