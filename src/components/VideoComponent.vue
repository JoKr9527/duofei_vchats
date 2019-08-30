<template>
  <div>
  <video v-bind:key = "n" v-for="n in number" ref="videos" autoplay width="240px" height="180px"
         poster=""></video>
  </div>
</template>

<script>
export default {
  name: 'videoComponent',
  props: ['number'],
  data: function () {
    return {}
  },
  methods: {}
}
</script>

<style scoped>

</style>
