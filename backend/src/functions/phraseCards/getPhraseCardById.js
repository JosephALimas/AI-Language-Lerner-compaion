const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { withAuth } = require('../../common/middleware');

const ddbClient = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const buildResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  },
  body: JSON.stringify(body),
});

const handler = async (event) => {
  try {
    const phraseCardId = event.pathParameters?.id;
    const phraseCardsTableName = process.env.PHRASE_CARDS_TABLE;

    if (!phraseCardId) {
      return buildResponse(400, { message: 'Phrase card id is required' });
    }

    if (!phraseCardsTableName) {
      throw new Error('PHRASE_CARDS_TABLE environment variable is not set');
    }

    const result = await ddbDocClient.send(
      new GetCommand({
        TableName: phraseCardsTableName,
        Key: { id: phraseCardId },
      }),
    );

    if (!result.Item) {
      return buildResponse(404, { message: 'Phrase card not found' });
    }

    return buildResponse(200, { phraseCard: result.Item });
  } catch (error) {
    console.error('Error getting phrase card:', error);
    return buildResponse(500, {
      message: 'Error getting phrase card',
      error: error.message || 'Unknown error',
    });
  }
};

exports.handler = withAuth(handler);
