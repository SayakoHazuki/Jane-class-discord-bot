const hgd = require('../Utils/hgdUtils')
const terminal = require('../Utils/terminal')
function printLog (type, filename, ...message) {
  if (!message) {
    message = filename
    filename = __filename
  }
  return terminal.print(type, __filename ?? filename, message)
}

const Evt = require('../core/e')

module.exports = class Message extends Evt {
  constructor (client) {
    super(client, 'userUpdate')
  }

  async run (oldUser, newUser) {
    const client = this.client
    printLog(
      'info',
      __filename,
      `user's details are changed,newUser:\n${newUser}`
    )
    updateinfo(newUser)

    async function updateinfo (user) {
      try {
        const mdbclient = hgd.getClient()
        const database = mdbclient.db('jane')
        const collection = database.collection('hgdv2')

        const query = { snowflake: user.id }
        const options = {
          sort: { _id: -1 }
        }
        await collection.findOne(query, options)

        const filter = { name: user.id }
        const updateDocument = {
          $set: {
            avatarURL: user.displayAvatarURL(),
            tag: user.tag
          }
        }
        await collection.updateOne(filter, updateDocument)
      } catch (e) {
        const erro = new Error(e)
        printLog('info', __filename, erro)
        client.channels.cache
          .get('802138894623571979')
          .send(`Caught error:\n${erro}\nwhen logging user info update`)
      }
    }
  }
}
