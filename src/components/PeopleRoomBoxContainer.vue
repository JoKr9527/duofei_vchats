<template>
  <div  v-if="this.$store.state.box === 'people'">
    <video ref="localVideo" autoplay width="720px" height="460px"></video>
    <video ref="remoteVideo" autoplay width="720px" height="460px"></video>
    <web-rtc-peer-sendrecv ref="peopleWebRtc" :name="this.$store.state.username"></web-rtc-peer-sendrecv>
  </div>
</template>

<script>
import WebRtcPeerSendrecv from './WebRtcPeerSendrecv'
export default {
  name: 'PeopleRoomBoxContainer',
  components: {WebRtcPeerSendrecv},
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
      this.$refs.peopleWebRtc.createWebRtcPeer(this.localVideo, this.remoteVideo, message, oncandidategatheringdone)
    }
  }
}
</script>

<style scoped>

</style>
