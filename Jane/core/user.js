const logger = new (require('../Utils/terminal'))(__filename)

const hgd = require('../Utils/hgdUtils')

// Getdata function
async function getdata (client, userID) {
  try {
    const mdbclient = hgd.getClient()
    const database = mdbclient.db('jane')
    const collection = database.collection('hgdv2')
    const query = { snowflake: userID }
    const options = {
      sort: { _id: -1 }
    }
    const data = await collection.findOne(query, options)
    if (typeof data !== 'undefined' && data) return data
    else {
      const data = await npf(client, userID)
      if (typeof data !== 'undefined' && data) return data
      else {
        throw new Error(
          'data is undefined after profile creation at user.js line 21'
        )
      }
    }
  } catch (e) {
    logger.error(e)
    client.channels.cache
      .get('802138894623571979')
      .send(
        `Caught error:\n${e}\nat user.js line 27\n\nuserID : ${userID}\n\n<@&802137944097554482>`
      )
  }
}

// Profile creator
async function npf (client, userID) {
  try {
    logger.info(`Creating profile for userID ${userID}`)

    const mdbclient = hgd.getClient()
    const database = mdbclient.db('jane')
    const collection = database.collection('hgdv2')

    const newUdata = {
      name: userID,
      hgd: 0,
      pat: 0,
      files: 0,
      hi: 0,
      rose: 0,
      tea: 0,
      flot: 0,
      tag: client.users.cache.get(userID).tag,
      sName: false,
      sClass: false,
      sCNum: false,
      sID: false
    }
    await collection.insertOne(newUdata)
    return newUdata
  } catch (erro) {
    logger.error(erro)
    client.channels.cache
      .get('802138894623571979')
      .send(
        `Caught error:\n${erro}\nat user.js line 60\n\nuserID : ${userID}\n\n<@&802137944097554482>`
      )
  }
}

module.exports = class PYCUser {
  constructor (client, userID) {
    this.mainClient = client
    this.discordID = userID
  }

  async saveData () {
    logger.info('Getting data from MongoDB')
    const userData = await getdata(this.mainClient, this.discordID)
    logger.info('Success')
    this.data = userData
    this.name = userData.sName || false
    this.class = userData.sClass || false
    this.classnum = userData.sCNum || false
    this.pycid = userData.sID || false
    this.sJson = {
      name: this.name,
      class: this.class,
      num: this.classnum,
      pycid: this.pycid,
      dcid: this.discordID
    }
    return this.sJson
  }

  async addInfo (item, value) {
    try {
      const userID = this.discordID
      const mdbclient = hgd.getClient()
      const database = mdbclient.db('jane')
      const collection = database.collection('hgdv2')
      const filter = { name: userID }
      const options = {
        sort: { _id: -1 }
      }
      const userdata = await collection.findOne(filter, options)
      const updateDocument = {
        $set: {
          sName: userdata.sName || false,
          sClass: userdata.sClass || false,
          sCNum: userdata.sCNum || false,
          sID: userdata.sID || false
        }
      }
      updateDocument.$set[item] = value
      logger.info(updateDocument)
      await collection.updateOne(filter, updateDocument)
      this[item] = value
      return this
    } catch (e) {
      const erro = new Error(e)
      logger.info(erro)
      this.client.channels.cache
        .get('802138894623571979')
        .send(
          `Caught error:\n${erro}\nat user.js line 122\n\nuserID : ${this.discordID}\n\n<@&802137944097554482>`
        )
    }
  }
}
