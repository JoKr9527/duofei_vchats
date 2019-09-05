<template>
  <div>
    <el-button type="primary" v-if="this.$store.state.scopeId === ''" @click="createMeetRoom" round>创建会议室</el-button>
    <el-button type="success" v-if="this.$store.state.scopeId !== '' && !this.$store.state.calling" @click="joinMeetRoom" round>加入会议室</el-button>
    <el-button type="danger" v-if="this.$store.state.scopeId !== '' && this.$store.state.calling " @click="quitMeetRoom" round>退出会议室</el-button>
    <el-button type="danger" v-if="this.$store.state.scopeId !== '' && this.$store.state.calling && isCreator" @click="closeMeetRoom" round>关闭会议室</el-button>
  </div>
</template>

<script>
export default {
  name: 'MeetRoomOpt',
  props: ['isCreator'],
  methods: {
    createMeetRoom () {
      this.$prompt('', '请输入会议室名称', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        const message = {
          id: 'createMeetRoom',
          from: this.$store.state.username,
          content: value,
          messageType: 'GroupMsg'
        }
        this.$store.commit('sendMsg', JSON.stringify(message))
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        })
      })
    },
    joinMeetRoom () {
      const message = {
        id: 'joinMeetRoom',
        from: this.$store.state.username,
        to: this.$store.state.scopeId,
        other: this.$store.state.username,
        messageType: 'GroupMsg'
      }
      this.$store.commit('sendMsg', JSON.stringify(message))
      this.$store.commit('setCalling', true)
      this.$store.commit('clearMembers')
    },
    disposeAllWebRtc () {
      // 销毁自身的 webrtc
      this.$store.commit('disposeWebRtc', this.$store.state.username)
      // 销毁 members的webrtc
      this.$store.state.members.forEach((member) => {
        this.$store.commit('disposeWebRtc', this.$store.state.username + member)
      })
    },
    quitMeetRoom () {
      this.disposeAllWebRtc()
      // 发送退出会议室消息
      const quitMeetRoomMsg = {
        id: 'quitMeetRoom',
        from: this.$store.state.username,
        to: this.$store.state.scopeId,
        messageType: 'GroupMsg'
      }
      this.$store.commit('sendMsg', JSON.stringify(quitMeetRoomMsg))
      console.log('退出会议室')
      this.$store.commit('setCalling', false)
      this.$store.commit('clearMembers')
    },
    closeMeetRoom () {
      this.disposeAllWebRtc()
      // 发送关闭会议室消息
      const closeMeetRoomMsg = {
        id: 'closeMeetRoom',
        from: this.$store.state.username,
        to: this.$store.state.scopeId,
        messageType: 'GroupMsg'
      }
      this.$store.commit('sendMsg', JSON.stringify(closeMeetRoomMsg))
      console.log('关闭会议室')
      this.$store.commit('setCalling', false)
      this.$store.commit('clearMembers')
    }
  },
  mounted () {
    const self = this
    // 用户接收到创建会议室响应信息
    this.$store.commit('addHandler', {
      id: 'createMeetRoomResp',
      handler: function (msg) {
        if (msg.type === 'success') {
          self.$message({
            type: msg.type,
            message: '创建会议室成功！'
          })
        } else {
          self.$message({
            type: msg.type,
            message: msg.content
          })
        }
      }
    })
  }
}
</script>

<style scoped>

</style>
