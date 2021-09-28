const { MongoClient } = require('mongodb')
const mdburi = process.env.MONGO_URI
const mdbclient = new MongoClient(mdburi)

const terminal = require('../Utils/terminal')
function printLog (type, filename, ...message) {
  if (!message) {
    message = filename
    filename = __filename
  }
  return terminal.print(type, __filename ?? filename, message)
}

// Getdata function
async function getdata (client, userID) {
  try {
    await mdbclient.connect()
    const database = mdbclient.db('jane')
    const collection = database.collection('hgd')
    const query = { name: userID }
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
    printLog('err', __filename, e)
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
    printLog('info', __filename, `Creating profile for userID ${userID}`)
    await mdbclient.connect()
    const database = mdbclient.db('jane')
    const collection = database.collection('hgd')

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
    printLog('info', __filename, erro)
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
    printLog('info', __filename, 'Getting data from MongoDB')
    const userData = await getdata(this.mainClient, this.discordID)
    printLog('Success')
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
      await mdbclient.connect()
      const database = mdbclient.db('jane')
      const collection = database.collection('hgd')
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
      printLog('info', __filename, updateDocument)
      await collection.updateOne(filter, updateDocument)
      this[item] = value
      return this
    } catch (e) {
      const erro = new Error(e)
      printLog('info', __filename, erro)
      this.client.channels.cache
        .get('802138894623571979')
        .send(
          `Caught error:\n${erro}\nat user.js line 122\n\nuserID : ${this.discordID}\n\n<@&802137944097554482>`
        )
    }
  }
}
