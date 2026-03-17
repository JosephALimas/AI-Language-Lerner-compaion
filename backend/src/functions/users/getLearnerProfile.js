const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { withAuth } = require('../../common/middleware');

const ddbClient = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const SUPPORTED_LANGUAGES = ['es', 'de', 'en', 'it'];
const PROFICIENCY_LEVELS = ['beginner', 'intermediate', 'advanced'];
const LEARNING_GOALS = ['travel', 'study_abroad', 'living_abroad', 'tourism', 'business', 'other'];

const buildDefaultLearnerProfile = (userId) => ({
  userId,
  nativeLanguage: 'es',
  learningLanguage: 'de',
  interfaceLanguage: 'es',
  proficiencyLevel: 'beginner',
  learningGoal: 'travel',
});

const normalizeLearnerProfile = (userId, profile) => {
  if (!profile || typeof profile !== 'object') {
    return buildDefaultLearnerProfile(userId);
  }

  return {
    userId,
    nativeLanguage: SUPPORTED_LANGUAGES.includes(profile.nativeLanguage) ? profile.nativeLanguage : 'es',
    learningLanguage: SUPPORTED_LANGUAGES.includes(profile.learningLanguage) ? profile.learningLanguage : 'de',
    interfaceLanguage: SUPPORTED_LANGUAGES.includes(profile.interfaceLanguage) ? profile.interfaceLanguage : 'es',
    proficiencyLevel: PROFICIENCY_LEVELS.includes(profile.proficiencyLevel) ? profile.proficiencyLevel : 'beginner',
    learningGoal: LEARNING_GOALS.includes(profile.learningGoal) ? profile.learningGoal : 'travel',
  };
};

const handler = async (event) => {
  try {
    const userId = event.user.id;
    const usersTableName = process.env.USERS_TABLE;

    if (!usersTableName) {
      throw new Error('USERS_TABLE environment variable is not set');
    }

    const getCommand = new GetCommand({
      TableName: usersTableName,
      Key: { id: userId },
    });

    const result = await ddbDocClient.send(getCommand);

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: 'User not found' }),
      };
    }

    const learnerProfile = normalizeLearnerProfile(userId, result.Item.learnerProfile);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ learnerProfile }),
    };
  } catch (error) {
    console.error('Error getting learner profile:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Error getting learner profile',
        error: error.message || 'Unknown error',
      }),
    };
  }
};

exports.handler = withAuth(handler);
