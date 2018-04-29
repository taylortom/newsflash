<template>
  <div class="settings">
    <button class="icon-btn settings">
      <font-awesome-icon :icon="icon" />
    </button>
  </div>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import faCog from '@fortawesome/fontawesome-free-solid/faCog'

export default {
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  computed: {
    icon: () => { return faCog; }
  },
  components: {
    FontAwesomeIcon
  }
}
</script>

<style lang="less">
  button.icon-btn {
    background: none;
    border: none;
    padding: 10px;
    font-size: 16px;
    outline: none;
    cursor: pointer;

    &.settings {
      position: absolute;
      right: 0;
      top: 70px;
    }
  }
</style>
