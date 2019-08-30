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
    // 当前用户
    username: null,
    // 所处域id
    scopeId: '',
    // 通话成员姓名
    members: [],
    // 所处box
    box: '',
    // 消息处理
    msgDispatch: msgDispatch
  },
  mutations: {
    createCon (state, url) {
      state.ws = new WebSocket(url)
    },
    sendMsg (state, msg) {
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
