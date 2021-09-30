const Evt = require('../core/e')
const Util = require('utils')
const { MessageEmbed } = require('discord.js')

module.exports = class Ready extends Evt {
  constructor (client) {
    super(client, 'ready')
  }

  async run () {
    /* this.client.user
      .setActivity('現已開放程式原始碼: https://github.com/Kai9073/jane', { type: 'PLAYING' })
      .then(presence => console.log('Status set'))
      .catch(console.error)
      */

    Util.printLog(
      'info',
      __filename,
      'Finished loading client - bot has started'
    )

    this.client.player.on('botDisconnect', message => {
      Util.printLog('INFO', __filename, 'Player emitted botDisconnect Event')
      Util.printLog(
        'INFO',
        __filename,
        `Message > ${message.author.tag} : ${message.content}`
      )
    })

    this.client.player.on('error', (error, message) => {
      message.inlineReply(
        Util.errEmbed(message, `發生了一個錯誤\n\`${error}\``)
      )
      Util.printLog('ERR', __filename, error)
      Util.printLog(
        'INFO',
        __filename,
        `Message > ${message.author.tag} : ${message.content}`
      )
    })

    this.client.player.on('noResults', (message, query) => {
      Util.printLog('INFO', __filename, 'Player emitted noResults Event')
      const noResultsEmbed = new MessageEmbed()
        .setDescription(
          `<:redcross:842411993423413269> 找不到歌名為${query}的歌曲`
        )
        .setColor(this.client.colors.red)
      message.inlineReply(noResultsEmbed)
      Util.printLog(
        'INFO',
        __filename,
        `Message > ${message.author.tag} : ${message.content}`
      )
    })

    this.client.player.on('playlistAdd', (message, queue, playlist) => {
      Util.printLog('info', __filename, 'Player emitted playlistAdd Event')
      Util.printLog('info', __filename, playlist)
      const playlistAddEmbed = new MessageEmbed()
        .setDescription(
          `:white_check_mark: 已經把 ${playlist.title} 內共${playlist?.tracks?.length}首歌曲加入播放清單`
        )
        .setColor(this.client.colors.green)
      message.inlineReply(playlistAddEmbed)
      Util.printLog(
        'INFO',
        __filename,
        `Message > ${message.author.tag} : ${message.content}`
      )
    })

    this.client.player.on('playlistParseEnd', (playlist, message) => {
      Util.printLog('INFO', __filename, 'Player emitted playlistParseEnd Event')
      Util.printLog(
        'INFO',
        __filename,
        `Message > ${message.author.tag} : ${message.content}`
      )
    })

    this.client.player.on('playlistParseStart', (playlist, message) => {
      Util.printLog(
        'INFO',
        __filename,
        'Player emitted playlistParseStart Event'
      )
      message.inlineReply(':mag: 正在載入播放清單資訊')
      Util.printLog(
        'INFO',
        __filename,
        `Message > ${message.author.tag} : ${message.content}`
      )
    })

    this.client.player.on('queueEnd', (message, queue) => {
      Util.printLog('INFO', __filename, 'Player emitted queueEnd Event')
      const queueEndEmbed = new MessageEmbed()
        .setDescription('<:leave:842411018503061554> 所有歌曲已播放完畢')
        .setColor(this.client.colors.red)
      message.channel.send(queueEndEmbed)
      Util.printLog(
        'INFO',
        __filename,
        `Message > ${message.author.tag} : ${message.content}`
      )
    })

    this.client.player.on('searchCancel', (message, query, tracks) => {
      Util.printLog('INFO', __filename, 'Player emitted searchCancel Event')
      message.inlineReply(
        `搜尋\`${query}\`時載入過長, 請稍後再試\n(如情況持續可聯絡程序員)`
      )
      Util.printLog(
        'INFO',
        __filename,
        `Message > ${message.author.tag} : ${message.content}`
      )
    })

    this.client.player.on(
      'searchInvalidResponse',
      (message, query, tracks, invalidResponse, collector) => {
        Util.printLog(
          'INFO',
          __filename,
          'Player emitted searchInvalidResponse Event'
        )
        message.inlineReply(Util.errEmbed(message, '發生了一個預期外的錯誤'))
        Util.printLog(
          'INFO',
          __filename,
          `Message > ${message.author.tag} : ${message.content}`
        )
      }
    )

    this.client.player.on(
      'searchResults',
      (message, query, tracks, collector) => {
        Util.printLog('INFO', __filename, 'Player emitted searchResults Event')
        Util.printLog(
          'INFO',
          __filename,
          `Message > ${message.author.tag} : ${message.content}`
        )
      }
    )

    this.client.player.on('trackAdd', (message, queue, track) => {
      Util.printLog('INFO', __filename, 'Player emitted trackAdd Event')
      const trackAddEmbed = new MessageEmbed()
        .setAuthor('歌曲已加入播放列表', track.requestedBy.displayAvatarURL)
        .setDescription(
          `[${track.title}](${track.url})\n:clock7: 長度 > ${track.duration}`
        )
        .setColor(this.client.colors.green)
      message.inlineReply(trackAddEmbed)
      Util.printLog(
        'INFO',
        __filename,
        `Message > ${message.author.tag} : ${message.content}`
      )
    })

    this.client.player.on('trackStart', (message, track) => {
      const queue = this.client.player.getQueue(message).tracks
      Util.printLog('info', __filename, queue[1])
      Util.printLog('info', __filename, track)
      Util.printLog('INFO', __filename, 'Player emitted trackStart Event')
      const trackStartEmbed = new MessageEmbed()
        .setAuthor('正在播放', track.requestedBy.displayAvatarURL)
        .setDescription(
          `[${track.title}](${track.url})\n\n:clock7: > ${track.duration}\n<:profile:842405731591913492> > ${track.requestedBy.tag}`
        )
        .setColor(this.client.colors.blue)
        .setThumbnail(track.thumbnail)
      if (queue[1]) {
        trackStartEmbed.setFooter(
          `下一首 : ${queue[1]?.title}`,
          queue[1]?.thumbnail
        )
      }
      message.channel.send(trackStartEmbed)
      Util.printLog(
        'INFO',
        __filename,
        `Message > ${message.author.tag} : ${message.content}`
      )
    })
  }
}
