let queueMgr = require('./queueManager');
let config = require('../config');

queueMgr.createConnection().then(channel =>
  channel.consume(
    config.taskQueueName,
    function(msg) {
      let message = JSON.parse(msg.content.toString());
      setTimeout(() => {
        console.log(
          JSON.stringify({
            taskId: message.taskId,
            message: message.message
          })
        );
        process.exit();
      }, message.timeout);
    },
    { noAck: true }
  )
);
