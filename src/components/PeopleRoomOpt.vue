<template>
  <div>
    <el-select v-if="!this.$store.state.calling" v-model="value" placeholder="请选择" :value="value" @change="changeV">
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value">
      </el-option>
    </el-select>
    <el-button type="primary" v-if="!this.$store.state.calling" @click="invitePeople" round>发起多人聊天</el-button>
    <el-dialog title="在线用户" :visible.sync="selectOnlineUsersVisible" top="10vh" width="300px" center>
      <span>
        <el-checkbox-group v-model="selectedOnlineUsers" size="mini">
          <ul>
            <li v-bind:key="user" v-for="user in onlineUsers">
              <el-checkbox :label="user" style="height: 20px"></el-checkbox>
            </li>
          </ul>
        </el-checkbox-group>
      </span>
      <span slot="footer" class="dialog-footer">
          <el-button type="primary" round @click="sendInvitePeople">邀请</el-button>
        </span>
    </el-dialog>
    <el-button type="success" v-if="this.$store.state.scopeId !== '' && !this.$store.state.calling" round>加入多人聊天</el-button>
    <el-button type="danger" v-if="this.$store.state.scopeId !== '' && this.$store.state.calling " round>退出多人聊天</el-button>
  </div>
</template>

<script>
export default {
  name: 'PeopleRoomOpt',
  props: ['onlineUsers'],
  data () {
    const value = '3'
    return {
      options: [{
        value: '3',
        label: '摄像头'
      }, {
        value: '8',
        label: '录屏'
      }],
      value,
      selectOnlineUsersVisible: false,
      selectedOnlineUsers: []
    }
  },
  watch: {
    onlineUsers: {
      handler (newValue, oldValue) {
        console.log('new Value' + newValue)
        console.log('old Value' + oldValue)
      },
      deep: true
    }
  },
  methods: {
    invitePeople () {
      this.selectOnlineUsersVisible = true
      this.selectedOnlineUsers = []
    },
    changeV (v) {
      this.$store.commit('setCallingType', parseInt(v))
    },
    clearSelectOnlineUsersVisible () {
      this.selectOnlineUsersVisible = false
    },
    sendInvitePeople () {
      const message = {
        id: 'inviteJoinPeopleRoom',
        from: this.$store.state.username,
        content: this.selectedOnlineUsers,
        messageType: 'PeopleRoomMsg'
      }
      this.$store.commit('sendMsg', JSON.stringify(message))
    }
  }
}
</script>

<style scoped>

</style>
