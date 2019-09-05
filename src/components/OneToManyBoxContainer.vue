<template>
  <div v-if="this.$store.state.box === 'onetomany'">
    <video ref="localVideo" autoplay width="960px" height="720px"
           poster=""></video>
    <web-rtc-peer-sendrecv ref="webRtc" :name="this.$store.state.username"></web-rtc-peer-sendrecv>
  </div>
</template>

<script>
import WebRtcPeerSendrecv from './WebRtcPeerSendrecv'
export default {
  name: 'OneToManyBoxContainer',
  components: {
    WebRtcPeerSendrecv
  },
  data () {
    const localVideo = {}
    return {
      localVideo
    }
  },
  methods: {
    // 创建webrtc
    createWebRtcPeerSendonly (message, oncandidategatheringdone) {
      this.localVideo = this.$refs.localVideo
      this.$refs.webRtc.createWebRtcPeerSendonly(this.localVideo, message, oncandidategatheringdone)
    },
    createWebRtcPeerRecvonly (message, oncandidategatheringdone) {
      this.localVideo = this.$refs.localVideo
      this.$refs.webRtc.createWebRtcPeerRecvonly(this.localVideo, message, oncandidategatheringdone)
    }
  },
  mounted () {
    const self = this
    // 用户收到关闭直播间通知，销毁webrtc
    // closeBroadcastRoom 消息处理器
    this.$store.commit('addHandler', {
      id: 'closeBroadcastRoom',
      handler: function (msg) {
        self.$store.commit('disposeWebRtc', self.$store.state.username)
        self.$message({
          type: 'error',
          message: msg.content
        })
        self.$store.commit('setCalling', false)
        self.$store.commit('setScopeId', '')
      }
    })
    // 添加接收到用户退出直播间消息处理器
    this.$store.commit('addHandler', {
      id: 'quitBroadcastRoom',
      handler: (msg) => {
        self.$message(msg.content)
      }
    })
  }
}
</script>

<style scoped>

</style>
