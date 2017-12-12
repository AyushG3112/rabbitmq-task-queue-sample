const cluster = require('cluster');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const queueMgr = require('./lib/queueManager');
const eventEmitter = require('./lib/eventEmitter');
queueMgr.setEventEmitter(eventEmitter);
const config = require('./config');
let channel;
const PORT = config.PORT;

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  if (queueMgr.isConnected()) {
    return next();
  }
  queueMgr
    .connect()
    .then(() => {
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
  queueMgr.addTaskToQueue(config.taskQueueName, taskId, req.body.message, req.body.delay * 1000);
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
