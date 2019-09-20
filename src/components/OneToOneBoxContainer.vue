<template>
  <div  v-if="this.$store.state.box === 'onetoone'">
    <el-row>
      <el-col :span="8">
        <video ref="localVideo" autoplay width="720px" height="460px"
               :poster="poster"></video>
        <el-button type="success" v-show="localVideoCan" @click="fullScreen(localVideo)" round>全屏</el-button>
      </el-col>
      <el-col :span="8">
        <video ref="remoteVideo" autoplay width="720px" height="460px"
               :poster="poster"></video>
        <el-button type="success" v-show="remoteVideoCan" @click="fullScreen(remoteVideo)" round>全屏</el-button>
      </el-col>
      <el-col :span="8">
        <el-row>
          <wxChat
            :data="wxChatData"
            :showShade="false"
            contactNickname="二哈"
            :ownerAvatarUrl="ownerAvatarUrl"
            :contactAvatarUrl="contactAvatarUrl" v-if="this.$store.state.dataChannels" ref="wxChat">
          </wxChat>
        </el-row>
        <el-row style="margin-top: 15px">
          <el-col :span="20">
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4}"
              placeholder="请输入内容"
              v-model="text">
            </el-input>
          </el-col>
          <el-col :span="2" :offset=2>
            <el-button type="success" icon="el-icon-check" circle style="margin-top: 30%" @click="sendText"></el-button>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <web-rtc-peer-sendrecv ref="oneToOneWebRtc" :name="this.$store.state.username" @posterChange="posterChange"></web-rtc-peer-sendrecv>
  </div>
</template>

<script>
import WebRtcPeerSendrecv from './WebRtcPeerSendrecv'
import wxChat from './thirdComp/wxChat'
export default {
  name: 'OneToOneBoxContainer',
  components: {
    WebRtcPeerSendrecv,
    wxChat
  },
  data: function () {
    const localVideo = {}
    const remoteVideo = {}
    const poster = ''
    const localVideoCanplay = false
    const remoteVideoCanplay = false
    const text = ''
    return {
      localVideo,
      remoteVideo,
      poster,
      localVideoCanplay,
      remoteVideoCanplay,
      contactAvatarUrl: require('../assets/avatar2.png'),
      ownerAvatarUrl: require('../assets/avatar1.png'),
      width: window.screen.width,
      text,
      wxChatData: [{
        direction: 2,
        id: 1,
        type: 1,
        content: '你好!![呲牙]',
        ctime: new Date().toLocaleString()
      },
      {
        direction: 1,
        id: 2,
        type: 1,
        content: '你也好。[害羞]',
        ctime: new Date().toLocaleString()
      },
      {
        direction: 2,
        id: 3,
        type: 1,
        content: '这是我的简历头像：',
        ctime: new Date().toLocaleString()
      },
      {
        direction: 2,
        id: 4,
        type: 2,
        content: './src/assets/wyz.jpg',
        ctime: new Date().toLocaleString()
      },
      {
        direction: 1,
        id: 5,
        type: 1,
        content: '你开心就好。[微笑]',
        ctime: new Date().toLocaleString()
      }]
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
    },
    sendText () {
      const self = this
      this.$refs.wxChat.setData({
        direction: 2,
        id: 5,
        type: 1,
        content: self.text,
        ctime: new Date().toLocaleString()
      })
      this.wxChatData.push(this.text)
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
