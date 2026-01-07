const { ApolloServer } = require('apollo-server');
const { stitchSchemas } = require('@graphql-tools/stitch');
const { buildSchema, print } = require('graphql');
const { fetch } = require('cross-fetch');
const { schemaFromExecutor, wrapSchema } = require('@graphql-tools/wrap');
const dotenv = require('dotenv');

dotenv.config();

const VENUE_SERVICE_URL = process.env.VENUE_SERVICE_URL || 'http://localhost:4002/graphql';
const LOGISTICS_SERVICE_URL = process.env.LOGISTICS_SERVICE_URL || 'http://localhost:4003/graphql';
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:4004/graphql';

async function createRemoteSchema(url) {
    const executor = async ({ document, variables }) => {
        const query = print(document);
        const fetchResult = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables }),
        });
        return fetchResult.json();
    };

    return wrapSchema({
        schema: await schemaFromExecutor(executor),
        executor,
    });
}

async function startGateway() {
    try {
        console.log('--- Starting API Gateway ---');

        console.log('Loading remote schemas...');
        const venueSchema = await createRemoteSchema(VENUE_SERVICE_URL);
        console.log('✅ Venue Service Schema loaded');

        const logisticsSchema = await createRemoteSchema(LOGISTICS_SERVICE_URL);
        console.log('✅ Logistics Service Schema loaded');

        const inventorySchema = await createRemoteSchema(INVENTORY_SERVICE_URL);
        console.log('✅ Inventory Consumer Schema loaded');

        const gatewaySchema = stitchSchemas({
            subschemas: [
                { schema: venueSchema },
                { schema: logisticsSchema },
                { schema: inventorySchema }
            ]
        });

        const server = new ApolloServer({
            schema: gatewaySchema,
            cors: {
                origin: "*",
                credentials: true
            },
            introspection: true // Required for Postman to fetch schema
        });

        const PORT = process.env.PORT || 4000;
        server.listen({ port: PORT }).then(({ url }) => {
            console.log(`🚀 API Gateway ready at ${url}`);
            console.log(`📡 Use Postman or other clients to test against: ${url}graphql`);
        });

    } catch (error) {
        console.error('❌ Failed to start API Gateway:', error.message);
    }
}

startGateway();
