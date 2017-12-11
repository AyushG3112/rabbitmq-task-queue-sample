const cluster = require('cluster');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const queueMgr = require('./lib/queueManager');
const eventEmitter = new (require('events')).EventEmitter(); //require('./lib/eventEmitter');
queueMgr.setEventEmitter(eventEmitter);
const config = require('./config');
let channel;
const PORT = 7000;

if (cluster.isMaster) {
  for (let i = 0; i < require('os').cpus().length; i++) {
    cluster.fork();
  }
} else {
  const app = express();

  app.use(cors());
  app.use(bodyParser.json());

  app.use((req, res, next) => {
    if (channel) {
      return next();
    }
    queueMgr
      .connect()
      .then(ch => {
        channel = ch;
        return next();
      })
      .catch(err => {
        console.log(err);
        res
          .status(500)
          .json({ message: 'Something Went Wrong' })
          .end();
      });
  });

  app.put('/', (req, res) => {
    const taskId = Date.now() + '' + process.hrtime()[1];
    const worker = queueMgr.launchWorker();
    eventEmitter.once(taskId, function(msg) {
      res
        .status(200)
        .json({ message: msg, status: true })
        .end();
    });
    queueMgr.addTaskToQueue(
      channel,
      config.taskQueueName,
      taskId,
      req.body.message,
      req.body.timeout
    );
  });

  app.use('*', (req, res) => {
    res
      .status(404)
      .json({ message: 'Resource Not Found' })
      .end();
  });

  app.listen(PORT, () => {
    console.log(`Process ${process.pid} listening on port ${PORT}`);
  });
}
