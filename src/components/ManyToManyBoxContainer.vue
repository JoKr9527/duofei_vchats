<template>
  <div>
    <video ref="localVideo" autoplay width="640px" height="480px"
           poster=""></video>
    <web-rtc-peer-sendrecv ref="webRtcSendOnly"></web-rtc-peer-sendrecv>
    <template  v-for="member in this.$store.state.members" >
      <video :ref="'localVideo'+member" autoplay width="640px" height="480px"  poster="" v-bind:key="'video'+member"></video>
      <web-rtc-peer-sendrecv :ref="'webRtcSendOnly'+member"  v-bind:key="'webrtc'+member" ></web-rtc-peer-sendrecv>
    </template>
  </div>
</template>

<script>
import WebRtcPeerSendrecv from './WebRtcPeerSendrecv'
export default {
  name: 'ManyToManyBoxContainer',
  components: {
    WebRtcPeerSendrecv
  },
  methods: {
    // 创建webrtc
    createWebRtcPeerSendonly (message) {
      this.localVideo = this.$refs.localVideo
      this.$refs.webRtcSendOnly.createWebRtcPeerSendonly(this.localVideo, message)
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
    const self = this
    // 注入接收到 existMembers 的消息处理器
    this.$store.commit('addHandler', {
      id: 'existMembers',
      handler: (msg) => {
        self.$store.commit('addMembers', msg.content)
        console.log(self.$store.state.members)
        self.$nextTick(function () {
          // 处理成员
          for (let i = 0; i < msg.content.length; i++) {
            // TODO HXF
            console.log(this.$refs['webRtcSendOnly' + msg.content[i]])
          }
        })
      }
    })
    // 注入接收到 newMemberJoin 的消息处理器
    this.$store.commit('addHandler', {
      id: 'newMemberJoin',
      handler: (msg) => {
        self.$store.commit('addMembers', msg.content)
      }
    })
  }
}
</script>

<style scoped>

</style>
