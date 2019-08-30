<template>
  <el-row>
    <el-button :disabled=true>{{'对方：' + callProcess.calledUsername}}</el-button>
    <el-button type="primary" :disabled="this.$store.state.calling" @click="openFullScreen" round>语音通话</el-button>
    <el-button type="success" :disabled="this.$store.state.calling" @click="openFullScreen" round>视频通话</el-button>
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
    openFullScreen () {
      this.$emit('loadingBox')
      const msg = {
        id: 'reqVideoCall',
        from: this.$store.state.username,
        to: this.callProcess.calledUsername,
        content: this.$store.state.username + '请求与你视频通话',
        messageType: 'user',
        messageProcessMode: 'redirect'
      }
      // 在发送消息之前，添加响应消息
      this.$store.commit('addHandler', 'reqVideoRepAccept', (msg) => {
        this.loading.text = msg.content
        setTimeout(() => {
          if (this.loading !== null) {
            this.loading.close()
          }
        }, 1500)
      })
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
          messageProcessMode: 'mutual',
          messageType: 'user'
        }
        this.$store.commit('sendMsg', JSON.stringify(msg))
      }
      this.$emit('hangup')
    }
  }
}
</script>

<style scoped>

</style>
