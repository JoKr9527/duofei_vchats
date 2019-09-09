<template>
  <div  v-if="this.$store.state.box === 'onetoone'">
    <el-row>
      <el-col :span="12">
        <video ref="localVideo" autoplay width="720px" height="460px"
               :poster="poster"></video>
        <el-button type="success" v-show="localVideoCan" @click="fullScreen(localVideo)" round>全屏</el-button>
      </el-col>
      <el-col :span="12">
        <video ref="remoteVideo" autoplay width="720px" height="460px"
               :poster="poster"></video>
        <el-button type="success" v-show="remoteVideoCan" @click="fullScreen(remoteVideo)" round>全屏</el-button>
      </el-col>
    </el-row>
    <web-rtc-peer-sendrecv ref="oneToOneWebRtc" :name="this.$store.state.username" @posterChange="posterChange"></web-rtc-peer-sendrecv>
  </div>
</template>

<script>
import WebRtcPeerSendrecv from './WebRtcPeerSendrecv'
export default {
  name: 'OneToOneBoxContainer',
  components: {
    WebRtcPeerSendrecv
  },
  data: function () {
    const localVideo = {}
    const remoteVideo = {}
    const poster = ''
    const localVideoCanplay = false
    const remoteVideoCanplay = false
    return {
      localVideo,
      remoteVideo,
      poster,
      localVideoCanplay,
      remoteVideoCanplay,
    }
  },
  computed: {
    localVideoCan: function () {
      return this.$store.state.calling && this.localVideoCanplay
    },
    remoteVideoCan: function () {
      return this.$store.state.calling && this.remoteVideoCanplay
    }
  },
  methods: {
    // 创建webrtc
    createWebRtcPeerSendRecv (message, oncandidategatheringdone) {
      this.localVideo = this.$refs.localVideo
      this.remoteVideo = this.$refs.remoteVideo
      const self = this
      this.localVideo.addEventListener('canplay', function (e) {
        console.log('提示本地视频已准备好开始播放')
        self.localVideoCanplay = true
      })
      this.remoteVideo.addEventListener('canplay', function (e) {
        console.log('提示远程视频已准备好开始播放')
        self.remoteVideoCanplay = true
      })
      this.$refs.oneToOneWebRtc.createWebRtcPeer(this.localVideo, this.remoteVideo, message, oncandidategatheringdone)
    },
    posterChange (value) {
      console.log(value)
      this.poster = value
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
    // 用户收到挂断通知，销毁webrtc
    // 注入接收到的hangup 消息处理器
    this.$store.commit('addHandler', {
      id: 'hangup',
      handler: function (msg) {
        self.$store.commit('disposeWebRtc', self.$store.state.username)
        self.$store.commit('setCalling', false)
        self.$store.commit('setScopeId', '')
        self.$store.commit('clearMembers')
        self.$message({
          type: 'error',
          message: msg.content
        })
        self.poster = ''
      }
    })
  }
}

</script>

<style scoped>
video {
  object-fit: fill;
}
</style>
