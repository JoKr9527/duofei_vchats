// TODO HXF
var utils = require('../utils')
var filterIceServers = require('./filtericeservers')
var shimRTCPeerConnection = require('rtcpeerconnection-shim')
const edgeShim = {
  // TODO HXF
  shimGetUserMedia: require('./getusermedia'),
  shimPeerConnection: function (window) {
    var browserDetails = utils.detectBrowser(window)

    if (window.RTCIceGatherer) {
      if (!window.RTCIceCandidate) {
        window.RTCIceCandidate = function (args) {
          return args
        }
      }
      if (!window.RTCSessionDescription) {
        window.RTCSessionDescription = function (args) {
          return args
        }
      }
      // this adds an additional event listener to MediaStrackTrack that signals
      // when a tracks enabled property was changed. Workaround for a bug in
      // addStream, see below. No longer required in 15025+
      if (browserDetails.version < 15025) {
        var origMSTEnabled = Object.getOwnPropertyDescriptor(
          window.MediaStreamTrack.prototype, 'enabled')
        Object.defineProperty(window.MediaStreamTrack.prototype, 'enabled', {
          set: function (value) {
            origMSTEnabled.set.call(this, value)
            var ev = new Event('enabled')
            ev.enabled = value
            this.dispatchEvent(ev)
          }
        })
      }
    }

    // ORTC defines the DTMF sender a bit different.
    // https://github.com/w3c/ortc/issues/714
    if (window.RTCRtpSender && !('dtmf' in window.RTCRtpSender.prototype)) {
      Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
        get: function () {
          if (this._dtmf === undefined) {
            if (this.track.kind === 'audio') {
              this._dtmf = new window.RTCDtmfSender(this)
            } else if (this.track.kind === 'video') {
              this._dtmf = null
            }
          }
          return this._dtmf
        }
      })
    }
    // Edge currently only implements the RTCDtmfSender, not the
    // RTCDTMFSender alias. See http://draft.ortc.org/#rtcdtmfsender2*
    if (window.RTCDtmfSender && !window.RTCDTMFSender) {
      window.RTCDTMFSender = window.RTCDtmfSender
    }

    var RTCPeerConnectionShim = shimRTCPeerConnection(window,
      browserDetails.version)
    window.RTCPeerConnection = function (config) {
      if (config && config.iceServers) {
        config.iceServers = filterIceServers(config.iceServers)
      }
      return new RTCPeerConnectionShim(config)
    }
    window.RTCPeerConnection.prototype = RTCPeerConnectionShim.prototype
  },
  shimReplaceTrack: function (window) {
    // ORTC has replaceTrack -- https://github.com/w3c/ortc/issues/614
    if (window.RTCRtpSender &&
      !('replaceTrack' in window.RTCRtpSender.prototype)) {
      window.RTCRtpSender.prototype.replaceTrack =
        window.RTCRtpSender.prototype.setTrack
    }
  }
}
export {edgeShim}
