<template>
  <div>
    <el-row>
      <el-col :span="10">
        <video ref="localVideo" autoplay
               poster="" style="display: inline"></video>
        <web-rtc-peer-sendrecv ref="webRtcSendOnly" :name="username" style="display: inline"></web-rtc-peer-sendrecv>
      </el-col>
      <el-col :span="14">
        <el-row :gutter="16">
              <template  v-for="(member) in this.$store.state.members" >
              <el-col :sm="8" v-bind:key="'webrtc'+member">
                <video :ref="'remote'+member" autoplay width="320px" height="240px"  poster="" style="display: inline"></video>
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
    return {
      username
    }
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
    quitMeetRoomRun () {
      this.$refs.webRtcSendOnly.disposeWebRtc()
      // 销毁 members
      this.$store.state.members.forEach((member) => {
        console.log(this.$refs['webRtcRecvOnly' + member])
        this.$refs['webRtcRecvOnly' + member][0].disposeWebRtc()
      })
      this.$store.commit('clearMembers')
      // 发送退出会议室消息
      const quitMeetRoomMsg = {
        id: 'quitMeetRoom',
        from: this.$store.state.username,
        to: this.$store.state.scopeId,
        messageProcessMode: 'mutual',
        messageType: 'user'
      }
      this.$store.commit('sendMsg', JSON.stringify(quitMeetRoomMsg))
      console.log('退出会议室')
    },
    closeMeetRoomRun () {
      this.$refs.webRtcSendOnly.disposeWebRtc()
      this.$store.state.members.forEach((member) => {
        console.log(this.$refs['webRtcRecvOnly' + member])
        this.$refs['webRtcRecvOnly' + member][0].disposeWebRtc()
      })
      this.$store.commit('clearMembers')
      console.log('关闭会议室')
      // 发送关闭会议室消息
      const closeMeetRoomMsg = {
        id: 'closeMeetRoom',
        from: this.$store.state.username,
        to: this.$store.state.scopeId,
        messageProcessMode: 'mutual',
        messageType: 'user'
      }
      this.$store.commit('sendMsg', JSON.stringify(closeMeetRoomMsg))
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
            // sdp 消息
            const sdpMsg = {
              id: 'recvMemberMedia',
              from: this.$store.state.username,
              to: msg.content[i],
              messageProcessMode: 'mutual',
              messageType: 'user'
            }
            const options = {
              remoteVideo: this.$refs['remote' + msg.content[i]][0],
              onicecandidate: (candidate) => {
                console.log('Local candidate' + JSON.stringify(candidate))
                const message = {
                  id: 'onIceCandidate',
                  from: self.$store.state.username + msg.content[i],
                  content: candidate,
                  messageType: 'onIceCandidate'
                }
                const jsonMessage = JSON.stringify(message)
                console.log('Sending onIceCandidate message: ' + jsonMessage)
                this.$store.commit('sendMsg', jsonMessage)
              },
              onerror: () => {
                console.log('发生了一些错误,待做')
              },
              mediaConstraints: {
                audio: true,
                video: {
                  width: 640,
                  framerate: 45
                }
              }
            }
            console.log(this.$refs['remote' + msg.content[i]][0])
            console.log(this.$store.state.msgDispatch)
            this.$refs['webRtcRecvOnly' + msg.content[i]][0].createWebRtcPeerRecvonlyByOptions(sdpMsg, options)
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
          // sdp 消息
          const sdpMsg = {
            id: 'recvMemberMedia',
            from: this.$store.state.username,
            to: msg.content,
            messageProcessMode: 'mutual',
            messageType: 'user'
          }
          const options = {
            remoteVideo: this.$refs['remote' + msg.content][0],
            onicecandidate: (candidate) => {
              console.log('Local candidate' + JSON.stringify(candidate))
              const message = {
                id: 'onIceCandidate',
                from: self.$store.state.username + msg.content,
                content: candidate,
                messageType: 'onIceCandidate'
              }
              const jsonMessage = JSON.stringify(message)
              console.log('Sending onIceCandidate message: ' + jsonMessage)
              this.$store.commit('sendMsg', jsonMessage)
            },
            onerror: () => {
              console.log('发生了一些错误,待做')
            },
            mediaConstraints: {
              audio: true,
              video: {
                width: 640,
                framerate: 45
              }
            }
          }
          console.log(this.$refs['remote' + msg.content][0])
          this.$refs['webRtcRecvOnly' + msg.content][0].createWebRtcPeerRecvonlyByOptions(sdpMsg, options)
        })
      }
    })
    // 注入接收到 quitMeetRoom  的消息处理器
    this.$store.commit('addHandler', {
      id: 'quitMeetRoom',
      handler: (msg) => {
        console.log(msg.from + '退出了会议室')
        if (self.$refs['webRtcRecvOnly' + msg.from][0] !== undefined) {
          self.$refs['webRtcRecvOnly' + msg.from][0].disposeWebRtc()
        }
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
        for (let i = 0; i < self.$store.state.members.length; i++) {
          if (self.$refs['webRtcRecvOnly' + self.$store.state.members[i]][0] !== undefined) {
            self.$refs['webRtcRecvOnly' + self.$store.state.members[i]][0].disposeWebRtc()
          }
        }
        self.$refs.webRtcSendOnly.disposeWebRtc()
        self.$store.commit('clearMembers')
        self.$store.commit('setCalling', false)
        self.$notify.error({
          title: '错误',
          message: msg.from + '关闭了会议室'
        })
      }
    })
  }
}
</script>

<style scoped>

</style>
