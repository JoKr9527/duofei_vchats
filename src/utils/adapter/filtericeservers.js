// TODO HXF
var utils = require('../utils')
export default function (iceServers, edgeVersion) {
  var hasTurn = false
  iceServers = JSON.parse(JSON.stringify(iceServers))
  return iceServers.filter(function (server) {
    if (server && (server.urls || server.url)) {
      var urls = server.urls || server.url
      if (server.url && !server.urls) {
        utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls')
      }
      var isString = typeof urls === 'string'
      if (isString) {
        urls = [urls]
      }
      urls = urls.filter(function (url) {
        var validTurn = url.indexOf('turn:') === 0 &&
          url.indexOf('transport=udp') !== -1 &&
          url.indexOf('turn:[') === -1 &&
          !hasTurn

        if (validTurn) {
          hasTurn = true
          return true
        }
        return url.indexOf('stun:') === 0 && edgeVersion >= 14393 &&
          url.indexOf('?transport=udp') === -1
      })

      delete server.url
      server.urls = isString ? urls[0] : urls
      return !!urls.length
    }
  })
};
