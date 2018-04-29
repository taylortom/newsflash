<template>
  <div id="app">
    <div class="title">{{title}}</div>
    <!--
    <button class="icon-btn settings">
      <font-awesome-icon :icon="icon" />
    </button>
    <div class="settings"></div>
    -->
    <div class="latest headlines" v-if="latestItems && latestItems.length">
      <Headline v-for="(headline, index) in latestItems" :key="index" :headline="headline"/>
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
  import FeedData from '../models/feeddata';
  import Headline from './headline.vue';
  // icon stuff
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faCog from '@fortawesome/fontawesome-free-solid/faCog'

  const hd = new FeedData();
  const appData = {
    title: "Newsflash",
    feeds: [],
    filters: [],
    lastUpdated: ""
  };

  hd.load().then(() => {
    appData.feeds = hd.feeds;
    appData.lastUpdated = hd.lastUpdated;
  }).catch(console.error);

  export default {
    data: () => { return appData; },
    computed: {
      icon: () => { return faCog; }
    },
    components: {
      FontAwesomeIcon,
      Headline
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
  }

  .feeds {
    .feed {
      > .title {
        padding: 10px;
        padding-left: 35px;
        background: #b0c0c7;
        color: white;
        font-size: 18px;
      }
      .headlines {
        padding: 15px 30px;
        border-top: 1px solid #b0c0c7;
        border-bottom: 1px solid #b0c0c7;
        background: white;
        min-height: 100px;
      }
    }
  }

  .footer {
    font-size: 85%;
    text-align: right;
    margin: 10px;
    color: #91a4ad;
  }
</style>
