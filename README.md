# vchats

> Vue 实现的视频聊天室客户端

## Build Setup

``` bash
# 安装依赖
npm install

# 注意：使用的是 HTTPS 协议
npm run dev
```

## 结构说明

分了8个自定义组件：

container.vue 是其它组件的父组件，其中 WebRtcPeerSendRecv.vue 是共用组件，UserOpt 和OneToOneBoxContainer 组件用于一对一聊天，BroadcastRoomOpt 和 OneToManyBoxContainer 组件用于一对多聊天，MeetRoomOpt 和 ManyToManyBoxCantainer 组件用于多对多聊天。

<br>

分类的消息处理器均在各自的类别组件中进行注册。通用的消息处理器在 container 中进行注册；总之，要保证接收到服务端消息时，有对应的消息处理器进行处理。