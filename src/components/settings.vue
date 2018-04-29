<template>
  <div class="settings" v-bind:class="{ hidden: isHidden }" v-on:click="isHidden = !isHidden">
    <button class="icon-btn settings">
      <font-awesome-icon :icon="icon" />
    </button>
    <div class="panel">
    </div>
  </div>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import faCog from '@fortawesome/fontawesome-free-solid/faCog'

export default {
  data: function() {
    return {
      isHidden: true
    }
  },
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
  .settings {
    &.hidden .panel {
      display: none;
    }
    .panel {
      padding: 20px;
      background: #b0c0c7;
      color: white;
    }

    button.icon-btn {
      background: none;
      color: black;
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
  }
</style>
