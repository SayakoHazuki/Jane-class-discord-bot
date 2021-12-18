const terminal = require('../Utils/terminal')
function printLog (type, filename, ...message) {
  if (!message) {
    message = filename
    filename = __filename
  }
  return terminal.print(type, __filename ?? filename, message)
}

module.exports = function dmHandler (message, client) {
  const channel = client.channels.cache.get(client.modChannelID)

  if (message.author === client.user) {
    return channel?.send?.(
      `${message.author.tag} ( 簡 ) 回覆了 ${message.channel.recipient.tag} :` +
        '\n' +
        message.content
    )
  }

  printLog('info', __filename,
    `${message.author.tag} (` +
      message.author.id +
      ') said:' +
      '\n' +
      message.content
  )

  channel?.send(
    `${message.author.tag} (` +
      message.author.id +
      ') 私訊了簡:' +
      '\n' +
      message.content
  )
}
