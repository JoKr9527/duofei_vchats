<template>
  <div></div>
</template>

<script>
export default {
  name: 'WebRtcPeerSendrecv',
  props: ['name'],
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
        messageType: 'onIceCandidate'
      }
      const jsonMessage = JSON.stringify(message)
      console.log('Sending onIceCandidate message: ' + jsonMessage)
      this.$store.commit('sendMsg', jsonMessage)
    },
    onError () {
      console.log('发生了一些错误,待做')
    },
    // 创建收发对等点
    createWebRtcPeer: function (localVideo, remoteVideo, msg) {
      const options = {
        localVideo: localVideo,
        remoteVideo: remoteVideo,
        onicecandidate: this.onIceCandidate,
        onerror: this.onError,
        mediaConstraints: {
          audio: true,
          video: {
            width: 640,
            framerate: 15
          }
        }
      }
      console.log('createWebRtcPeer')
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
    },
    createWebRtcPeerSendonly: function (localVideo, msg) {
      const options = {
        localVideo: localVideo,
        onicecandidate: this.onIceCandidate,
        onerror: this.onError,
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
    },
    createWebRtcPeerRecvonly: function (remoteVideo, msg) {
      const options = {
        remoteVideo: remoteVideo,
        onicecandidate: this.onIceCandidate,
        onerror: this.onError,
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
    },
    createWebRtcPeerRecvonlyByOptions: function (msg, options) {
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
    },
    disposeWebRtc: function () {
      if (this.webRtcPeer !== null) {
        console.log('销毁webrtc')
        this.webRtcPeer.dispose()
      }
    }
  },
  mounted () {
    const self = this
    // 用户接收到iceCandidate消息
    this.$store.commit('addHandler', {
      id: 'iceCandidate' + self.name,
      handler: (msg) => {
        if (self.webRtcPeer !== null) {
          console.log('处理接收到iceCandidate 消息')
          self.webRtcPeer.addIceCandidate(msg.content, error => {
            if (error) { return console.error('Error adding candidate: ' + error) }
          })
        }
      }
    })
    // 用户接收到 sdp answer
    this.$store.commit('addHandler', {
      id: 'sdpAnswer' + self.name,
      handler: (msg) => {
        if (self.webRtcPeer !== null) {
          console.log('处理接收到的sdpanswer 消息')
          self.webRtcPeer.processAnswer(msg.content, function (error) {
            if (error) {
              return console.error(error)
            }
          })
        }
      }
    })
    console.log('我执行了')
    console.log(this.$store.state.msgDispatch)
    // 用户收到挂断通知，销毁webrtc
    // 注入接收到的hangup 消息处理器
    this.$store.commit('addHandler', {
      id: 'hangup',
      handler: function (msg) {
        if (self.webRtcPeer != null) {
          console.log('销毁webrtc')
          self.webRtcPeer.dispose()
        }
        self.$emit('recHangup', msg.content)
      }
    })
    // 用户收到关闭直播间通知，销毁webrtc
    // closeBroadcastRoom 消息处理器
    this.$store.commit('addHandler', {
      id: 'closeBroadcastRoom',
      handler: function (msg) {
        if (self.webRtcPeer != null) {
          console.log('销毁webrtc')
          self.webRtcPeer.dispose()
        }
        self.$emit('recCloseBroadcastRoom', msg.content)
      }
    })
  }
}
</script>

<style scoped>

</style>
