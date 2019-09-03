<template>
  <div  v-if="this.$store.state.box === 'onetoone'">
    <video v-bind:key = "n" v-for="n in number" ref="videos" autoplay width="240px" height="180px"
           poster=""></video>
    <web-rtc-peer-sendrecv ref="oneToOneWebRtc" @recHangup="recHangup" :name="this.$store.state.username"></web-rtc-peer-sendrecv>
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
    const number = 2
    return {
      localVideo,
      remoteVideo,
      number
    }
  },
  computed: {
  },
  methods: {
    // 创建webrtc
    createWebRtcPeerSendRecv (message) {
      this.localVideo = this.$refs.videos[0]
      this.remoteVideo = this.$refs.videos[1]
      this.$refs.oneToOneWebRtc.createWebRtcPeer(this.localVideo, this.remoteVideo, message)
    },
    disposeWebRtc () {
      this.$refs.oneToOneWebRtc.disposeWebRtc()
    },
    recHangup (content) {
      console.log('rechangup!')
      this.$emit('recHangup', content)
    }
  },
  mounted () {
  }
}

</script>

<style scoped>

</style>
