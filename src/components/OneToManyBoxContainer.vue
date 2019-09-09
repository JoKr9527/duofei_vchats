<template>
  <div v-if="this.$store.state.box === 'onetomany'">
    <video ref="localVideo" autoplay width="960px" height="720px"
           poster=""></video>
    <el-button type="success" v-show="localVideoCan" @click="fullScreen(localVideo)" round>全屏</el-button>
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
    const localVideoCanplay = false
    return {
      localVideo,
      localVideoCanplay
    }
  },
  computed: {
    localVideoCan: function () {
      return this.$store.state.calling && this.localVideoCanplay
    }
  },
  methods: {
    // 创建webrtc
    createWebRtcPeerSendonly (message, oncandidategatheringdone) {
      this.localVideo = this.$refs.localVideo
      const self = this
      this.localVideo.addEventListener('canplay', function (e) {
        console.log('提示本地视频已准备好开始播放')
        self.localVideoCanplay = true
      })
      this.$refs.webRtc.createWebRtcPeerSendonly(this.localVideo, message, oncandidategatheringdone)
    },
    createWebRtcPeerRecvonly (message, oncandidategatheringdone) {
      this.localVideo = this.$refs.localVideo
      const self = this
      this.localVideo.addEventListener('canplay', function (e) {
        console.log('提示远程视频已准备好开始播放')
        self.localVideoCanplay = true
      })
      this.$refs.webRtc.createWebRtcPeerRecvonly(this.localVideo, message, oncandidategatheringdone)
    },
    fullScreen (video) {
      let videoDom = video
      if (videoDom.requestFullscreen) {
        videoDom.requestFullscreen()
      } else if (videoDom.webkitRequestFullScreen) {
        videoDom.webkitRequestFullScreen()
      } else if (videoDom.mozRequestFullScreen) {
        videoDom.mozRequestFullScreen()
      } else {
        videoDom.msRequestFullscreen()
      }
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
