<template>
  <div v-if="this.$store.state.box === 'manytomany'">
    <el-row v-if="this.$store.state.box === 'manytomany'">
      <el-col :span="10">
        <video v-show="isCalling && videoIsShow.localVideo" ref="localVideo" autoplay
               poster="" style="display: inline" controls width="640" height="360"></video>
        <web-rtc-peer-sendrecv ref="webRtcSendOnly" :name="username" style="display: inline"></web-rtc-peer-sendrecv>
      </el-col>
      <el-col :span="14">
        <el-row :gutter="16">
              <template  v-for="(member) in this.$store.state.members" >
              <el-col :sm="8" v-bind:key="'webrtc'+member">
                <video v-show="isCalling || videoIsShow['remote'+member]" :ref="'remote'+member" autoplay width="320px" height="240px"  poster="" style="display: inline" controls></video>
                <web-rtc-peer-sendrecv :ref="'webRtcRecvOnly'+member" :name="username + member" style="display: inline"></web-rtc-peer-sendrecv>
              </el-col>
              </template>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import WebRtcPeerSendrecv from './WebRtcPeerSendrecv'
export default {
  name: 'ManyToManyBoxContainer',
  components: {
    WebRtcPeerSendrecv
  },
  data () {
    const username = this.$store.state.username
    const videoIsShow = {localVideo: false}
    return {
      username,
      videoIsShow
    }
  },
  computed: {
    isCalling: function (e) {
      console.log(e)
      return this.$store.state.calling
    }
  },
  methods: {
    // 创建webrtc
    createWebRtcPeerSendonly (message, oncandidategatheringdone) {
      this.localVideo = this.$refs.localVideo
      this.videoIsShow.localVideo = true
      this.$refs.webRtcSendOnly.createWebRtcPeerSendonly(this.localVideo, message, oncandidategatheringdone)
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
            const message = {
              id: 'sdpOffer',
              from: self.$store.state.username,
              to: self.$store.state.scopeId,
              other: self.$store.state.username + msg.content[i],
              messageType: 'SdpMsg'
            }
            const oncandidategatheringdone = function () {
              // 开始激活域
              const waitSendMsg = {
                id: 'recvMemberMedia',
                from: self.$store.state.username,
                to: msg.content[i],
                messageType: 'GroupMsg'
              }
              console.log('开始创建到成员的连接')
              self.$store.commit('sendMsg', JSON.stringify(waitSendMsg))
              if (self.videoIsShow['remote' + msg.content[i]] === 'undefined') {
                self.$set(self.videoIsShow, 'remote' + msg.content[i], true)
              } else {
                self.videoIsShow['remote' + msg.content[i]] = true
              }
            }
            self.$refs['webRtcRecvOnly' + msg.content[i]][0].createWebRtcPeerRecvonlyBySpecialIcecandidateCallback(self.$refs['remote' + msg.content[i]][0], message, oncandidategatheringdone)
          }
        })
      }
    })
    // 注入接收到 newMemberJoin 的消息处理器
    this.$store.commit('addHandler', {
      id: 'newMemberJoin',
      handler: (msg) => {
        self.$store.commit('addMember', msg.content)
        console.log(self.$store.state.members)
        self.$nextTick(function () {
          const message = {
            id: 'sdpOffer',
            from: self.$store.state.username,
            to: self.$store.state.scopeId,
            other: self.$store.state.username + msg.content,
            messageType: 'SdpMsg'
          }
          const oncandidategatheringdone = function () {
            // 开始激活域
            const waitSendMsg = {
              id: 'recvMemberMedia',
              from: self.$store.state.username,
              to: msg.content,
              messageType: 'GroupMsg'
            }
            console.log('开始创建到成员的连接')
            self.$store.commit('sendMsg', JSON.stringify(waitSendMsg))
            if (self.videoIsShow['remote' + msg.content] === 'undefined') {
              self.$set(self.videoIsShow, 'remote' + msg.content, true)
            } else {
              self.videoIsShow['remote' + msg.content] = true
            }
          }
          self.$refs['webRtcRecvOnly' + msg.content][0].createWebRtcPeerRecvonlyBySpecialIcecandidateCallback(self.$refs['remote' + msg.content][0], message, oncandidategatheringdone)
        })
      }
    })
    // 注入接收到 quitMeetRoom  的消息处理器
    this.$store.commit('addHandler', {
      id: 'quitMeetRoom',
      handler: (msg) => {
        console.log(msg.from + '退出了会议室')
        self.$store.commit('disposeWebRtc', self.$store.state.username + msg.from)
        self.$store.commit('removeMember', msg.from)
        self.$notify.info({
          title: '消息',
          message: msg.from + '退出了会议室'
        })
      }
    })
    // 注入接收到 closeMeetRoom 的消息处理器
    this.$store.commit('addHandler', {
      id: 'closeMeetRoom',
      handler: (msg) => {
        console.log(msg.from + '关闭了会议室')
        // 销毁自身的 webrtc
        self.$store.commit('disposeWebRtc', self.$store.state.username)
        this.videoIsShow.localVideo = false
        // 销毁 members的webrtc
        self.$store.state.members.forEach((member) => {
          self.$store.commit('disposeWebRtc', self.$store.state.username + member)
          this.videoIsShow['remote' + member] = false
        })
        self.$notify.error({
          title: '提示',
          message: msg.from + '关闭了会议室'
        })
        this.$store.commit('clearMembers')
        this.$store.commit('setCalling', false)
      }
    })
  }
}
</script>

<style scoped>

</style>
