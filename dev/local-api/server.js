const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.LOCAL_API_PORT || 4010);
const DATA_DIR = path.join(__dirname, 'data', 'runtime');
const DATA_FILE = path.join(DATA_DIR, 'local-db.json');
const PHRASE_CARD_SEED_FILE = path.join(
  __dirname,
  '..',
  '..',
  'frontend',
  'src',
  'dev',
  'seed-data',
  'phrase-cards.json',
);

const DEMO_USER_ID = 'local-demo-user';
const DEMO_PASSWORD = 'password123';
const TOKEN_PREFIX = 'local-token:';
const ALLOWED_LEVELS = new Set(['beginner', 'intermediate', 'advanced']);
const ALLOWED_GOALS = new Set(['travel', 'study_abroad', 'living_abroad', 'tourism', 'business', 'other']);

const readJsonFile = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const ensureDatabase = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DATA_FILE)) {
    return;
  }

  const timestamp = new Date().toISOString();
  const demoLearnerProfile = {
    userId: DEMO_USER_ID,
    nativeLanguage: 'es',
    learningLanguage: 'de',
    interfaceLanguage: 'es',
    proficiencyLevel: 'beginner',
    learningGoal: 'travel',
  };

  const database = {
    users: [
      {
        id: DEMO_USER_ID,
        username: 'demo',
        email: 'demo@local.test',
        displayName: 'Demo Learner',
        bio: 'Local API learner profile for testing without AWS.',
        password: DEMO_PASSWORD,
        createdAt: timestamp,
        updatedAt: timestamp,
        followersCount: 0,
        followingCount: 0,
        learnerProfile: demoLearnerProfile,
      },
    ],
    phraseCards: readJsonFile(PHRASE_CARD_SEED_FILE),
    posts: [],
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(database, null, 2));
};

const readDatabase = () => {
  ensureDatabase();
  return readJsonFile(DATA_FILE);
};

const writeDatabase = (database) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(database, null, 2));
};

const sanitizeUser = (user) => {
  const { password, ...publicUser } = user;
  return publicUser;
};

const getBody = async (request) => {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
};

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Content-Type': 'application/json',
  });
  response.end(JSON.stringify(payload));
};

const sendNoContent = (response) => {
  response.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  });
  response.end();
};

const getTokenFromRequest = (request) => {
  const header = request.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  return header.slice('Bearer '.length);
};

const getUserIdFromToken = (token) => {
  if (!token.startsWith(TOKEN_PREFIX)) {
    throw new Error('Unauthorized');
  }

  return token.slice(TOKEN_PREFIX.length);
};

const getAuthenticatedUser = (request) => {
  const token = getTokenFromRequest(request);
  const userId = getUserIdFromToken(token);
  const database = readDatabase();
  const user = database.users.find((candidate) => candidate.id === userId);

  if (!user) {
    throw new Error('Unauthorized');
  }

  return { database, user };
};

const validateLearnerProfile = (learnerProfile) => {
  if (!learnerProfile.nativeLanguage || !learnerProfile.learningLanguage || !learnerProfile.interfaceLanguage) {
    throw new Error('Languages are required');
  }

  if (!ALLOWED_LEVELS.has(learnerProfile.proficiencyLevel)) {
    throw new Error('Invalid proficiency level');
  }

  if (!ALLOWED_GOALS.has(learnerProfile.learningGoal)) {
    throw new Error('Invalid learning goal');
  }
};

const handleRegister = async (request, response) => {
  const database = readDatabase();
  const body = await getBody(request);
  const username = String(body.username || '').trim();
  const email = String(body.email || '').trim();
  const password = String(body.password || '');
  const displayName = String(body.displayName || '').trim();

  if (!username || !email || !password || !displayName) {
    return sendJson(response, 400, { message: 'All fields are required' });
  }

  const normalizedUsername = username.toLowerCase();
  const normalizedEmail = email.toLowerCase();

  if (database.users.some((user) => user.username.toLowerCase() === normalizedUsername)) {
    return sendJson(response, 409, { message: 'Username already exists' });
  }

  if (database.users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    return sendJson(response, 409, { message: 'Email already exists' });
  }

  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const learnerProfile = {
    userId: id,
    nativeLanguage: 'es',
    learningLanguage: 'de',
    interfaceLanguage: 'es',
    proficiencyLevel: 'beginner',
    learningGoal: 'travel',
  };

  const user = {
    id,
    username,
    email,
    displayName,
    bio: '',
    password,
    createdAt: timestamp,
    updatedAt: timestamp,
    followersCount: 0,
    followingCount: 0,
    learnerProfile,
  };

  database.users.push(user);
  writeDatabase(database);

  return sendJson(response, 201, {
    message: 'Registration successful',
    user: sanitizeUser(user),
  });
};

const handleLogin = async (request, response) => {
  const database = readDatabase();
  const body = await getBody(request);
  const identifier = String(body.username || body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  const user = database.users.find(
    (candidate) =>
      candidate.username.toLowerCase() === identifier || candidate.email.toLowerCase() === identifier,
  );

  if (!user || user.password !== password) {
    return sendJson(response, 401, { message: 'Invalid username or password' });
  }

  return sendJson(response, 200, {
    token: `${TOKEN_PREFIX}${user.id}`,
    user: sanitizeUser(user),
  });
};

const handleGetUserProfile = (request, response, userId) => {
  getAuthenticatedUser(request);
  const database = readDatabase();
  const user = database.users.find((candidate) => candidate.id === userId);

  if (!user) {
    return sendJson(response, 404, { message: 'User not found' });
  }

  return sendJson(response, 200, { user: sanitizeUser(user) });
};

const handleUpdateUserProfile = async (request, response, userId) => {
  const { database, user } = getAuthenticatedUser(request);

  if (user.id !== userId) {
    return sendJson(response, 403, { message: 'You can only update your own profile' });
  }

  const body = await getBody(request);
  user.displayName = String(body.displayName || user.displayName).trim();
  user.bio = String(body.bio || '').trim();
  user.updatedAt = new Date().toISOString();
  writeDatabase(database);

  return sendJson(response, 200, { user: sanitizeUser(user) });
};

const handleGetLearnerProfile = (request, response) => {
  const { user } = getAuthenticatedUser(request);
  return sendJson(response, 200, {
    learnerProfile: user.learnerProfile,
  });
};

const handleSaveLearnerProfile = async (request, response) => {
  const { database, user } = getAuthenticatedUser(request);
  const body = await getBody(request);
  const learnerProfile = {
    userId: user.id,
    nativeLanguage: body.nativeLanguage,
    learningLanguage: body.learningLanguage,
    interfaceLanguage: body.interfaceLanguage,
    proficiencyLevel: body.proficiencyLevel,
    learningGoal: body.learningGoal,
  };

  validateLearnerProfile(learnerProfile);
  user.learnerProfile = learnerProfile;
  user.updatedAt = new Date().toISOString();
  writeDatabase(database);

  return sendJson(response, 200, {
    message: 'Learner profile saved successfully',
    learnerProfile,
  });
};

const handleGetPhraseCards = (request, response, url) => {
  const { database, user } = getAuthenticatedUser(request);
  const profile = user.learnerProfile;
  const sourceLanguage = url.searchParams.get('sourceLanguage') || profile.nativeLanguage;
  const targetLanguage = url.searchParams.get('targetLanguage') || profile.learningLanguage;
  const category = url.searchParams.get('category');
  const level = url.searchParams.get('level');

  const phraseCards = database.phraseCards.filter((card) => {
    if (card.sourceLanguage !== sourceLanguage || card.targetLanguage !== targetLanguage) {
      return false;
    }

    if (category && category !== 'all' && card.category !== category) {
      return false;
    }

    if (level && card.level !== level) {
      return false;
    }

    return true;
  });

  return sendJson(response, 200, {
    phraseCards,
    filters: {
      sourceLanguage,
      targetLanguage,
      category: category && category !== 'all' ? category : null,
      level: level || null,
    },
  });
};

const handleGetPhraseCardById = (request, response, phraseCardId) => {
  getAuthenticatedUser(request);
  const database = readDatabase();
  const phraseCard = database.phraseCards.find((card) => card.id === phraseCardId);

  if (!phraseCard) {
    return sendJson(response, 404, { message: 'Phrase card not found' });
  }

  return sendJson(response, 200, { phraseCard });
};

const handleGetPosts = (request, response) => {
  getAuthenticatedUser(request);
  return sendJson(response, 200, { posts: [], nextToken: null });
};

const server = http.createServer(async (request, response) => {
  if (!request.url || !request.method) {
    return sendJson(response, 400, { message: 'Invalid request' });
  }

  if (request.method === 'OPTIONS') {
    return sendNoContent(response);
  }

  const url = new URL(request.url, `http://${request.headers.host}`);

  try {
    if (request.method === 'GET' && url.pathname === '/health') {
      return sendJson(response, 200, {
        status: 'ok',
        mode: 'local-api',
        port: PORT,
      });
    }

    if (request.method === 'POST' && url.pathname === '/auth/register') {
      return await handleRegister(request, response);
    }

    if (request.method === 'POST' && url.pathname === '/auth/login') {
      return await handleLogin(request, response);
    }

    if (request.method === 'GET' && url.pathname === '/learner-profile') {
      return handleGetLearnerProfile(request, response);
    }

    if (request.method === 'PUT' && url.pathname === '/learner-profile') {
      return await handleSaveLearnerProfile(request, response);
    }

    if (request.method === 'GET' && url.pathname === '/phrase-cards') {
      return handleGetPhraseCards(request, response, url);
    }

    if (request.method === 'GET' && url.pathname === '/posts') {
      return handleGetPosts(request, response);
    }

    const userMatch = url.pathname.match(/^\/users\/([^/]+)$/);
    if (userMatch && request.method === 'GET') {
      return handleGetUserProfile(request, response, userMatch[1]);
    }

    if (userMatch && request.method === 'PUT') {
      return await handleUpdateUserProfile(request, response, userMatch[1]);
    }

    const phraseCardMatch = url.pathname.match(/^\/phrase-cards\/([^/]+)$/);
    if (phraseCardMatch && request.method === 'GET') {
      return handleGetPhraseCardById(request, response, phraseCardMatch[1]);
    }

    return sendJson(response, 404, { message: 'Route not found' });
  } catch (error) {
    const statusCode = error.message === 'Unauthorized' ? 401 : 400;
    return sendJson(response, statusCode, { message: error.message || 'Unexpected local API error' });
  }
});

ensureDatabase();

server.listen(PORT, () => {
  console.log(`Local API running on http://localhost:${PORT}`);
  console.log('Demo credentials: demo / password123');
  console.log(`Database file: ${DATA_FILE}`);
});
