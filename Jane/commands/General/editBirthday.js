const Discord = require('discord.js')
const Command = require('../../core/command')
const Util = require('../../Utils/index.js')

module.exports = class editBirthdayCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'editBirthday',
      aliases: ['editbd', 'bd'],
      category: '一般',
      description: '修改生日資訊',
      usage: 'editbd <日期> [學號]',
      minArgs: 1,
      maxArgs: 2
    })
  }

  async run (message, args) {
    let id
    const client = this.client
    if (!args[0]) return
    if (args[1]) {
      if (isNaN(args[1])) {
        id = message.author.id
        return message.reply('所輸入的學號錯誤 (用法:`-bd (日期) (學號[選填])`')
      }
      if (Number(args[1]) < 1 || Number(args[1]) > 31) {
        id = message.author.id
        return message.reply(`找不到學號 "${args[1]}"`)
      }
      id = `${args[1]}.`
    } else {
      id = message.author.id
    }
    let update = false
    if (args[0] === '-update') update = true
    try {
      const channel = client.channels.cache.get('815780459660705842')
      const bdmsg = await channel.messages.fetch('816587168134070284')
      const oldcontent = bdmsg.embeds[0].description
      const content = oldcontent.replace(/\u3010\u3011/g, '\u3010 \u3011')
      let newcontent
      if (update) {
        newcontent = content.replace('800515243515314176', '799266168846024714')
        const updateEmbed = new Discord.MessageEmbed()
          .setDescription(newcontent)
          .setColor('#96f3c7')
        return bdmsg.edit(updateEmbed)
      } else {
        newcontent = content
          .split(id)[1]
          .replace(/(?<=\u3010).*(?=\u3011)/, args[0])
      }
      const embed = new Discord.MessageEmbed()
        .setDescription(`${content.split(id)[0]}${id}${newcontent}`)
        .setColor('#96f3c7')
      bdmsg.edit(embed)
      message.react('806372978345771038')
    } catch (e) {
      Util.handleErr(e)
      message.reply('編輯日期資訊的時候發生了一個錯誤, 詳情請聯絡程序員')
      client.channels.cache
        .get('802138894623571979')
        .send(
          `Caught error:\n${e}\nwhen editing birthday infor\n\nuser : ${message.author.tag}\nCommand content : ${message.content}\n\n<@&802137944097554482>`
        )
    }

    // const embed = new Discord.MessageEmbed()
    // .setDescription('01.  <@769086613786722314>【15/4】\n02. <@802786391322001469>【16/9】\n03. <@799264695034707988>【28/3】\n04. <@800592458278240276>【29/11】\n05. <@806367750196035584> 【11/10】\n06. <@766545469194371082> & <@764068388329750528>【28/4】\n07. <@490836744112177180> 【29/10】\n08. <@800515243515314176>【17/5】\n09. <@802010064063037472>【】\n10. <@795624179571359804>【15/11】\n11. <@800515901798875156> 【28/6】\n12. <@799268087114367027> 【21/3】\n13. <@801669430550855702>【1/6】\n14. <@783111429804392499>【1/3】\n15. <@747333169824661595>【10/5】\n16. <@794181749432778753> 【28/2】\n17. <@800588326419562516> 【01/08】\n18. <@799993590226616330>【18/06】\n19. <@798112292314415124> 【9/3】\n20. <@726439536401580114> 【4/9】\n21. <@800660561787748383>【13/5】\n22. <@800396263996129281>【23/4】\n23. <@736080991025758330>【】\n24. <@816524323362963467>【】\n25. <@799642792140734524> 【26/1】\n26. <@690822196972486656> & <@741164325854773258> 【19/9】\n27. <@714171477347401759>【22/06】\n28. <@800726134937485322>【11/7】\n29. <@800593631161352192> 【19/10】\n30. <@745282563622567979>【14/5】\n31. <@703583818787061801>【11/2】\n')
    // .setColor('#0ff')
  }
}
