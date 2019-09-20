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
    // 通话类型 voice 1 video 2 text 4 screen 8
    callingType: 0,
    // 当前用户
    username: null,
    // 所处域id
    scopeId: '',
    // 通话成员姓名
    members: [],
    // 所处box: people manytomany onetomany onetoone
    box: '',
    // 消息处理
    msgDispatch: msgDispatch,
    // 创建的 webrtc
    webRtc: {},
    dataChannels: false
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
    },
    setDataChannels (state, value) {
      state.dataChannels = value
    }
  }
})

/**
 * 转换成图片表情
 */
function toEmotion (text, isNoGif) {
  var list = ['微笑', '撇嘴', '色', '发呆', '得意', '流泪', '害羞', '闭嘴', '睡', '大哭', '尴尬', '发怒', '调皮', '呲牙', '惊讶', '难过', '酷', '冷汗', '抓狂', '吐', '偷笑', '愉快', '白眼', '傲慢', '饥饿', '困', '惊恐', '流汗', '憨笑', '大兵', '奋斗', '咒骂', '疑问', '嘘', '晕', '折磨', '衰', '骷髅', '敲打', '再见', '擦汗', '抠鼻', '鼓掌', '糗大了', '坏笑', '左哼哼', '右哼哼', '哈欠', '鄙视', '委屈', '快哭了', '阴险', '亲亲', '吓', '可怜', '菜刀', '西瓜', '啤酒', '篮球', '乒乓', '咖啡', '饭', '猪头', '玫瑰', '凋谢', '示爱', '爱心', '心碎', '蛋糕', '闪电', '炸弹', '刀', '足球', '瓢虫', '便便', '月亮', '太阳', '礼物', '拥抱', '强', '弱', '握手', '胜利', '抱拳', '勾引', '拳头', '差劲', '爱你', 'NO', 'OK', '爱情', '飞吻', '跳跳', '发抖', '怄火', '转圈', '磕头', '回头', '跳绳', '挥手', '激动', '街舞', '献吻', '左太极', '右太极', '嘿哈', '捂脸', '奸笑', '机智', '皱眉', '耶', '红包', '鸡']

  if (!text) {
    return text
  }

  text = text.replace(/\[[\u4E00-\u9FA5]{1,3}\]/gi, function (word) {
    var newWord = word.replace(/\[|\]/gi, '')
    var index = list.indexOf(newWord)
    var backgroundPositionX = -index * 24
    var imgHTML = ''
    if (index < 0) {
      return word
    }

    if (isNoGif) {
      if (index > 104) {
        return word
      }
      imgHTML = `<i class="static-emotion" style="background:url(https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/default218877.gif) ${backgroundPositionX}px 0;"></i>`
    } else {
      var path = index > 104 ? '/img' : 'https://res.wx.qq.com/mpres/htmledition/images/icon'
      imgHTML = `<img class="static-emotion-gif" style="vertical-align: middle" src="${path}/emotion/${index}.gif">`
    }
    return imgHTML
  })
  return text
}

Vue.directive('emotion', {
  bind: function (el, binding) {
    el.innerHTML = toEmotion(binding.value)
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
