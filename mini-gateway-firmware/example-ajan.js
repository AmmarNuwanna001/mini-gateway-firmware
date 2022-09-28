import { createClient, SchemaFieldTypes } from 'redis';
import { faker } from '@faker-js/faker';

(async () => {

    const client = createClient();

    client.on('error', (err) => console.log('Redis Client Error', err));

    await client.connect();

    const chatQueueKeyName = "etneca:chat";

    createRedisJSONIndex('timestamp', SchemaFieldTypes.NUMERIC, chatQueueKeyName)
    createRedisJSONIndex('sender', SchemaFieldTypes.TAG, chatQueueKeyName)
    createRedisJSONIndex('receiver', SchemaFieldTypes.TAG, chatQueueKeyName)

    // Insert 10 demo queue
    for (let index = 0; index < 10; index++) {
        const timestamp = Date.now();
        const data = {
            timestamp: timestamp,
            sender: faker.company.name(),
            receiver: "self",
            message: faker.lorem.paragraph()
        }
        // console.log("🚀 ~ data", data)
        await client.json.set(`${chatQueueKeyName}:${timestamp}`, '$', data);
    }

    // Search for queue item by timestamp
    const results = await client.ft.search('idx:timestamp', '@timestamp:[1662719807006 inf]');
    console.log("🚀 ~ results", results)

    const results_sender = await client.ft.search('idx:sender', '@sender:{L*}');
    console.log("🚀 ~ results_sender", results_sender)

    const results_receiver = await client.ft.search('idx:receiver', '@receiver:{self}');
    console.log("🚀 ~ results_receiver", results_receiver)

    process.exit(1);

// function creat redis JSON index
    async function createRedisJSONIndex(name, type, prefix){
        try {
            const fieldName = `$.${name}`
            var indexFiled = {}
            
            if(type === SchemaFieldTypes.TEXT){
                indexFiled[fieldName] = {    
                    type: type,
                }
                // console.log("already sender text ")
            }
            else{
                indexFiled[fieldName] = {
                    type: type,
                    AS: name
                }
            }

            console.log("🚀 ~ createRedisJSONIndex ~ indexFiled", JSON.stringify(indexFiled))
            
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


