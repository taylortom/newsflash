import userConfig from './conf/config.js';

class Config {
  constructor() {
    let config = Object.assign({}, userConfig);
    this.get = key => { return config[key]; };
    this.set = (key, value) => { config[key] = value; }
  }
}

const instance = new Config();

export default instance;
