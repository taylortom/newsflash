<template>
  <div class="headline">
    <!-- <div class="thumb">
      <img :src="headline.thumbnail" alt="">
    </div> -->
    <div class="title"><a :href="headline.link" target="_blank"><span v-if="showIndex">{{index}}. </span>{{headline.title}}</a></div>
    <div class="blurb" v-html="headline.description"></div>
    <div class="info">
      <span class="feed">{{headline.feed}}</span>
      <span class="time">
        <span v-if="headline.isToday">today at {{headline.pubTime}}</span>
        <span v-else-if="headline.isYesterday">yesterday at {{headline.pubTime}}</span>
        <span v-else>{{headline.pubDate}}</span>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    headline: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: false
    },
    showIndex: {
      type: Boolean,
      required: false,
      default: false
    }
  }
}
</script>

<style lang="less">
  .headline {
    width: 350px;
    vertical-align: top;
    display: inline-block;
    margin: 0 10px 30px 0;

    .thumb {
      display: inline-block;
      width: 100px;
      height: 100px;
      overflow: hidden;
      border-radius: 5px;

      .thumb img { height: 100%; }
    }

    .title {
      font-weight: bold;

      a {
        color: inherit;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .blurb {
      font-size: 85%;
      height: 0;
      overflow: hidden;
    }

    .info {
      margin-top: 5px;
      font-size: 85%;
    }

    .feed {
      opacity: 0.7;
      font-weight: bold;
    }

    .time {
      opacity: 0.5;
    }
  }
</style>
