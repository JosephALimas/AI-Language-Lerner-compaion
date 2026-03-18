const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { withAuth } = require('../../common/middleware');

const ddbClient = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const SUPPORTED_LANGUAGES = ['es', 'de', 'en', 'it'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];

const buildResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  },
  body: JSON.stringify(body),
});

const getLanguagePairFromLearnerProfile = async (userId, usersTableName) => {
  const result = await ddbDocClient.send(
    new GetCommand({
      TableName: usersTableName,
      Key: { id: userId },
    }),
  );

  if (!result.Item) {
    throw new Error('User not found');
  }

  const learnerProfile = result.Item.learnerProfile || {};

  return {
    sourceLanguage: learnerProfile.nativeLanguage || 'es',
    targetLanguage: learnerProfile.learningLanguage || 'de',
  };
};

const handler = async (event) => {
  try {
    const phraseCardsTableName = process.env.PHRASE_CARDS_TABLE;
    const usersTableName = process.env.USERS_TABLE;

    if (!phraseCardsTableName || !usersTableName) {
      throw new Error('Required environment variables are not set');
    }

    const queryParams = event.queryStringParameters || {};
    let { sourceLanguage, targetLanguage, category, level } = queryParams;

    if (!sourceLanguage || !targetLanguage) {
      const learnerPair = await getLanguagePairFromLearnerProfile(event.user.id, usersTableName);
      sourceLanguage = sourceLanguage || learnerPair.sourceLanguage;
      targetLanguage = targetLanguage || learnerPair.targetLanguage;
    }

    if (!SUPPORTED_LANGUAGES.includes(sourceLanguage)) {
      return buildResponse(400, { message: 'sourceLanguage is not supported' });
    }

    if (!SUPPORTED_LANGUAGES.includes(targetLanguage)) {
      return buildResponse(400, { message: 'targetLanguage is not supported' });
    }

    if (level && !LEVELS.includes(level)) {
      return buildResponse(400, { message: 'level is invalid' });
    }

    const languagePair = `${sourceLanguage}#${targetLanguage}`;
    const queryInput = {
      TableName: phraseCardsTableName,
      IndexName: 'languagePair-index',
      KeyConditionExpression: 'languagePair = :languagePair',
      ExpressionAttributeValues: {
        ':languagePair': languagePair,
      },
    };

    if (category) {
      queryInput.KeyConditionExpression += ' AND begins_with(categoryLevelSort, :categoryPrefix)';
      queryInput.ExpressionAttributeValues[':categoryPrefix'] = `${category.toLowerCase()}#`;
    }

    if (level) {
      queryInput.FilterExpression = '#level = :level';
      queryInput.ExpressionAttributeNames = {
        '#level': 'level',
      };
      queryInput.ExpressionAttributeValues[':level'] = level;
    }

    const result = await ddbDocClient.send(new QueryCommand(queryInput));
    const phraseCards = (result.Items || []).filter((card) => {
      if (level && card.level !== level) {
        return false;
      }

      return true;
    });

    return buildResponse(200, {
      phraseCards,
      filters: {
        sourceLanguage,
        targetLanguage,
        category: category || null,
        level: level || null,
      },
    });
  } catch (error) {
    console.error('Error getting phrase cards:', error);
    return buildResponse(500, {
      message: 'Error getting phrase cards',
      error: error.message || 'Unknown error',
    });
  }
};

exports.handler = withAuth(handler);
