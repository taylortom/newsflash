<template>
  <div class="feed" v-bind:class="classname">
    <div class="title">{{title}}</div>
    <div class="headlines">
      <Headline v-for="(headline, index) in headlines" :headline="headline" :key="index" :index="index+1" v-bind:showIndex="showIndex"/>
    </div>
  </div>
</template>

<script>
  import Headline from './headline.vue';

  export default {
    props: {
      title: {
        type: String,
        required: true
      },
      headlines: {
        type: Array,
        required: true
      },
      classname: {
        type: String,
        required: false
      },
      showIndex: {
        type: Boolean,
        required: false
      }
    },
    components: {
      Headline
    }
  }
</script>

<style lang="less">
  .feed {
    > .title {
      padding: 10px;
      padding-left: 35px;
      background: #b0c0c7;
      color: white;
      font-size: 18px;
    }
    .headlines {
      padding: 20px 35px;
      border-top: 1px solid #b0c0c7;
      border-bottom: 1px solid #b0c0c7;
      background: white;
      min-height: 100px;
    }
    // custom styles
    &.latest {
      .headlines {
        background: none;
      }
    }
  }

</style>
