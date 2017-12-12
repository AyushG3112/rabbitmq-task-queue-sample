let queueMgr = require('./queueManager');
let config = require('../config');

queueMgr.createConnection().then(conn => {
  return queueMgr.createChannel(conn).then(channel =>
    channel.consume(
      config.taskQueueName,
      function(msg) {
        let message = JSON.parse(msg.content.toString());
        const sleepTill = Date.now() + message.timeout;
        while (sleepTill > Date.now()) {}
        console.log(
          JSON.stringify({
            taskId: message.taskId,
            message: message.message
          })
        );
        process.exit(0);
      },
      { noAck: true }
    )
  );
});
