const msgDispatch = {
  handlers: {},
  addHandler: function (id, handler) {
    this.handlers[id] = handler
  },
  handleMsg: function (msg) {
    const id = msg.id
    if (id !== undefined && this.handlers[id] !== undefined) {
      this.handlers[id](msg)
    }
  }
}
export default msgDispatch
