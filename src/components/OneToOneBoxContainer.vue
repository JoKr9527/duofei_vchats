<template>
  <div>
    <video v-bind:key = "n" v-for="n in number" ref="videos" autoplay width="240px" height="180px"
           poster=""></video>
    <web-rtc-peer-sendrecv ref="webRtc" @recHangup="recHangup"></web-rtc-peer-sendrecv>
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
    getMember: function () {
      return this.$store.state.members[0]
    }
  },
  methods: {
    // 创建webrtc
    createWebRtcPeerSendonly (message) {
      this.localVideo = this.$refs.videos[0]
      this.remoteVideo = this.$refs.videos[1]
      this.$refs.webRtc.createWebRtcPeer(this.localVideo, this.remoteVideo, message)
    },
    disposeWebRtc () {
      this.$refs.webRtc.disposeWebRtc()
    },
    recHangup (content) {
      this.$emit('recHangup', content)
    }
  },
  mounted () {
  }
}

</script>

<style scoped>

</style>
