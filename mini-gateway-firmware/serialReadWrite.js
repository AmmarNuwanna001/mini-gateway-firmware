import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'



var port = new SerialPort({ path: 'COM17', baudRate: 9600 })

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

// port.write('1655555555,senderId,receiveId,orbcomm,test002')
// process.exit()
parser.on('data', function (data) {
    // console.log('Data:', data)
    var val = data.split(",");
    for (let index = 0; index < val.length; index++) {
        console.log(`data:`, val[index]);
    }
    // console.log(val.length);
})




