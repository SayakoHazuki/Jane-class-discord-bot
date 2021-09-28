const { MongoClient } = require('mongodb')
const mdburi = process.env.MONGO_URI
const mdbclient = new MongoClient(mdburi)
const terminal = require('./terminal')
function printLog (type, filename, ...message) {
  if (!message) {
    message = filename
    filename = __filename
  }
  return terminal.print(type, __filename ?? filename, message)
}
module.exports = { add, npf, subtract, getdata, rd }
async function add (client, msg, action, amount) {
  try {
    await mdbclient.connect()
    const database = mdbclient.db('jane')
    const collection = database.collection('hgd')

    const query = { name: msg.author.id }
    const options = {
      sort: { _id: -1 }
    }
    const userdata = await collection.findOne(query, options)

    const filter = { name: msg.author.id }
    const updateDocument = {
      $set: {
        hgd: Number(userdata.hgd) + Number(amount),
        tag: msg.author.tag,
        avatarURL: msg.author.avatarURL()
      }
    }
    updateDocument.$set[action] = new Date()
    printLog('info', __filename, updateDocument)
    await collection.updateOne(filter, updateDocument)
  } catch (e) {
    const erro = new Error(e)
    printLog('info', __filename, erro)
    client.channels.cache
      .get('802138894623571979')
      .send(
        `Caught error:\n${erro}\nat hgd.js line 30\n\nuser : ${msg.author.tag}\naction : ${action}\ncontent : ${msg.content}\n\n<@&802137944097554482>`
      )
  }
}

async function npf (client, msg, action, amount) {
  try {
    await mdbclient.connect()
    const database = mdbclient.db('jane')
    const collection = database.collection('hgd')

    const newUdata = {
      name: msg.author.id,
      hgd: amount,
      pat: 0,
      files: 0,
      hi: 0,
      rose: 0,
      tea: 0,
      flot: 0,
      tag: msg.author.tag,
      sName: false,
      sClass: false,
      sCNum: false,
      sID: false
    }
    newUdata[action] = new Date()
    await collection.insertOne(newUdata)
  } catch (erro) {
    client.channels.cache
      .get('802138894623571979')
      .send(
        `Caught error:\n${erro}\nat hgd.js line 59\n\nuser : ${msg.author.tag}\naction : ${action}\ncontent : ${msg.content}\n\n<@&802137944097554482>`
      )
  }
}

async function subtract (client, msg, action, amount) {
  try {
    await mdbclient.connect()
    const database = mdbclient.db('jane')
    const collection = database.collection('hgd')

    const query = { name: msg.author.id }
    const options = {
      sort: { _id: -1 }
    }
    const userdata = await collection.findOne(query, options)

    const filter = { name: msg.author.id }
    const updateDocument = {
      $set: {
        hgd: Number(userdata.hgd) - Number(amount),
        tag: msg.author.tag,
        avatarURL: msg.author.avatarURL()
      }
    }
    updateDocument.$set[action] = new Date()
    printLog('info', __filename, updateDocument)
    await collection.updateOne(filter, updateDocument)
  } catch (e) {
    const erro = new Error(e)
    printLog('info', __filename, erro)
    client.channels.cache
      .get('802138894623571979')
      .send(
        `Caught error:\n${erro}\nat hgd.js line 94\n\nuser : ${msg.author.tag}\naction : ${action}\ncontent : ${msg.content}\n\n<@&802137944097554482>`
      )
  }
}

async function getdata (client, msg, action = 'unknown') {
  try {
    await mdbclient.connect()
    const database = mdbclient.db('jane')
    const collection = database.collection('hgd')
    const query = { name: msg.author.id }
    const options = {
      sort: { _id: -1 }
    }
    const data = await collection.findOne(query, options)
    return data
  } catch (e) {
    client.channels.cache
      .get('802138894623571979')
      .send(
        `Caught error:\n${e}\nat hgd.js line 110\n\nuser : ${msg.author.tag}\naction : ${action}\ncontent : ${msg.content}\n\n<@&802137944097554482>`
      )
  }
}

function rd (min, max) {
  const r = Math.random() * (max - min) + min
  return r - (r % 1)
}
