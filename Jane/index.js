require('module-alias/register')
require('dotenv').config()

require('./core/structures')

const Client = require('./core/client.js')
const client = new Client()

const { Player, AudioFilters } = require('discord-player')
const player = new Player(client)

console.log('Waking Jane up - NodeJS', process.version)
if (process.version === 'v12.22.1') throw new Error('bruh')

// filters ===================================
AudioFilters.define('slowerNightcore', 'aresample=48000,asetrate=48000*1.1')
AudioFilters.define('3D', 'apulsator=hz=0.128')
AudioFilters.define(
  'superEqualizer',
  'superequalizer=1b=10:2b=10:3b=1:4b=5:5b=7:6b=5:7b=2:8b=3:9b=4:10b=5:11b=6:12b=7:13b=8:14b=8:15b=9:16b=9:17b=10:18b=10[a];[a]loudnorm=I=-16:TP=-1.5:LRA=14'
)

client.setPlr(player)

client.logIn()
