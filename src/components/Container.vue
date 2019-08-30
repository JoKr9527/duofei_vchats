<template>
  <el-container style="height: 100%; ">
    <el-aside width="200px" style="background-color: rgb(137, 190, 178)" class="el-aside" >
      <el-menu v-on:open="subMenuOpen" v-on:close="subMenuClose" active-text-color="#6699CC" :default-active="activeScopeId" background-color="#89BEB2" unique-opened>
        <el-submenu index="1">
          <template slot="title"><i class="el-icon-message"></i>在线用户</template>
            <el-menu-item :index="onlineUser" v-bind:key="onlineUser" v-for="onlineUser in onlineUsers" @click="calledStart(onlineUser)">
              {{onlineUser}}
            </el-menu-item>
        </el-submenu>
        <el-submenu index="2">
          <template slot="title"><i class="el-icon-menu"></i>直播间</template>
          <el-menu-item :index="broadcast.id" v-bind:key="broadcast.id" v-for="broadcast in onlineBroadcastRooms" @click="calledBroadcast(broadcast)">{{broadcast.name}}</el-menu-item>
        </el-submenu>
        <el-submenu index="3">
          <template slot="title"><i class="el-icon-menu"></i>会议</template>
            <el-menu-item :index="meetroom.id" v-bind:key="meetroom.id" v-for="meetroom in onlineMeetRooms" @click="readyMeetRoom(meetroom.id)">{{meetroom.name}}</el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header style="text-align: left; font-size: 12px" v-bind:class="{elHeader: (this.$store.state.box === 'onetoone' && hasMembers) || this.$store.state.box === 'onetomany' || this.$store.state.box === 'manytomany'}">
        <span>
          <user-opt v-show="this.$store.state.box === 'onetoone' && hasMembers" :callProcess="callProcess" @loadingBox="sendReqVideoCll" @hangup="hangup"></user-opt>
          <broadcast-room-opt v-show="this.$store.state.box === 'onetomany'" @createBroadcastRoomSuccess="createBroadcastRoomSuccess" @joinBroadcastRoomSuccess="joinBroadcastRoomSuccess" :isPresenter="isPresenter"
              @closeBroadcastRoom="closeBroadcastRoom" @quitBroadcastRoom="quitBroadcastRoom"></broadcast-room-opt>
          <meet-room-opt v-show="this.$store.state.box === 'manytomany'" :isCreator="isCreator" @joinMeetRoomEvent="joinMeetRoomEvent" @quitMeetRoomEvent="quitMeetRoomEvent" @closeMeetRoomEvent="closeMeetRoomEvent"></meet-room-opt>
        </span>
      </el-header>
      <el-main style="margin:30px;width: 100%;height: 100%;">
        <div id="video_box" style="border-color: rgb(201, 186, 131)">
          <one-to-one-box-container ref="oneToOneBox" v-show="this.$store.state.box === 'onetoone' && hasMembers" @recHangup="recHangup">
          </one-to-one-box-container>
          <one-to-many-box-container ref="oneToManyBox" v-show="this.$store.state.box === 'onetomany'" @recCloseBroadcastRoom="recCloseBroadcastRoom"></one-to-many-box-container>
          <many-to-many-box-container ref="manyToManyBox" v-show="this.$store.state.box === 'manytomany'"></many-to-many-box-container>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import random from '../utils/random.js'
import UserOpt from './UserOpt'
import OneToOneBoxContainer from './OneToOneBoxContainer'
import OneToManyBoxContainer from './OneToManyBoxContainer'
import ManyToManyBoxContainer from './ManyToManyBoxContainer'
import BroadcastRoomOpt from './BroadcastRoomOpt'
import MeetRoomOpt from './MeetRoomOpt'
export default {
  components: {
    MeetRoomOpt,
    BroadcastRoomOpt,
    UserOpt,
    OneToOneBoxContainer,
    OneToManyBoxContainer,
    ManyToManyBoxContainer},
  data () {
    const onlineUsers = []
    const onlineBroadcastRooms = []
    const onlineMeetRooms = []
    const username = random(10)
    const callProcess = {
      calledUsername: null
    }
    const loading = null
    this.$store.commit('setUsername', username)
    return {
      onlineUsers,
      onlineBroadcastRooms,
      onlineMeetRooms,
      username,
      callProcess,
      loading
    }
  },
  computed: {
    hasMembers: function () {
      return this.$store.state.members.length > 0
    },
    activeScopeId: function () {
      return this.$store.state.scopeId
    },
    // 在一对多聊天中判断是否为房主
    isPresenter: function () {
      let isPresenter = false
      if (this.$store.state.scopeId !== '') {
        this.onlineBroadcastRooms.forEach((value) => {
          if (value.id === this.$store.state.scopeId && value.userName === this.$store.state.username) {
            isPresenter = true
          }
        })
      }
      return isPresenter
    },
    // 在多对多聊天（会议室）中是否为会议室的创建者
    isCreator: function () {
      let isCreator = false
      if (this.$store.state.scopeId !== '') {
        this.onlineMeetRooms.forEach((value) => {
          if (value.id === this.$store.state.scopeId && value.userName === this.$store.state.username) {
            isCreator = true
          }
        })
      }
      return isCreator
    }
  },
  watch: {
  },
  methods: {
    init: function () {
      this.$store.commit('setCalling', false)
      this.$store.commit('setScopeId', '')
      this.$store.commit('clearMembers')
      this.callProcess.calledUsername = null
    },
    subMenuOpen: function (index) {
      if (index === '2') {
        this.$store.commit('setBox', 'onetomany')
        if (!this.$store.state.calling) {
          this.$store.commit('setScopeId', '')
        }
      } else if (index === '3') {
        this.$store.commit('setBox', 'manytomany')
        if (!this.$store.state.calling) {
          this.$store.commit('setScopeId', '')
        }
      } else if (index === '1') {
        this.$store.commit('setBox', 'onetoone')
        if (!this.$store.state.calling) {
          this.init()
        }
      }
    },
    subMenuClose: function (index) {
      if (index === '2') {
        this.$store.commit('setBox', 'onetomany')
        if (!this.$store.state.calling) {
          this.$store.commit('setScopeId', '')
        }
      } else if (index === '3') {
        this.$store.commit('setBox', 'manytomany')
        if (!this.$store.state.calling) {
          this.$store.commit('setScopeId', '')
        }
      } else if (index === '1') {
        this.$store.commit('setBox', 'onetoone')
        if (!this.$store.state.calling) {
          this.init()
        }
      }
    },
    calledStart: function (called) {
      this.callProcess.calledUsername = called
      this.$store.commit('addMember', called)
      this.$store.commit('setBox', 'onetoone')
    },
    open (title, msg, to) {
      this.$confirm(msg, title, {
        distinguishCancelAndClose: true,
        confirmButtonText: '接受',
        cancelButtonText: '拒绝'
      }).then(() => {
        this.$message({
          type: 'info',
          message: '正在连接...'
        })
        const msg = {
          id: 'reqVideoRepAccept',
          from: this.username,
          to: to,
          content: '对方已接受，连接建立中',
          messageType: 'user',
          messageProcessMode: 'redirect'
        }
        this.$store.commit('sendMsg', JSON.stringify(msg))
        // 初始化内容
        this.$store.commit('setCalling', true)
        this.$store.commit('addMember', to)
        this.$store.commit('setBox', 'onetoone')
        this.callProcess.calledUsername = to
        // 建立onetoone连接
        console.log('建立一对一连接')
        const message = {
          id: 'call',
          from: this.$store.state.username,
          to: this.$store.state.members[0],
          messageProcessMode: 'sdp_onetoone',
          messageType: 'user'
        }
        this.$refs.oneToOneBox.createWebRtcPeerSendonly(message)
      }).catch(action => {
        this.$message({
          type: 'info',
          message: action === 'cancel'
            ? '已拒绝了通话请求'
            : '已忽略了通话请求'
        })
        if (action === 'cancel') {
          const msg = {
            id: 'reqVideoRepRefuse',
            from: this.username,
            to: to,
            content: '对方已拒绝',
            messageType: 'user',
            messageProcessMode: 'redirect'
          }
          this.$store.commit('sendMsg', JSON.stringify(msg))
          this.init()
        }
      })
    },
    msgHint (type, msg) {
      this.$message({
        type: type,
        message: msg
      })
    },
    loadingBox (loadingText) {
      this.loading = this.$loading({
        target: '#video_box',
        lock: true,
        text: loadingText,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      setTimeout(() => {
        this.loading.text = '对方无应答'
      }, 24000)
      setTimeout(() => {
        this.loading.close()
      }, 25000)
    },
    sendReqVideoCll () {
      this.loadingBox('等待对方应答')
      this.$store.commit('setCalling', true)
    },
    hangup () {
      this.$refs.oneToOneBox.disposeWebRtc()
      this.init()
    },
    // 收到挂断请求
    recHangup (content) {
      this.msgHint('error', content)
      this.init()
    },
    createBroadcastRoomSuccess () {
      const msg = {
        id: 'call',
        from: this.$store.state.username,
        to: this.$store.state.scopeId,
        messageProcessMode: 'sdp_onetomany',
        messageType: 'user'
      }
      // 创建webrtcsendonly
      this.$refs.oneToManyBox.createWebRtcPeerSendonly(msg)
      this.$store.commit('setCalling', true)
    },
    // 点击具体直播间触发的事件
    calledBroadcast (broadcast) {
      this.$store.commit('setScopeId', broadcast.id)
    },
    // 申请加入直播间
    joinBroadcastRoomSuccess () {
      const msg = {
        id: 'callee',
        from: this.$store.state.username,
        to: this.$store.state.scopeId,
        messageProcessMode: 'sdp_onetomany',
        messageType: 'user'
      }
      // 创建webrtcsendonly
      this.$refs.oneToManyBox.createWebRtcPeerRecvonly(msg)
      this.$store.commit('setCalling', true)
    },
    // 关闭直播间触发事件
    closeBroadcastRoom () {
      this.$refs.oneToManyBox.disposeWebRtc()
      // 发送直播间关闭消息
      const msg = {
        id: 'closeBroadcastRoom',
        from: this.$store.state.username,
        to: this.$store.state.scopeId,
        content: '当前观看的直播间已关闭',
        messageProcessMode: 'mutual',
        messageType: 'user'
      }
      this.$store.commit('sendMsg', JSON.stringify(msg))
      this.$store.commit('setCalling', false)
      this.$store.commit('setScopeId', '')
      this.$store.commit('clearMembers')
    },
    // 退出直播间触发事件
    quitBroadcastRoom () {
      this.$refs.oneToManyBox.disposeWebRtc()
      // 发送直播间关闭消息
      const msg = {
        id: 'quitBroadcastRoom',
        from: this.$store.state.username,
        to: this.$store.state.scopeId,
        content: this.$store.state.username + '退出直播间',
        messageProcessMode: 'mutual',
        messageType: 'user'
      }
      this.$store.commit('sendMsg', JSON.stringify(msg))
      this.$store.commit('setCalling', false)
      this.$store.commit('setScopeId', '')
      this.$store.commit('clearMembers')
    },
    // 接收到关闭直播间消息时，触发的事件
    recCloseBroadcastRoom (content) {
      this.msgHint('error', content)
      this.$store.commit('setCalling', false)
      this.$store.commit('setScopeId', '')
    },
    // 响应具体会议室的点击事件
    readyMeetRoom (scopeId) {
      this.$store.commit('setScopeId', scopeId)
    },
    // 点击创建会议室时，触发的事件
    joinMeetRoomEvent () {
      const msg = {
        id: 'call',
        from: this.$store.state.username,
        to: this.$store.state.scopeId,
        messageProcessMode: 'sdp_manytomany',
        messageType: 'user'
      }
      // 创建webrtcsendonly
      this.$refs.manyToManyBox.createWebRtcPeerSendonly(msg)
    },
    // 点击退出会议室时，触发的事件
    quitMeetRoomEvent () {},
    // 点击关闭会议室时，触发的事件
    closeMeetRoomEvent () {}
  },
  mounted () {
    const self = this
    const url = 'wss://192.168.3.72:8081/v-charts/chat?userName=' + this.username
    // 建立websocket连接
    this.$store.commit('createCon', url)
    this.$store.commit('conOpen', () => {
      console.log('ws连接成功')
    })
    this.$store.commit('conClose', () => {
      console.log('ws连接关闭')
    })
    this.$store.commit('conError', () => {
      console.log('ws连接发生错误')
    })
    // 添加在线用户消息处理器
    this.$store.commit('addHandler', {
      id: 'onlineUsers',
      handler: (msg) => {
        self.onlineUsers = msg.content
      }
    })
    // 用户收到视频请求
    this.$store.commit('addHandler', {
      id: 'reqVideoCall',
      handler: (msg) => {
        self.open('视频通话', msg.content, msg.from)
      }
    })
    // 用户收到接收视频请求
    this.$store.commit('addHandler', {
      id: 'reqVideoRepAccept',
      handler: (msg) => {
        self.loading.text = msg.content
        setTimeout(() => {
          if (self.loading !== null) {
            self.loading.close()
          }
        }, 1500)
      }
    })
    // 用户收到拒绝视频请求
    this.$store.commit('addHandler', {
      id: 'reqVideoRepRefuse',
      handler: (msg) => {
        self.loading.text = msg.content
        setTimeout(() => {
          if (self.loading !== null) {
            self.loading.close()
          }
        }, 1500)
        self.init()
      }
    })
    // 用户收到请求创建webrtc
    this.$store.commit('addHandler', {
      id: 'callee',
      handler: (msg) => {
        // 建立onetoone连接
        console.log('建立一对一连接')
        const message = {
          id: 'callee',
          from: self.username,
          to: msg.content,
          messageProcessMode: 'sdp_onetoone',
          messageType: 'user'
        }
        self.$refs.oneToOneBox.createWebRtcPeerSendonly(message)
        self.$store.commit('setScopeId', msg.content)
        self.$store.commit('setCalling', true)
      }
    })
    // 用户收到错误消息处理
    this.$store.commit('addHandler', {
      id: 'errorMsg',
      handler: (msg) => {
        self.loading.text = msg.content
        setTimeout(() => {
          if (self.loading !== null) {
            self.loading.close()
          }
        }, 1200)
        self.init()
      }
    })
    // 用户收到加入域的通知
    this.$store.commit('addHandler', {
      id: 'joinScope',
      handler: (msg) => {
        self.$store.commit('setScopeId', msg.content)
      }
    })
    // 添加直播间消息处理器
    this.$store.commit('addHandler', {
      id: 'onlineBroadcastRoom',
      handler: (msg) => {
        this.onlineBroadcastRooms = msg.content
      }
    })
    // 添加接收到用户退出直播间消息处理器
    this.$store.commit('addHandler', {
      id: 'quitBroadcastRoom',
      handler: (msg) => {
        self.$message(msg.content)
      }
    })
    // 添加会议室消息处理期
    this.$store.commit('addHandler', {
      id: 'onlineMeetRoom',
      handler: (msg) => {
        this.onlineMeetRooms = msg.content
      }
    })
    this.$store.commit('recMessage', (evt) => {
      const msg = JSON.parse(evt.data)
      console.log('msg: ' + JSON.stringify(msg))
      // 统一消息处理
      this.$store.commit('handleMsg', msg)
    })
  }

}
</script>

<style scoped>
  .elHeader {
    background-color: #DE9C53;
    color: #333;
    line-height: 60px;
  }

  .el-aside {
    color: #333;
  }
</style>
