export default function (window) {
  var navigator = window && window.navigator

  var shimError_ = function (e) {
    return {
      name: {PermissionDeniedError: 'NotAllowedError'}[e.name] || e.name,
      message: e.message,
      constraint: e.constraint,
      toString: function () {
        return this.name
      }
    }
  }

  // getUserMedia error shim.
  var origGetUserMedia = navigator.mediaDevices.getUserMedia
    .bind(navigator.mediaDevices)
  navigator.mediaDevices.getUserMedia = function (c) {
    return origGetUserMedia(c).catch(function (e) {
      return Promise.reject(shimError_(e))
    })
  }
}
