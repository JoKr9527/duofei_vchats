<template>
  <el-container style="height: 100%; ">
    <el-aside width="200px" style="background-color: rgb(137, 190, 178)" class="el-aside" >
      <el-menu v-on:open="subMenuOpen" v-on:close="subMenuClose" active-text-color="#6699CC" :default-active="activeScopeId" background-color="#89BEB2" unique-opened>
        <el-submenu index="1">
          <template slot="title"><i class="el-icon-user"></i>在线用户</template>
            <el-menu-item :index="onlineUser" v-bind:key="onlineUser" v-for="onlineUser in onlineUsers" @click="calledStart(onlineUser)">
              {{onlineUser}}
            </el-menu-item>
        </el-submenu>
        <el-submenu index="2">
          <template slot="title"><i class="el-icon-s-custom"></i>直播间</template>
          <el-menu-item :index="broadcast.id" v-bind:key="broadcast.id" v-for="broadcast in onlineBroadcastRooms" @click="calledBroadcast(broadcast)">{{broadcast.name}}</el-menu-item>
        </el-submenu>
        <el-submenu index="3">
        <template slot="title"><i class="el-icon-goods"></i>会议</template>
        <el-menu-item :index="meetroom.id" v-bind:key="meetroom.id" v-for="meetroom in onlineMeetRooms" @click="readyMeetRoom(meetroom.id)">{{meetroom.name}}</el-menu-item>
      </el-submenu>
        <el-submenu index="4">
          <template slot="title"><i class="el-icon-user-solid"></i>多人聊天</template>
          <el-menu-item :index="peopleRoom" v-bind:key="peopleRoom" v-for="peopleRoom in onlinePeopleRoom" @click="readyPeopleRoom(peopleRoom)">{{peopleRoom}}</el-menu-item>
        </el-submenu>
        <el-submenu index="5">
          <template slot="title"><i class="el-icon-video-camera-solid"></i>回放</template>
        </el-submenu>
      </el-menu>
    </el-aside>
    <el-container>
      <el-drawer
        :visible.sync="drawer"
        :direction="direction"
        :before-close="handleClose">
        <template slot="title"><i class="el-icon-hot-water">播放列表</i></template>
        <el-row v-bind:key="file" v-for="(file) in fileList" center>
          <u></u>
          <el-col :span="20" center><span>{{file}}</span></el-col>
            <el-col :span="4">
              <el-tooltip content="播放" placement="right" effect="light">
                <el-button icon="el-icon-video-play" @click="filePlay(file)" size="mini" circle></el-button>
              </el-tooltip>
              </el-col>
        </el-row>
      </el-drawer>
      <el-header style="text-align: left; font-size: 12px" v-bind:class="{elHeader: (this.$store.state.box === 'onetoone' && hasMembers) || this.$store.state.box === 'onetomany' || this.$store.state.box === 'manytomany' || this.$store.state.box === 'people'}">
        <span>
          <user-opt v-show="this.$store.state.box === 'onetoone' && hasMembers" :callProcess="callProcess" @reqStart="loadingWaitText"></user-opt>
          <broadcast-room-opt v-show="this.$store.state.box === 'onetomany'" :isPresenter="isPresenter"></broadcast-room-opt>
          <meet-room-opt v-show="this.$store.state.box === 'manytomany'" :isCreator="isCreator"></meet-room-opt>
          <people-room-opt ref="peopleRoomOpt" v-show="this.$store.state.box === 'people'" :onlineUsers="onlineUsers"></people-room-opt>
        </span>
      </el-header>
      <el-main style="width: 100%;height: 100%;">
        <div id="video_box" style="border-color: rgb(201, 186, 131)">
          <one-to-one-box-container ref="oneToOneBox" v-show="this.$store.state.box === 'onetoone' && hasMembers">
          </one-to-one-box-container>
          <one-to-many-box-container ref="oneToManyBox" v-show="this.$store.state.box === 'onetomany'"></one-to-many-box-container>
          <many-to-many-box-container ref="manyToManyBox" v-show="this.$store.state.box === 'manytomany'"></many-to-many-box-container>
          <people-room-box-container ref="peopleBox" v-show="this.$store.state.box === 'people'"></people-room-box-container>
        </div>
      </el-main>
      <el-footer>
        <el-tooltip content="开始录制" placement="top" v-if="this.$store.state.scopeId !== '' && this.$store.state.calling && !isRecord ">
          <el-button icon="el-icon-video-camera" @click="startRecord" circle></el-button>
        </el-tooltip>
        <el-tooltip content="停止录制" placement="bottom" effect="light" v-if="this.$store.state.scopeId !== '' && this.$store.state.calling && isRecord">
          <el-button type="danger" icon="el-icon-video-pause" @click="stopRecord" circle></el-button>
        </el-tooltip>
      </el-footer>
    </el-container>
    <el-dialog @close="closeFilePlay" title="正在播放" :visible.sync="filePlayVisible">
      <video ref="filePlayVideo" autoplay width="720px" height="460px"></video>
    </el-dialog>
    <web-rtc-peer-sendrecv  ref="filePlayWebRtc"></web-rtc-peer-sendrecv>
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
import PeopleRoomOpt from './PeopleRoomOpt'
import PeopleRoomBoxContainer from './PeopleRoomBoxContainer'
import WebRtcPeerSendrecv from './WebRtcPeerSendrecv'
export default {
  components: {
    WebRtcPeerSendrecv,
    PeopleRoomBoxContainer,
    PeopleRoomOpt,
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
      onlinePeopleRoom: [],
      username,
      callProcess,
      loading,
      isRecord: false,
      drawer: false,
      direction: 'rtl',
      fileList: [],
      filePlayVisible: false,
      filePlaying: '',
      isVideoRepository: false,
      uploadFileAction: 'https://192.168.3.213:28644/111',
      videoRepos: ['大侠.mp4', '小侠.mp4', '都挺好.mp4']
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
        this.isVideoRepository = false
        this.$store.commit('setBox', 'onetomany')
        if (!this.$store.state.calling) {
          this.$store.commit('setScopeId', '')
        }
      } else if (index === '3') {
        this.isVideoRepository = false
        this.$store.commit('setBox', 'manytomany')
        if (!this.$store.state.calling) {
          this.$store.commit('setScopeId', '')
        }
      } else if (index === '1') {
        this.isVideoRepository = false
        this.$store.commit('setBox', 'onetoone')
        if (!this.$store.state.calling) {
          this.init()
        }
      } else if (index === '4') {
        this.isVideoRepository = false
        this.$store.commit('setBox', 'people')
        if (!this.$store.state.calling) {
          this.init()
        }
      } else if (index === '5') {
        this.isVideoRepository = false
        if (!this.$store.state.calling) {
          this.drawer = true
          this.$store.commit('setBox', '')
          const msg = {
            id: 'reqPlayFiles',
            from: this.$store.state.username,
            messageType: 'RecordMsg'
          }
          this.$store.commit('sendMsg', JSON.stringify(msg))
        }
      }
    },
    subMenuClose: function (index) {
      if (index === '2') {
        this.isVideoRepository = false
        this.$store.commit('setBox', 'onetomany')
        if (!this.$store.state.calling) {
          this.$store.commit('setScopeId', '')
        }
      } else if (index === '3') {
        this.isVideoRepository = false
        this.$store.commit('setBox', 'manytomany')
        if (!this.$store.state.calling) {
          this.$store.commit('setScopeId', '')
        }
      } else if (index === '1') {
        this.isVideoRepository = false
        this.$store.commit('setBox', 'onetoone')
        if (!this.$store.state.calling) {
          this.init()
        }
      } else if (index === '4') {
        this.isVideoRepository = false
        this.$store.commit('setBox', 'people')
        if (!this.$store.state.calling) {
          this.init()
        }
      } else if (index === '5') {
        this.isVideoRepository = false
        if (!this.$store.state.calling) {
          this.drawer = true
          this.$store.commit('setBox', '')
          const msg = {
            id: 'reqPlayFiles',
            from: this.$store.state.username,
            messageType: 'RecordMsg'
          }
          this.$store.commit('sendMsg', JSON.stringify(msg))
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
    },
    // 响应具体多人聊天室的点击事件
    readyPeopleRoom (scopeId) {
      this.$store.commit('setScopeId', scopeId)
    },
    startRecord () {
      this.isRecord = true
      const self = this
      // 发送录制消息
      const msg = {
        id: 'startRecord',
        from: self.$store.state.username,
        to: self.$store.state.scopeId,
        messageType: 'RecordMsg'
      }
      this.$store.commit('sendMsg', JSON.stringify(msg))
    },
    stopRecord () {
      this.isRecord = false
      const self = this
      // 发送停止录制消息
      // 发送录制消息
      const msg = {
        id: 'stopRecord',
        from: self.$store.state.username,
        to: self.$store.state.scopeId,
        messageType: 'RecordMsg'
      }
      this.$store.commit('sendMsg', JSON.stringify(msg))
    },
    handleClose () {
      this.drawer = false
    },
    filePlay (file) {
      this.drawer = false
      this.filePlayVisible = true
      this.$nextTick(() => {
        const self = this
        const message = {
          id: 'sdpOffer',
          from: this.$store.state.username,
          to: file,
          other: this.$store.state.username + file,
          messageType: 'SdpMsg'
        }
        self.filePlaying = message.other
        const oncandidategatheringdone = function () {
          // 发送播放请求
          const msg = {
            id: 'playFile',
            from: self.$store.state.username,
            content: file,
            messageType: 'RecordMsg'
          }
          self.$store.commit('sendMsg', JSON.stringify(msg))
          console.log('发送播放请求')
        }
        const filePlayVideo = self.$refs.filePlayVideo
        filePlayVideo.src = ''
        filePlayVideo.addEventListener('canplay', function (e) {
          console.log('文件视频已准备好开始播放')
        })
        self.$refs.filePlayWebRtc.createWebRtcPeerRecvonlyBySpecialIcecandidateCallback(filePlayVideo, message, oncandidategatheringdone)
      })
    },
    closeFilePlay () {
      this.$store.commit('disposeWebRtc', this.filePlaying)
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
    // 添加可用多人聊天
    this.$store.commit('addHandler', {
      id: 'onlinePeopleRoom',
      handler: (msg) => {
        this.onlinePeopleRoom.push(msg.content)
      }
    })
    // 添加移除多人聊天消息处理器
    this.$store.commit('addHandler', {
      id: 'removeOnlinePeopleRoom',
      handler: (msg) => {
        const index = this.onlinePeopleRoom.indexOf(msg.content)
        this.onlinePeopleRoom.splice(index, 1)
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
        } else if (msg.content === 8) {
          self.open('屏幕共享', msg.from + ' 请求与你共享屏幕', msg.from, msg.content)
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
          console.log('开始激活多对多域')
          self.$store.commit('sendMsg', JSON.stringify(waitSendMsg))
        }
        self.$refs.manyToManyBox.createWebRtcPeerSendonly(message, oncandidategatheringdone)
        self.$store.commit('setScopeId', msg.content)
      }
    })
    // 用户收到多人聊天视频请求
    this.$store.commit('addHandler', {
      id: 'inviteJoinPeopleRoom',
      handler: (msg) => {
        console.log(msg)
        this.$refs.peopleRoomOpt.clearSelectOnlineUsersVisible()
        const respMsg = {
          id: 'respInviteJoinPeopleRoom',
          from: this.username,
          to: msg.other,
          messageType: 'PeopleRoomMsg'
        }
        this.$confirm(msg.content.toString(), '多人通话', {
          distinguishCancelAndClose: true,
          confirmButtonText: '接受',
          cancelButtonText: '拒绝'
        }).then(() => {
          this.$message({
            type: 'info',
            message: '正在连接...'
          })
          respMsg.content = 'accept'
          this.$store.commit('sendMsg', JSON.stringify(respMsg))
          // 初始化内容
          this.$store.commit('setCalling', true)
          this.$store.commit('setCallingType', 3)
          this.$store.commit('clearMembers')
          this.$store.commit('addMembers', msg.content)
          this.$store.commit('setScopeId', '')
          this.$store.commit('setBox', 'people')
        }).catch(action => {
          this.$message({
            type: 'info',
            message: action === 'cancel'
              ? '已拒绝请求'
              : '已忽略请求'
          })
          if (action === 'cancel') {
            respMsg.content = 'refuse'
            this.$store.commit('sendMsg', JSON.stringify(respMsg))
          }
        })
      }
    })
    // 用户收到多人视频聊天域
    this.$store.commit('addHandler', {
      id: 'peopleRoomSuccess',
      handler: (msg) => {
        /* if (this.$store.state.scopeId === msg.content) {
          return
        } */
        const self = this
        this.$store.commit('setScopeId', msg.content)
        this.$refs.peopleRoomOpt.clearSelectOnlineUsersVisible()
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
            messageType: 'PeopleRoomMsg'
          }
          console.log('开始激活多人视频聊天')
          self.$store.commit('sendMsg', JSON.stringify(waitSendMsg))
        }
        self.$store.commit('setScopeId', msg.content)
        self.$store.commit('setCalling', true)
        self.$refs.peopleBox.createWebRtcPeerSendRecv(message, oncandidategatheringdone)
      }
    })
    // 可播放文件列表
    this.$store.commit('addHandler', {
      id: 'playFiles',
      handler: (msg) => {
        this.fileList = msg.content
      }
    })
    // next ...
    // 用户收到错误消息处理
    this.$store.commit('addHandler', {
      id: 'errorMsg',
      handler: (msg) => {
        const self = this
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
  .el-row {
    margin-left: 20px;margin-bottom: 20px;
  }
  .bg-purple-light {
    background: #e5e9f2;
  }
</style>
