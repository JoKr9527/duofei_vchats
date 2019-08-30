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
          messageProcessMode: 'mutual',
          messageType: 'user'
        }
        this.$store.commit('sendMsg', JSON.stringify(message))
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        })
      })
    },
    // 点击加入直播间触发的事件
    joinBroadcastRoom () {
      this.$emit('joinBroadcastRoomSuccess')
    },
    // 点击关闭直播间触发的事件
    closeBroadcastRoom () {
      this.$emit('closeBroadcastRoom')
    },
    // 点击退出直播间触发的事件
    quitBroadcastRoom () {
      this.$emit('quitBroadcastRoom')
    }
  },
  mounted () {
    const self = this
    // 用户接收到创建直播间响应信息
    this.$store.commit('addHandler', {
      id: 'createBroadcastRoomResp',
      handler: function (msg) {
        if (msg.type === 'success') {
          self.$message({
            type: msg.type,
            message: '创建直播间成功！'
          })
          self.$store.commit('setScopeId', msg.content)
          self.$store.commit('setCalling', true)
          // 触发直播间创建成功事件
          self.$emit('createBroadcastRoomSuccess')
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
