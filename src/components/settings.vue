<template>
  <div class="settings" v-bind:class="{ hidden: isHidden }">
    <button class="icon-btn open" v-on:click="isHidden = !isHidden">
      <font-awesome-icon :icon="openIcon" />
    </button>
    <div class="panel">
      <button class="icon-btn close" v-on:click="isHidden = !isHidden">
        <font-awesome-icon :icon="closeIcon" />
      </button>
      <div class="inner"></div>
  </div>
  </div>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faCog from '@fortawesome/fontawesome-free-solid/faCog'
  import faTimes from '@fortawesome/fontawesome-free-solid/faTimes'

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
      openIcon: () => { return faCog; },
      closeIcon: () => { return faTimes; }
    },
    components: {
      FontAwesomeIcon
    }
  }
</script>

<style lang="less">
  button.icon-btn {
    background: none;
    color: #657075;
    border: none;
    padding: 10px;
    font-size: 16px;
    outline: none;
    cursor: pointer;

    &.open {
      position: absolute;
      opacity: 0;
      transition-property: none;
    }
    &.close {
      float: right;
    }
  }

  .settings {
    float: left;
    height: 100vh;
    &.hidden {
      margin-right: 0;
      button.open {
        opacity: 1;
        transition-property: opacity;
        transition-delay: 0.25s;
      }
      .panel {
        width: 0;
      }
    }
    .panel {
      height: 100%;
      width: 300px;
      background: #b0c0c7;
      transition: width 0.3s;

      .inner {
        padding: 20px;
      }
    }
  }
</style>
