import { library } from '@fortawesome/fontawesome-svg-core';
import { faCog, faRss } from '@fortawesome/free-solid-svg-icons';

function load() {
  library.add(faCog, faRss);
}

function loadIcon(icon) {
  // library.add(FAIcons[getIconName(icon)]);
}

function getIconName(icon) {
  var s = 'fa' + icon.split('-').map(part => `${part[0].toUpperCase()}${part.slice(1)}`);
  console.log(s);
  return s;
}

export default {
  load
};
