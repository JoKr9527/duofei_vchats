<template>
  <div v-if="this.$store.state.box === 'onetomany'">
    <video ref="localVideo" autoplay width="960px" height="720px"
           poster=""></video>
    <web-rtc-peer-sendrecv ref="webRtc" :name="this.$store.state.username" @recCloseBroadcastRoom="recCloseBroadcastRoom"></web-rtc-peer-sendrecv>
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
    createWebRtcPeerSendonly (message) {
      this.localVideo = this.$refs.localVideo
      this.$refs.webRtc.createWebRtcPeerSendonly(this.localVideo, message)
    },
    createWebRtcPeerRecvonly (message) {
      this.localVideo = this.$refs.localVideo
      this.$refs.webRtc.createWebRtcPeerRecvonly(this.localVideo, message)
    },
    disposeWebRtc () {
      this.$refs.webRtc.disposeWebRtc()
    },
    recCloseBroadcastRoom (content) {
      this.$emit('recCloseBroadcastRoom', content)
    }
  },
  mounted () {
  }
}
</script>

<style scoped>

</style>
