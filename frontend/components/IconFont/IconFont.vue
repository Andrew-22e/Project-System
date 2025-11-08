<template>
  <text 
    class="iconfont" 
    :class="[`icon-${name}`, customClass]"
    :style="iconStyle"
    @click="handleClick"
  ></text>
</template>

<script>
export default {
  name: 'IconFont',
  props: {
    // 图标名称
    name: {
      type: String,
      required: true
    },
    // 图标大小
    size: {
      type: [String, Number],
      default: 16
    },
    // 图标颜色
    color: {
      type: String,
      default: '#333'
    },
    // 自定义类名
    customClass: {
      type: String,
      default: ''
    }
  },
  computed: {
    iconStyle() {
      const style = {}
      if (this.size) {
        style.fontSize = typeof this.size === 'number' ? `${this.size}px` : this.size
      }
      if (this.color) {
        style.color = this.color
      }
      return style
    }
  },
  methods: {
    handleClick(event) {
      this.$emit('click', event)
    }
  }
}
</script>

<style scoped>
.iconfont {
  display: inline-block;
  line-height: 1;
  vertical-align: middle;
}
</style>
