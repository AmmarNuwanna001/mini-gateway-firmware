const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')

// Queue class
class Queue {
    // Array is used to implement a Queue
    constructor() {
        this.items = [];
    }

    // Functions to be implemented

    // enqueue function
    enqueue(element) {
        // adding element to the queue
        this.items.push(element);
        console.log("enqueue data");
    }
    // dequeue function
    dequeue() {
        // removing element from the queue
        // returns underflow when called
        // on empty queue
        if (this.isEmpty())
            return "Underflow";
        return this.items.shift();
    }

    // front function
    front() {
        // returns the Front element of
        // the queue without removing it.
        if (this.isEmpty())
            return "No elements in Queue";
        return this.items[0];
    }

    // isEmpty function
    isEmpty() {
        // return true if the queue is empty.
        return this.items.length == 0;
    }

    // printQueue function
    printQueue() {
        var str = "";
        for (var i = 0; i < this.items.length; i++)
            str += this.items[i];
        // console.log(str);
        return str;
    }

}
var port = new SerialPort({ path: 'COM17', baudRate: 9600 })
var queue = new Queue();
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

parser.on('data', function (data) {
    // console.log('Data:', data)
    var val = data.split(",");
    for (let index = 0; index < val.length; index++) {
        console.log(`data ${index}: `, val[index]);
    }
    // console.log("data:", data);
    if(val.length == 4){
        queue.enqueue(data);
    }
    
})
if(!queue.isEmpty()){
    console.log("store to redis and pop from queue"); 
    queue.dequeue()
}


