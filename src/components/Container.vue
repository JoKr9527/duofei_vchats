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
          <user-opt v-show="this.$store.state.box === 'onetoone' && hasMembers" :callProcess="callProcess" @reqStart="loadingWaitText"></user-opt>
          <broadcast-room-opt v-show="this.$store.state.box === 'onetomany'" :isPresenter="isPresenter"></broadcast-room-opt>
          <meet-room-opt v-show="this.$store.state.box === 'manytomany'" :isCreator="isCreator"></meet-room-opt>
        </span>
      </el-header>
      <el-main style="width: 100%;height: 100%;">
        <div id="video_box" style="border-color: rgb(201, 186, 131)">
          <one-to-one-box-container ref="oneToOneBox" v-show="this.$store.state.box === 'onetoone' && hasMembers">
          </one-to-one-box-container>
          <one-to-many-box-container ref="oneToManyBox" v-show="this.$store.state.box === 'onetomany'"></one-to-many-box-container>
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
    open (title, text, to, type) {
      this.$confirm(text, title, {
        distinguishCancelAndClose: true,
        confirmButtonText: '接受',
        cancelButtonText: '拒绝'
      }).then(() => {
        this.$message({
          type: 'info',
          message: '正在连接...'
        })
        const msg = {
          id: 'callResp',
          from: this.username,
          to: to,
          content: 'accept',
          messageType: 'OneToOneMsg'
        }
        this.$store.commit('sendMsg', JSON.stringify(msg))
        // 初始化内容
        this.$store.commit('setCalling', true)
        this.$store.commit('setCallingType', type)
        this.$store.commit('clearMembers')
        this.$store.commit('addMember', to)
        this.$store.commit('setScopeId', '')
        this.$store.commit('setBox', 'onetoone')
        this.callProcess.calledUsername = to
      }).catch(action => {
        this.$message({
          type: 'info',
          message: action === 'cancel'
            ? '已拒绝请求'
            : '已忽略请求'
        })
        if (action === 'cancel') {
          const msg = {
            id: 'callResp',
            from: this.username,
            to: to,
            content: 'refuse',
            messageType: 'OneToOneMsg'
          }
          this.$store.commit('sendMsg', JSON.stringify(msg))
        }
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
    loadingWaitText () {
      this.loadingBox('等待对方应答')
    },
    // 点击具体直播间触发的事件
    calledBroadcast (broadcast) {
      this.$store.commit('setScopeId', broadcast.id)
    },
    // 响应具体会议室的点击事件
    readyMeetRoom (scopeId) {
      this.$store.commit('setScopeId', scopeId)
    }
  },
  mounted () {
    const self = this
    const url = 'wss://192.168.3.18:8081/v-charts/chat?userName=' + this.username
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
    // 添加可用直播间消息处理器
    this.$store.commit('addHandler', {
      id: 'onlineBroadcastRoom',
      handler: (msg) => {
        this.onlineBroadcastRooms = msg.content
      }
    })
    // 添加可用会议室消息处理期
    this.$store.commit('addHandler', {
      id: 'onlineMeetRoom',
      handler: (msg) => {
        this.onlineMeetRooms = msg.content
      }
    })
    // 用户接收到iceCandidate消息
    this.$store.commit('addHandler', {
      id: 'iceCandidate',
      handler: (msg) => {
        const webRtc = self.$store.state.webRtc[msg.from]
        if (webRtc !== undefined) {
          console.log('处理 icecandidate')
          webRtc.addIceCandidate(msg.content, error => {
            if (error) { return console.error('Error adding candidate: ' + error) }
          })
        }
      }
    })
    // 用户接收到 sdp answer
    this.$store.commit('addHandler', {
      id: 'sdpAnswer',
      handler: (msg) => {
        const webRtc = self.$store.state.webRtc[msg.from]
        if (webRtc !== undefined) {
          console.log('处理接收到的sdpanswer 消息')
          webRtc.processAnswer(msg.content, function (error) {
            if (error) {
              return console.error(error)
            }
          })
        }
      }
    })
    // 用户收到视频请求
    this.$store.commit('addHandler', {
      id: 'call',
      handler: (msg) => {
        if (msg.content === 2 || msg.content === 3) {
          self.open('视频通话', msg.from + ' 请求与你视频通话', msg.from, msg.content)
        } else if (msg.content === 1) {
          self.open('语音通话', msg.from + ' 请求与你语音通话', msg.from, msg.content)
        }
      }
    })
    // 用户收到请求响应
    this.$store.commit('addHandler', {
      id: 'callResp',
      handler: (msg) => {
        if (msg.content === 'accept') {
          self.loading.text = '对方已接受，连接建立中...'
        } else if (msg.content === 'refuse') {
          self.loading.text = '对方已拒绝'
          self.$store.commit('setCalling', false)
          this.$store.commit('clearMembers')
        }
        setTimeout(() => {
          if (self.loading !== null) {
            self.loading.close()
          }
        }, 1500)
      }
    })
    // 用户收到一对一域id
    this.$store.commit('addHandler', {
      id: 'oneToOneScopeSuccess',
      handler: (msg) => {
        const message = {
          id: 'sdpOffer',
          from: self.$store.state.username,
          to: msg.content,
          other: self.$store.state.username,
          messageType: 'SdpMsg'
        }
        const oncandidategatheringdone = function () {
          // 开始激活域
          const waitSendMsg = {
            id: 'active',
            from: self.$store.state.username,
            to: msg.content,
            other: self.$store.state.username,
            messageType: 'OneToOneMsg'
          }
          console.log('开始激活一对一域')
          self.$store.commit('sendMsg', JSON.stringify(waitSendMsg))
        }
        self.$refs.oneToOneBox.createWebRtcPeerSendRecv(message, oncandidategatheringdone)
        self.$store.commit('setScopeId', msg.content)
      }
    })
    // 用户创建一对多域成功后，收到一对多域id
    this.$store.commit('addHandler', {
      id: 'oneToManyScopeSuccess',
      handler: (msg) => {
        const message = {
          id: 'sdpOffer',
          from: self.$store.state.username,
          to: msg.content,
          other: self.$store.state.username,
          messageType: 'SdpMsg'
        }
        const oncandidategatheringdone = function () {
          // 开始激活域
          const waitSendMsg = {
            id: 'active',
            from: self.$store.state.username,
            to: msg.content,
            other: self.$store.state.username,
            messageType: 'OneToManyMsg'
          }
          console.log('开始激活一对多域')
          self.$store.commit('sendMsg', JSON.stringify(waitSendMsg))
        }
        self.$refs.oneToManyBox.createWebRtcPeerSendonly(message, oncandidategatheringdone)
        self.$store.commit('setScopeId', msg.content)
      }
    })
    // 用户加入一对多域成功后，收到一对多域id
    this.$store.commit('addHandler', {
      id: 'joinOneToManyScopeSuccess',
      handler: (msg) => {
        const message = {
          id: 'sdpOffer',
          from: self.$store.state.username,
          to: msg.content,
          other: self.$store.state.username,
          messageType: 'SdpMsg'
        }
        const oncandidategatheringdone = function () {
          // 开始激活域
          const waitSendMsg = {
            id: 'active',
            from: self.$store.state.username,
            to: msg.content,
            other: self.$store.state.username,
            messageType: 'OneToManyMsg'
          }
          console.log('开始激活一对多域')
          self.$store.commit('sendMsg', JSON.stringify(waitSendMsg))
        }
        self.$refs.oneToManyBox.createWebRtcPeerRecvonly(message, oncandidategatheringdone)
        self.$store.commit('setScopeId', msg.content)
      }
    })
    // 用户收到加入多对多域成功后，收到多对多域id
    this.$store.commit('addHandler', {
      id: 'joinManyToManyScopeSuccess',
      handler: (msg) => {
        const self = this
        const message = {
          id: 'sdpOffer',
          from: self.$store.state.username,
          to: self.$store.state.scopeId,
          other: self.$store.state.username,
          messageType: 'SdpMsg'
        }
        const oncandidategatheringdone = function () {
          // 开始激活域
          const waitSendMsg = {
            id: 'active',
            from: self.$store.state.username,
            to: self.$store.state.scopeId,
            other: self.$store.state.username,
            messageType: 'GroupMsg'
          }
          console.log('开始激活一对一域')
          self.$store.commit('sendMsg', JSON.stringify(waitSendMsg))
        }
        self.$refs.manyToManyBox.createWebRtcPeerSendonly(message, oncandidategatheringdone)
        self.$store.commit('setScopeId', msg.content)
      }
    })
    // next ...
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
