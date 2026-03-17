const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { withAuth } = require('../../common/middleware');

const ddbClient = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const SUPPORTED_LANGUAGES = ['es', 'de', 'en', 'it'];
const PROFICIENCY_LEVELS = ['beginner', 'intermediate', 'advanced'];
const LEARNING_GOALS = ['travel', 'study_abroad', 'living_abroad', 'tourism', 'business', 'other'];

const validateLearnerProfilePayload = (payload, userId) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { valid: false, message: 'Request body must be a JSON object' };
  }

  const requiredFields = [
    'nativeLanguage',
    'learningLanguage',
    'interfaceLanguage',
    'proficiencyLevel',
    'learningGoal',
  ];

  for (const field of requiredFields) {
    if (typeof payload[field] !== 'string' || !payload[field].trim()) {
      return { valid: false, message: `${field} is required` };
    }
  }

  if (!SUPPORTED_LANGUAGES.includes(payload.nativeLanguage)) {
    return { valid: false, message: 'nativeLanguage is not supported' };
  }

  if (!SUPPORTED_LANGUAGES.includes(payload.learningLanguage)) {
    return { valid: false, message: 'learningLanguage is not supported' };
  }

  if (!SUPPORTED_LANGUAGES.includes(payload.interfaceLanguage)) {
    return { valid: false, message: 'interfaceLanguage is not supported' };
  }

  if (!PROFICIENCY_LEVELS.includes(payload.proficiencyLevel)) {
    return { valid: false, message: 'proficiencyLevel is invalid' };
  }

  if (!LEARNING_GOALS.includes(payload.learningGoal)) {
    return { valid: false, message: 'learningGoal is invalid' };
  }

  return {
    valid: true,
    learnerProfile: {
      userId,
      nativeLanguage: payload.nativeLanguage,
      learningLanguage: payload.learningLanguage,
      interfaceLanguage: payload.interfaceLanguage,
      proficiencyLevel: payload.proficiencyLevel,
      learningGoal: payload.learningGoal,
    },
  };
};

const handler = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: 'Missing request body' }),
      };
    }

    const userId = event.user.id;
    const usersTableName = process.env.USERS_TABLE;

    if (!usersTableName) {
      throw new Error('USERS_TABLE environment variable is not set');
    }

    let payload;
    try {
      payload = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: 'Request body must be valid JSON' }),
      };
    }
    const validation = validateLearnerProfilePayload(payload, userId);

    if (!validation.valid) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: validation.message }),
      };
    }

    const currentUserResult = await ddbDocClient.send(new GetCommand({
      TableName: usersTableName,
      Key: { id: userId },
    }));

    if (!currentUserResult.Item) {
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

    const timestamp = new Date().toISOString();
    const updateCommand = new UpdateCommand({
      TableName: usersTableName,
      Key: { id: userId },
      UpdateExpression: 'SET learnerProfile = :learnerProfile, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':learnerProfile': validation.learnerProfile,
        ':updatedAt': timestamp,
      },
      ReturnValues: 'ALL_NEW',
    });

    const result = await ddbDocClient.send(updateCommand);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Learner profile saved successfully',
        learnerProfile: result.Attributes.learnerProfile,
      }),
    };
  } catch (error) {
    console.error('Error saving learner profile:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Error saving learner profile',
        error: error.message || 'Unknown error',
      }),
    };
  }
};

exports.handler = withAuth(handler);
