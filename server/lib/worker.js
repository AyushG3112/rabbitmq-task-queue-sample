let queueMgr = require('./queueManager');
let config = require('../config');

queueMgr.createConnection().then(channel =>
  channel.consume(
    config.taskQueueName,
    function(msg) {
      
      let message = JSON.parse(msg.content.toString());
      // console.log(message)
      
      setTimeout(() => {
        console.log(
          JSON.stringify({
            taskId: message.taskId,
            tamessageskId: message.message,
          })
        );
        process.exit(0)
      }, message.timeout);
    },
    {noAck: true}
  )
);
