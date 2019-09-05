// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import Vuex from 'vuex'
import 'element-ui/lib/theme-chalk/index.css'
import msgDispatch from './common/MsgDispatcher'
require('./utils/kurento-utils-min.js')
require('./utils/adapter.js')

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    ws: null,
    // 处于通话中
    calling: false,
    // 通话类型 voice 1 video 2 text 4
    callingType: 0,
    // 当前用户
    username: null,
    // 所处域id
    scopeId: '',
    // 通话成员姓名
    members: [],
    // 所处box
    box: '',
    // 消息处理
    msgDispatch: msgDispatch,
    // 创建的 webrtc
    webRtc: {}
  },
  mutations: {
    createCon (state, url) {
      state.ws = new WebSocket(url)
    },
    sendMsg (state, msg) {
      console.log('sendMsg' + msg)
      state.ws.send(msg)
    },
    recMessage (state, onmessage) {
      state.ws.onmessage = onmessage
    },
    conOpen (state, onopen) {
      state.ws.onopen = onopen
    },
    conError (state, error) {
      state.ws.onerror = error
    },
    conClose (state, close) {
      state.ws.onclose = close
    },
    setUsername (state, username) {
      state.username = username
    },
    setCalling (state, calling) {
      state.calling = calling
    },
    setScopeId (state, scopeId) {
      state.scopeId = scopeId
    },
    setBox (state, box) {
      state.box = box
    },
    addHandler (state, payload) {
      state.msgDispatch.addHandler(payload.id, payload.handler)
    },
    handleMsg (state, msg) {
      state.msgDispatch.handleMsg(msg)
    },
    addMember (state, userName) {
      state.members.push(userName)
    },
    addMembers (state, userNames) {
      state.members.push(...userNames)
    },
    removeMember (state, userName) {
      const number = state.members.indexOf(userName)
      if (number > -1) {
        state.members.splice(number, 1)
      }
    },
    clearMembers (state) {
      state.members = []
    },
    addWebRtc (state, payload) {
      state.webRtc[payload.id] = payload.obj
    },
    delWebRtc (state, id) {
      delete state.webRtc[id]
    },
    disposeWebRtc (state, id) {
      console.log(id + '的webrtc准备销毁...')
      if (state.webRtc[id] !== undefined) {
        state.webRtc[id].dispose()
        delete state.webRtc[id]
        console.log(id + '的webrtc已销毁!')
      }
    },
    setCallingType (state, value) {
      state.callingType = value
    }
  }
})
/* eslint-disable no-new */
new Vue({
  name: 'app',
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>'
})
