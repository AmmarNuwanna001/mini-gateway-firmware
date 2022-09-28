import { createClient, SchemaFieldTypes } from 'redis';
import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'

(async () => {

    const client = createClient();
    client.on('error', (err) => console.log('Redis Client Error', err));
    await client.connect();
    const chatQueueKeyName = "etneca:chat";

    createRedisJSONIndex('timestamp', SchemaFieldTypes.NUMERIC, chatQueueKeyName)
    createRedisJSONIndex('sender', SchemaFieldTypes.TAG, chatQueueKeyName)

    var port = new SerialPort({ path: 'COM17', baudRate: 9600 })
    const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

    parser.on('data', function (data) {

        var val = data.split(",");
        if (val.length == 5) {
            for (let index = 0; index < val.length; index++) {
                console.log(`data: `, val[index]);
            }

            const payload = {
                timestamp: val[0],
                senderId:val[1],
                receiverId:val[2],
                mobileId:val[3],
                message:val[4],
            }

            setRedis(payload)
        }

    });

    // process.exit(1);

    async function setRedis(payload) {
        const timestamps = payload.timestamp
        const data = {
            timestamp: timestamps,
            senderId: payload.senderId,
            receiverId: payload.receiverId,
            mobileId: payload.mobileId,
            message: payload.message,
        }

        await client.json.set(`${chatQueueKeyName}:${timestamps}`, '$', data);
    }

    // function creat redis JSON index
    async function createRedisJSONIndex(name, type, prefix) {
        try {
            const fieldName = `$.${name}`
            var indexFiled = {}

            if (type === SchemaFieldTypes.TEXT) {
                indexFiled[fieldName] = {
                    type: type,
                }
                // console.log("already sender text ")
            }
            else {
                indexFiled[fieldName] = {
                    type: type,
                    AS: name
                }
            }

            // console.log("🚀 ~ createRedisJSONIndex ~ indexFiled", JSON.stringify(indexFiled))

            await client.ft.create(`idx:${name}`, indexFiled, {
                ON: 'JSON',
                PREFIX: prefix
            });
        } catch (e) {
            if (e.message === 'Index already exists') {
                console.log(`Index exists already, skipped creation.${name}`);
            } else {
                // Something went wrong, perhaps RediSearch isn't installed...
                console.error(e);
                process.exit(1);
            }
        }

    }

})();


