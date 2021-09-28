module.exports = class splitter {
  static splitCode (message, str, code) {
    if (!message) return
    try {
      const splitRegex = code === 'none' ? /[\s\S]{1,1960}/g : /[\s\S]{1,1940}/g
      const sendarr = str.match(splitRegex)
      let i
      for (i = 0; i < sendarr.length; i++) {
        if (code === 'none') message.inlineReply(sendarr[i])
        else message.inlineReply(sendarr[i], { code: code })
      }
    } catch (e) {
      message.inlineReply(e, { code: 'xl' })
    }
  }
}
