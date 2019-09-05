<template>
  <el-row>
    <el-button :disabled=true>{{'对方：' + callProcess.calledUsername}}</el-button>
    <el-button type="primary" :disabled="this.$store.state.calling" @click="callVoice" round>语音通话</el-button>
    <el-button type="success" :disabled="this.$store.state.calling" @click="callVideoIncludeVoice" round>视频通话</el-button>
    <el-button type="info" :disabled="this.$store.state.calling"  round>文本聊天</el-button>
    <el-button type="warning" :disabled="this.$store.state.calling" round>录屏</el-button>
    <el-button type="danger" :disabled="!this.$store.state.calling" @click="hangup" round>挂断</el-button>
  </el-row>
</template>

<script>
export default {
  name: 'UserOpt',
  props: ['callProcess'],
  data () {
    return {
    }
  },
  methods: {
    callVoice () {
      this.$emit('reqStart')
      const msg = {
        id: 'call',
        from: this.$store.state.username,
        to: this.callProcess.calledUsername,
        content: 1,
        messageType: 'OneToOneMsg'
      }
      this.$store.commit('setCallingType', 1)
      this.$store.commit('setCalling', true)
      this.$store.commit('sendMsg', JSON.stringify(msg))
    },
    callVideoIncludeVoice () {
      this.$emit('reqStart')
      const msg = {
        id: 'call',
        from: this.$store.state.username,
        to: this.callProcess.calledUsername,
        content: 3,
        messageType: 'OneToOneMsg'
      }
      this.$store.commit('setCallingType', 3)
      this.$store.commit('setCalling', true)
      this.$store.commit('sendMsg', JSON.stringify(msg))
    },
    hangup () {
      if (this.$store.state.scopeId !== '') {
        // 向远程发送 挂断消息
        const msg = {
          id: 'hangup',
          from: this.$store.state.username,
          to: this.$store.state.scopeId,
          content: '对方已挂断',
          messageType: 'OneToOneMsg'
        }
        this.$store.commit('sendMsg', JSON.stringify(msg))
      }
      this.$store.commit('disposeWebRtc', this.$store.state.username)
      this.$store.commit('setCalling', false)
      this.$store.commit('setScopeId', '')
      this.$store.commit('clearMembers')
    }
  }
}
</script>

<style scoped>

</style>
