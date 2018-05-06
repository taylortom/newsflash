<template>
  <div class="block feeds">
    <div class="title">Feeds</div>
    <div class="feed-item" v-for="feed in feeds" v-if="feed.items.length">
      <span class="icon"><font-awesome-icon :icon="feedIcon" /></span>
      <a :href="'#'" :data-id="feed.id" v-on:click="onFeedClick">
        <span class="title">{{feed.title}}</span>
        <span class="count">({{feed.items.length}})</span>
      </a>
    </div>
  </div>
</template>

<script>
  import $ from 'jquery';
  import jqueryscrollto from 'jquery.scrollto';
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faGlobe from '@fortawesome/fontawesome-free-solid/faGlobe'

  export default {
    props: {
      feeds: {
        type: Array,
        required: true
      }
    },
    computed: {
      feedIcon: () => { return faGlobe; }
    },
    components: {
      FontAwesomeIcon
    },
    methods: {
      onFeedClick: function(event) {
        event.preventDefault();
        var id = $(event.currentTarget).attr('data-id');
        $('#app > .inner').scrollTo($(`.feeds .feed[data-id='${id}']`), {
          duration: 400,
          easing: 'swing'
        });
      }
    }
  }
</script>

<style lang="less">
  .block {
    > .title {
      font-size: 120%;
      font-weight: bold;
      margin-bottom: 20px;
      background: #a2b0b7;
      padding: 10px;
      border: 1px solid #8f9598;
      border-left: none;
      border-right: none;
    }
  }
  .feed-item {
    margin: 0 10px 20px 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    .icon {
      margin-right: 5px;
    }
    a {
      color: inherit;
    }
    .title {
      font-weight: bold;
    }
  }
</style>
