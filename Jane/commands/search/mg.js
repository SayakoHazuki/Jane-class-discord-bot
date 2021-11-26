const request = require('request')
const chineseConv = require('chinese-conv')

//  const Discord = require('discord.js')
const Util = require('utils')
const Command = require('cmd')

module.exports = class MoegirlCommand extends Command {
  constructor (client) {
    super(client, {
      name: '萌百',
      aliases: ['萌娘', '萌娘百科', 'moegirl'],
      category: '搜尋',
      description: '搜索萌娘百科',
      usage: '萌百 <關鍵詞>',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    try {
      if (!args[0]) return message.reply('請註明您希望簡搜尋的詞彙')

      const search = chineseConv.sify(message.content.replace(`${message.content.split(' ')[0]} `, '').replace(/\s/g, '_'))

      const resultmsg = await message.reply('請稍等, 簡正在搜尋萌百資料庫......')
      request(`https://zh.moegirl.org.cn/api.php?action=query&titles=${encodeURIComponent(search)}&prop=revisions&rvprop=content&format=json`, { json: true }, (err, res, body) => {
        if (err) {
          const hErr = new Error(err)
          Util.handleErr(hErr)
          if (err.code === 'ERR_UNESCAPED_CHARACTERS') return resultmsg.edit('很抱歉, 簡 目前在萌百只能搜索英文的關鍵詞')
          resultmsg.edit(`簡在萌百找不到${search}的頁面`)
          return Util.printLog('err', __filename, err)
        }

        Util.printLog('info', __filename, body)
        const id = (Object.keys(body.query.pages)[0])
        if (id == null) return resultmsg.edit(`簡在萌百找不到${search}的頁面`)
        if (body.query.pages[id] == null) return resultmsg.edit(`簡在萌百找不到${search}的頁面`)
        if (body.query.pages[id].revisions == null) return resultmsg.edit(`簡在萌百找不到${search}的頁面`)
        if (body.query.pages[id].revisions[0] == null) return resultmsg.edit(`簡在萌百找不到${search}的頁面`)
        const pre = (body.query.pages[id].revisions[0]['*'])
        if (pre == null) return resultmsg.edit(`簡在萌百找不到${search}的頁面`)
        const rep = pre
          .replace(/{{[^人黑}]*}}|\[http.*?\u0020|\](?<=\[https[^[]*)|\[{2}[^\]]*?\||\]{2}(?<=\|[^[]*)|[[\]]|<gallery>.*<\/gallery>/gs, '')
          .replace(/\*/g, '-') // * -> -
          .replace(/(?<={{黑幕\|[^}]*)(}})|{{黑幕\|/g, '||') // {{黑幕|*}} -> {{黑幕|*||
          .replace(/'''/g, '**') // ''' -> **
          .replace(/<\/?del>/g, '~~') // <del> -> ~~
          .replace(/<\/?s>/g, '~~') // <del> -> ~~
          .replace(/<br\u0020\/>/g, '\n') // <br /> -> (line break)
          .replace(/====/g, '__') // ==== -> __
          .replace(/===/g, '__') // === -> __
          .replace(/==/g, '__') // == -> __
          .replace(/\/(?=[^=/]*=)/g, '') // /*= -> *=
          .replace(/\{[^|}]*?\}/gs, '') // {*} -> (remove)
          .replace(/<.*?>/gs, '') // <*> -> remove
          .replace(/[{}]/g, '') // { and } -> (remove)
          .replace(/[[\]]/g, '') // [ and ] -> (remove)
          .replace(/\n\s*\n/g, '\n')
          .replace(/\n\|/gs, '\n> ')
          .replace(/\n::/gs, '\n\u0020\u0020\u0020\u0020\u0020\u0020\u0020\u0020')
          .replace(/\n:/gs, '\n\u0020\u0020\u0020\u0020')
          .match(/[\s\S]{1,1900}/g)
        const final = chineseConv.tify(`${''}${search}\n\n${rep[0]}${''}${(rep.length >= 2 ? '...\n查看完整內容:' : '\n網址:')} https://zh.moegirl.org.cn/${search}`)
        resultmsg.edit(final)
      })
    } catch (e) {
      Util.handleErr(e)
      Util.printLog('err', __filename, e)
    }
  }
}
