<template>
  <div id="app">
    <div class="title">{{title}}</div>
    <button class="icon-btn settings">
      <font-awesome-icon :icon="icon" />
    </button>
    <!-- <div class="settings"></div> -->
    <div class="feeds">
      <div class="feed" v-for="feed in feeds">
        <div class="title">{{feed.title}} <span class="count">({{feed.items.length}})</span></div>
        <div class="headlines">
          <div class="headline" v-for="(headline, index) in feed.items">
            <!-- <div class="thumb">
            <img :src="headline.thumbnail" alt="">
          </div> -->
          <div class="title"><a :href="headline.link" target="_blank"><!--{{index+1}}. -->{{headline.title}}</a></div>
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
      </div>
      </div>
    </div>
    <div class="footer">Last {{title}}: {{lastUpdated}}</div>
  </div>
</template>

<script>
  import FeedData from '../models/feeddata';
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
    console.log(appData.feeds);
  }).catch(console.error);

  export default {
    data: () => { return appData; },
    computed: {
      icon: () => { return faCog; }
    },
    components: {
      FontAwesomeIcon
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

        .headline {
          padding: 20px 0;
          width: 350px;
          display: inline-block;
          margin: 0 10px;

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
