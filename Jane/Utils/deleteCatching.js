module.exports = function tryDelete (message) {
  const channel = message?.channel
  if (!channel) return
  channel.messages
    .fetch(message.id)
    .then(fetchedMessage => {
      // Message exists
      fetchedMessage.delete().catch(err => {
        if (err) return 998
      })
    })
    .catch(err => {
      if (err.httpStatus === 404) {
        return 404
      } else {
        return 999
      }
    })
}
