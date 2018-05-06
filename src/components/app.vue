<template>
  <div id="app">
    <div class="title">
      {{title}}
      <div class="lastUpdated" v-if="lastUpdated">Last {{title}}: {{lastUpdated}}</div>
    </div>
    <Settings :data="this" v-if="latestHeadlines.length && feeds.length"/>
    <Loading v-if="!latestHeadlines.length && !feeds.length" />
    <Feed v-if="latestHeadlines.length" :title="'Latest headlines'" :headlines="latestHeadlines" :classname="'latest'" :showIndex="true"/>
    <div class="feeds" v-if="feeds.length" v-for="feed in feeds">
      <Feed :title="feed.title" :headlines="feed.items" v-if="feed.items.length"/>
    </div>
  </div>
</template>

<script>
  import config from '../models/config';
  import FeedData from '../models/feeddata';


  import Feed from './feed.vue';
  import Loading from './loading.vue';
  import Settings from './settings.vue';

  // create and load data
  var fd = new FeedData();
  fd.load().catch(console.error);

  export default {
    data: () => {
      return Object.assign(fd, {
        title: config.get('appName'),
        filters: []
      });
    },
    components: {
      Feed,
      Loading,
      Settings
    }
  }
</script>

<style lang="less">
  /* reset */
  body { margin: 0; padding: 0; }

  html {
    font-family: 'Merriweather', serif;
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100vh;
    background: #e8f1f5;
  }

  #app {
    margin-bottom: 3%;
    > .title {
      font-size: 40px;
      font-weight: bold;
      padding: 30px;
      .lastUpdated {
        font-size: initial;
        font-weight: normal;
        color: #91a4ad;
      }
    }
  }
</style>
