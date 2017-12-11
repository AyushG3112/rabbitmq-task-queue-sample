import { environment } from "../environments/environment";


export class TaskModel {
    message: String
    delay: Number
    status: String
    requestTime: Date

    constructor(message: String, delay: Number, status: String) {
        this.message = message
        this.delay = delay
        this.status = status
        this.requestTime = new Date()
    }

    sendToServer(httpClient) {
        console.log(environment.apiBaseUrl)
        return httpClient.put(environment.apiBaseUrl, {
            message: this.message,
            delay: this.delay
        }).subscribe(
            (data) => {
                console.log(data)
                if(data.status) {
                    this.status = 'DONE'
                }
            },
            (error) => {
                console.log(error)
                this.status = 'ERROR'
            }
        )
       
    }
}