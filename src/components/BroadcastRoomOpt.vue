<template>
  <el-row>
    <el-button type="primary" v-if="this.$store.state.scopeId === ''" @click="createBroadcastRoom" round>创建直播间</el-button>
    <el-button type="success" v-if="this.$store.state.scopeId !== '' && !this.$store.state.calling" @click="joinBroadcastRoom" round>加入直播间</el-button>
    <el-button type="danger" v-if="this.$store.state.scopeId !== '' && this.$store.state.calling && !isPresenter" @click="quitBroadcastRoom" round>退出直播间</el-button>
    <el-button type="danger" v-if="this.$store.state.scopeId !== '' && this.$store.state.calling && isPresenter" @click="closeBroadcastRoom" round>关闭直播间</el-button>
  </el-row>
</template>

<script>
export default {
  name: 'BroadcastRoomOpt',
  props: ['isPresenter'],
  methods: {
    createBroadcastRoom () {
      this.$prompt('', '请输入直播间名称', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        const message = {
          id: 'createBroadcastRoom',
          from: this.$store.state.username,
          content: value,
          messageType: 'OneToManyMsg'
        }
        this.$store.commit('sendMsg', JSON.stringify(message))
        this.$store.commit('setCalling', true)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        })
      })
    },
    // 点击加入直播间触发的事件
    joinBroadcastRoom () {
      const message = {
        id: 'joinBroadcastRoom',
        from: this.$store.state.username,
        to: this.$store.state.scopeId,
        messageType: 'OneToManyMsg'
      }
      this.$store.commit('sendMsg', JSON.stringify(message))
      this.$store.commit('setCalling', true)
    },
    // 点击关闭直播间触发的事件
    closeBroadcastRoom () {
      // 发送直播间关闭消息
      const msg = {
        id: 'closeBroadcastRoom',
        from: this.$store.state.username,
        to: this.$store.state.scopeId,
        content: '当前观看的直播间已关闭',
        messageType: 'OneToManyMsg'
      }
      this.$store.commit('sendMsg', JSON.stringify(msg))
      console.log('当前直播间已关闭')
      this.$store.commit('disposeWebRtc', this.$store.state.username)
      this.$store.commit('setCalling', false)
      this.$store.commit('setScopeId', '')
      this.$store.commit('clearMembers')
    },
    // 点击退出直播间触发的事件
    quitBroadcastRoom () {
      // 发送直播间关闭消息
      const msg = {
        id: 'quitBroadcastRoom',
        from: this.$store.state.username,
        to: this.$store.state.scopeId,
        content: this.$store.state.username + '退出直播间',
        messageType: 'OneToManyMsg'
      }
      this.$store.commit('sendMsg', JSON.stringify(msg))
      this.$store.commit('disposeWebRtc', this.$store.state.username)
      this.$store.commit('setCalling', false)
      this.$store.commit('setScopeId', '')
      this.$store.commit('clearMembers')
    }
  },
  mounted () {
  }
}
</script>

<style scoped>

</style>
