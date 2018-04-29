<template>
  <div id="app">
    <div class="title">{{title}}</div>
    <!-- <Settings :data="this"/> -->
    <div class="feed">
      <div class="title">Latest headlines</div>
      <div class="latest headlines" v-if="latestHeadlines && latestHeadlines.length">
        <Headline v-for="(headline, index) in latestHeadlines" :key="index" :index="index+1" v-bind:showIndex="true" :headline="headline"/>
      </div>
    </div>
    <div class="feeds">
      <div class="feed" v-for="feed in feeds" v-if="feed.items.length">
        <div class="title">{{feed.title}} <span class="count">({{feed.items.length}})</span></div>
        <div class="headlines">
          <Headline v-for="(headline, index) in feed.items" :key="index" :headline="headline"/>
        </div>
      </div>
    </div>
    <div class="footer">Last {{title}}: {{lastUpdated}}</div>
  </div>
</template>

<script>
  import config from '../models/config';
  import FeedData from '../models/feeddata';

  import Headline from './headline.vue';
  import Settings from './settings.vue';

  // create and load data
  var fd = new FeedData();
  fd.load().catch(console.error);

  export default {
    data: () => {
      return Object.assign(fd, {
        title: config.get('appName'),
        filters: [],
      });
    },
    components: {
      Headline,
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
    height: 100vh;
    background: #e8f1f5;
  }

  #app {
    margin-bottom: 3%;
    > .title {
      font-size: 40px;
      font-weight: bold;
      padding: 30px;
    }
  }

  .feed {
    > .title {
      padding: 10px;
      padding-left: 35px;
      background: #b0c0c7;
      color: white;
      font-size: 18px;
    }
    .headlines {
      padding: 20px;
      border-top: 1px solid #b0c0c7;
      border-bottom: 1px solid #b0c0c7;
      background: white;
      min-height: 100px;
    }
  }

  .latest.headlines {
    background: none;
  }

  .footer {
    font-size: 85%;
    text-align: right;
    margin: 10px;
    color: #91a4ad;
  }
</style>
