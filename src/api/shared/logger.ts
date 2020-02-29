import * as bunyan from "bunyan";

const logger = bunyan.createLogger({
  name: "brdgr",
  src: true
});
export default logger;
