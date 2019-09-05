<template>
  <div  v-if="this.$store.state.box === 'onetoone'">
    <el-row>
      <el-col :span="4">
        <video ref="localVideo" autoplay width="240px" height="180px"
               :poster="poster"></video>
      </el-col>
      <el-col :span="4">
        <video ref="remoteVideo" autoplay width="240px" height="180px"
               :poster="poster"></video>
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
    return {
      localVideo,
      remoteVideo,
      poster
    }
  },
  computed: {
  },
  methods: {
    // 创建webrtc
    createWebRtcPeerSendRecv (message, oncandidategatheringdone) {
      this.localVideo = this.$refs.localVideo
      this.remoteVideo = this.$refs.remoteVideo
      this.$refs.oneToOneWebRtc.createWebRtcPeer(this.localVideo, this.remoteVideo, message, oncandidategatheringdone)
    },
    posterChange (value) {
      console.log(value)
      this.poster = value
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

</style>
