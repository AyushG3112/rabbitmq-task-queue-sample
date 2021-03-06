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
            ch.prefetch(1);
            ch.assertQueue(config.taskQueueName, {
              durable: true
            });
            this._channel = ch;
            resolve(ch);
          });
        }
      });
    });
  }

  createConnection() {
    return new Promise((resolve, reject) => {
      amqp.connect(config.rabbitMqConnUrl, (err, conn) => {
        if (err) {
          reject(err);
        } else {
          resolve(conn);
        }
      });
    });
  }

  createChannel(connection) {
    return new Promise((resolve, reject) => {
      connection.createChannel((err, ch) => {
        if (err) {
          reject(err);
        }
        ch.prefetch(1);
        ch.assertQueue(config.taskQueueName, {
          durable: true
        });
        resolve(ch);
      });
    });
  }

  launchWorker() {
    const self = this;
    return childProcess.exec('node lib/worker.js', function(error, stdout, stderr) {
      const response = JSON.parse(stdout.trim());
      self._eventEmitter.emit(response.taskId, response.message);
    });
  }

  addTaskToQueue(queueName, taskId, message, timeout, channel) {
    channel = channel || this._channel;
    let finalMsg = JSON.stringify({
      taskId: taskId,
      message: message,
      timeout
    });
    return channel.sendToQueue(queueName, new Buffer(finalMsg));
  }

  isConnected() {
    return !!this._channel;
  }
}

module.exports = new QueueManager();
