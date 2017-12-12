import { environment } from '../environments/environment';

export class TaskModel {
  message: String;
  delay: Number;
  status: String;
  requestTime: Date;
  responseTime: Date;

  constructor(message: String, delay: Number, status: String) {
    this.message = message;
    this.delay = delay;
    this.status = status;
    this.requestTime = new Date();
  }

  sendToServer(httpClient) {
    return httpClient.put(environment.apiBaseUrl, {
      message: this.message,
      delay: this.delay
    });
  }
}
