<template>
  <div></div>
</template>

<script>
export default {
  name: 'WebRtcPeerSendrecv',
  props: ['name', 'poster'],
  data: function () {
    const webRtcPeer = null
    return {
      webRtcPeer
    }
  },
  methods: {
    onIceCandidate (candidate) {
      console.log('Local candidate' + JSON.stringify(candidate))
      const message = {
        id: 'onIceCandidate',
        from: this.$store.state.username,
        content: candidate,
        messageType: 'SdpMsg'
      }
      const jsonMessage = JSON.stringify(message)
      console.log('Sending onIceCandidate message: ' + jsonMessage)
      this.$store.commit('sendMsg', jsonMessage)
    },
    onError () {
      console.log('发生了一些错误,待做')
    },
    // 创建收发对等点
    createWebRtcPeer: function (localVideo, remoteVideo, msg, oncandidategatheringdone) {
      let video = false
      let sendSource = 'webcam'
      console.log(this.$store.state.callingType)
      if (this.$store.state.callingType === 2 || this.$store.state.callingType === 3) {
        video = {
          width: 640,
          framerate: 45
        }
      } else if (this.$store.state.callingType === 1) {
        const img = require('../assets/voice240180.jpg')
        this.$emit('posterChange', img)
        console.log(localVideo)
      } else if (this.$store.state.callingType === 8) {
        video = true
        sendSource = 'screen'
      }
      const options = {
        localVideo: localVideo,
        remoteVideo: remoteVideo,
        onicecandidate: this.onIceCandidate,
        oncandidategatheringdone: oncandidategatheringdone,
        onerror: this.onError,
        mediaConstraints: {
          audio: !!((this.$store.state.callingType === 1 || this.$store.state.callingType === 3 || this.$store.state.callingType === 8)),
          video: video
        },
        sendSource: sendSource
      }
      console.log('createWebRtcPeer')
      console.log(options)
      const self = this
      this.webRtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options,
        function (error) {
          if (error) {
            return console.error(error)
          }
          self.webRtcPeer.generateOffer((error, offerSdp) => {
            if (error) {
              console.log(error)
              return console.error('Error generating the offer')
            }
            console.log('Invoking SDP offer callback function')
            msg.content = offerSdp
            self.$store.commit('sendMsg', JSON.stringify(msg))
          })
        })
      this.$store.commit('addWebRtc', {
        id: msg.other,
        obj: this.webRtcPeer
      })
    },
    createWebRtcPeerSendonly: function (localVideo, msg, oncandidategatheringdone) {
      let sendSource = 'webcam'
      console.log(this.$store.state.callingType)
      if (this.$store.state.callingType === 8) {
        sendSource = 'screen'
      }
      const options = {
        localVideo: localVideo,
        onicecandidate: this.onIceCandidate,
        onerror: this.onError,
        oncandidategatheringdone: oncandidategatheringdone,
        mediaConstraints: {
          audio: true,
          video: {
            width: 640,
            framerate: 45
          }
        },
        sendSource: sendSource
      }
      console.log('createWebRtcPeer')
      const self = this
      this.webRtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options,
        function (error) {
          if (error) {
            return console.error(error)
          }
          self.webRtcPeer.generateOffer((error, offerSdp) => {
            if (error) {
              console.log(error)
              return console.error('Error generating the offer')
            }
            console.log('Invoking SDP offer callback function')
            msg.content = offerSdp
            self.$store.commit('sendMsg', JSON.stringify(msg))
          })
        })
      this.$store.commit('addWebRtc', {
        id: msg.other,
        obj: this.webRtcPeer
      })
    },
    createWebRtcPeerRecvonly: function (remoteVideo, msg, oncandidategatheringdone) {
      const options = {
        remoteVideo: remoteVideo,
        onicecandidate: this.onIceCandidate,
        onerror: this.onError,
        oncandidategatheringdone: oncandidategatheringdone,
        mediaConstraints: {
          audio: true,
          video: {
            width: 640,
            framerate: 45
          }
        }
      }
      console.log('createWebRtcPeer')
      const self = this
      this.webRtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
        function (error) {
          if (error) {
            return console.error(error)
          }
          self.webRtcPeer.generateOffer((error, offerSdp) => {
            if (error) {
              console.log(error)
              return console.error('Error generating the offer')
            }
            console.log('Invoking SDP offer callback function')
            msg.content = offerSdp
            self.$store.commit('sendMsg', JSON.stringify(msg))
          })
        })
      this.$store.commit('addWebRtc', {
        id: msg.other,
        obj: this.webRtcPeer
      })
    },
    createWebRtcPeerRecvonlyBySpecialIcecandidateCallback: function (remoteVideo, msg, oncandidategatheringdone) {
      const self = this
      const options = {
        remoteVideo: remoteVideo,
        onicecandidate: function (candidate) {
          console.log('Local candidate' + JSON.stringify(candidate))
          const message = {
            id: 'onIceCandidate',
            from: msg.other,
            content: candidate,
            messageType: 'SdpMsg'
          }
          const jsonMessage = JSON.stringify(message)
          console.log('Sending onIceCandidate message: ' + jsonMessage)
          self.$store.commit('sendMsg', jsonMessage)
        },
        onerror: this.onError,
        oncandidategatheringdone: oncandidategatheringdone,
        mediaConstraints: {
          audio: true,
          video: {
            width: 640,
            framerate: 45
          }
        }
      }
      console.log('createWebRtcPeer')
      this.webRtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
        function (error) {
          if (error) {
            return console.error(error)
          }
          self.webRtcPeer.generateOffer((error, offerSdp) => {
            if (error) {
              console.log(error)
              return console.error('Error generating the offer')
            }
            console.log('Invoking SDP offer callback function')
            msg.content = offerSdp
            self.$store.commit('sendMsg', JSON.stringify(msg))
          })
        })
      this.$store.commit('addWebRtc', {
        id: msg.other,
        obj: this.webRtcPeer
      })
    },
    disposeWebRtc: function () {
      if (this.webRtcPeer !== null) {
        console.log('销毁webrtc')
        this.webRtcPeer.dispose()
      }
    }
  },
  mounted () {
  }
}
</script>

<style scoped>

</style>
