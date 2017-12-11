const config = require('../config');
const childProcess = require('child_process');
const util = require('util');
const bluebirdPromise = require('bluebird');
const amqp = require('amqplib/callback_api');

class QueueManager {
  constructor() {}

  setEventEmitter(eventEmitter) {
    this._eventEmitter = eventEmitter;
  }

  connect() {
    return new Promise((resolve, reject) => {
      amqp.connect(config.rabbitMqConnUrl, (err, conn) => {
        if (err) {
          reject(err);
        } else {
          conn.createChannel((err, ch) => {
            if (err) {
              reject(err);
            }
            ch.assertQueue(config.taskQueueName, {
              durable: true
            });
            resolve(ch);
          });
        }
      });
    });
  }

  launchWorker() {
    return childProcess.exec('node lib/worker.js', (error, stdout, stderr) => {
      let response = JSON.parse(stdout);
      this._eventEmitter.emit(response.taskId, response.message);
    });
  }

  addTaskToQueue(channel, queueName, taskId, message, timeout) {
    let finalMsg = JSON.stringify({
      taskId: taskId,
      message: message,
      timeout
    });
    channel.sendToQueue(queueName, new Buffer(finalMsg));
  }
}

module.exports = new QueueManager();
