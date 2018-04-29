import config from './models/config';

function transformData(data) {
  var today = getToday();
  var yesterday = getYesterday();

  for(var i = 0, count = data.items.length; i < count; i++) {
    data.items[i].feed = data.feed.title;

    var d = new Date(data.items[i].pubDate);
    if(d > today) data.items[i].isToday = true;
    else if(d > yesterday) data.items[i].isYesterday = true;

    data.items[i].pubTime = d.toTimeString().slice(0,5);
  }
}

function formatDate(date) {
  var monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  var d = date.getDate() + ' ' + monthNames[date.getMonth()].slice(0,3) + " '" + date.getFullYear().toString().slice(2);
  var t = date.getHours() + ':' + date.getMinutes();
  return  d + ' ' + t;
}

function organiseHeadlines(headlines) {
  return headlines
    .filter(filterByToday)
    .sort(sortByDate)
    .slice(0, config.headlineCount);
}

function getLatestHeadlines(headlines) {
  return headlines
    .reduce(combineFeeds, [])
    .sort(sortByDate)
    .slice(0, config.get('latestHeadlineCount'));
}

function combineFeeds(acc, feed) {
  if(!acc) acc = [];
  return acc.concat(feed.items);
}

function filterOldHeadlines(headline) {
  const pubDate = new Date(headline.pubDate);
  const minAge = new Date(new Date().getTime()-config.get('maxArticleAge'));
  return pubDate > minAge;
}

function filterByToday(headline) {
  return headline.isToday;
}

function sortByDate(a, b) {
  var aD = new Date(a.pubDate);
  var bD = new Date(b.pubDate);
  if(aD < bD) return 1;
  if(aD > bD) return -1;
  return 0;
}

function getToday() {
  var today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  return today;
}

function getYesterday() {
  var yday = getToday();
  yday.setDate(yday.getDate()-1);
  return yday;
}

export default {
  transformData,
  getLatestHeadlines,
  filterOldHeadlines
};
