const Discord = require('discord.js')
const Command = require('cmd')
const Util = require('utils')

module.exports = class linksCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'links',
      aliases: ['link', 'l'],
      category: '資訊',
      description: '顯示常用連結列表',
      usage: 'link',
      minArgs: 0,
      maxArgs: 0
    })
  }

  async run (message, args) {
    const p1 = new Discord.MessageEmbed()
      .setColor('#35baf6')
      .setTitle('上課連結')
      .setDescription(
        '<:zoom:806692711141736458> CHIN\nhttps://zoom.us/j/95631645457?pwd=T1pEV1hQZkhHM3djaW11azRPTkhrQT09\n<:meet:806692710790070283> ENG\nhttps://meet.google.com/lookup/h6w6trj4oi\n<:zoom:806692711141736458> MATH\nhttps://us02web.zoom.us/j/9871298048?pwd=Qytua1NOR2JxTjAxUEJwSWJJcUFqQT09\n<:meet:806692710790070283> IS\nhttps://meet.google.com/lookup/b36yw74urt\n<:meet:806692710790070283> HIST\nhttps://meet.google.com/lookup/bnq7bvrzed\n<:zoom:806692711141736458> CHIST\nhttps://zoom.us/j/98765323879?pwd=VW1EbjR0R3BhNWt0ZnBMQzdVYm9Edz09\n<:meet:806692710790070283> GEOG\nhttps://meet.google.com/lookup/dna6m7nmae\n<:zoom:806692711141736458> L&S\nhttps://zoom.us/j/6263728514?pwd=NXo1U1R4eGxoWmhNUGJsemtOS0J1UT09'
      )
      .setFooter('頁 1/3 | 常用連結', '')
    const p2 = new Discord.MessageEmbed()
      .setColor('#35baf6')
      .setTitle('上課連結')
      .setDescription(
        '\n<:meet:806692710790070283> PE(GIRLS)\nhttps://meet.google.com/lookup/fjuvar3opd\n<:zoom:806692711141736458> PE(BOYS)\nhttps://zoom.us/j/93601024248?pwd=eTh6TGh6ZGVoT1VaNHc3M1hJOXpQdz09\n<:classroom:806692713255927818> VA\nhttps://classroom.google.com/u/0/c/MTUyMTUyMTAxNzAy\n<:meet:806692710790070283> DR\nhttps://meet.google.com/lookup/hm42julsbl\n<:zoom:806692711141736458> IT\nhttps://zoom.us/j/97285239642?pwd=aGVLdklneXAxNWZDSTBhSzZGdFVlQT09\n<:zoom:806692711141736458> PTH\nhttps://zoom.us/j/4464430451?pwd=Z3F1ZWdjbFlYRlRnRnFkbXlzREFTdz09\n<:zoom:806692711141736458> RS\nhttps://zoom.us/j/98547573061?pwd=d1A4em5rV3RGTWFUR1hVSkJTSEJIUT09\n<:zoom:806692711141736458> ASS\n(中文link)https://zoom.us/j/95631645457?pwd=T1pEV1hQZkhHM3djaW11azRPTkhrQT09\n<:zoom:806692711141736458> CTP\n(中文link)https://zoom.us/j/95631645457?pwd=T1pEV1hQZkhHM3djaW11azRPTkhrQT09\n<:zoom:806692711141736458> HE\nhttps://zoom.us/j/96494553885?pwd=bzA4elFGQUNnZFlGTVcwakttNU5hUT09\n<:meet:806692710790070283> SPEAK (Mr.Ho)\nhttps://meet.google.com/lookup/h6w6trj4oi?authuser=0&hs=179\n<:zoom:806692711141736458> SPEAK (NET)\nhttps://zoom.us/j/3444298130?pwd=RFRJUDBqSnVTYmlXWWs1a2NlSi9DQT09\n<:zoom:806692711141736458> MUS\nhttps://us02web.zoom.us/j/4178362893?pwd=S2o4MU1MeGVGNVdYSlE1TUZWZ1R0UT09'
      )
      .setFooter('頁 2/3 | 常用連結', '')
    const p3 = new Discord.MessageEmbed()
      .setColor('#35baf6')
      .setTitle('常用連結')
      .setDescription(
        '<:pn:815741945833979924> [www2.pyc.edu.hk/pycnet](https://www2.pyc.edu.hk/pycnet)\n<:gc:815742035751469056> [classroom.google.com](https://classroom.google.com/a/not-turned-in/all)\n\nMicrobit - https://janesite.ga/micro\nWinMath - https://janesite.ga/winmath\nE-handbook - https://janesite.ga/hw\nScratch - https://janesite.ga/scratch'
      )
      .setFooter('頁 1/1 | 常用連結', '')

    const p32 = new Discord.MessageEmbed()
      .setColor('#35baf6')
      .setTitle('常用連結')
      .setDescription(
        '<:pn:815741945833979924> [www2.pyc.edu.hk/pycnet](https://www2.pyc.edu.hk/pycnet)\n<:gc:815742035751469056> [classroom.google.com](https://classroom.google.com/a/not-turned-in/all)\n\nMicrobit - https://janesite.ga/micro\nWinMath - https://janesite.ga/winmath\nE-handbook - https://janesite.ga/hw\nScratch - https://janesite.ga/scratch'
      )
      .setFooter('頁 1/1 | 常用連結', '')
    const embedArray = [p3, p32]
    try {
      Util.MultiEmbed(message, embedArray)
    } catch (e) {
      Util.handleErr(e)
      return p1 + p2
    }
  }
}
