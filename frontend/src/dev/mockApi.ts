import phraseCardsSeed from './seed-data/phrase-cards.json';
import { defaultLearnerProfile, LearnerProfile, learningGoalOptions, proficiencyLevelOptions } from '../domain/learnerProfile';
import { PhraseCard, PhraseCardLevel } from '../domain/phraseCard';
import { Post } from '../types/post';
import { User } from '../types/user';

type MockUserRecord = User & {
  password: string;
  learnerProfile: LearnerProfile;
};

type MockDatabase = {
  users: MockUserRecord[];
  phraseCards: PhraseCard[];
  posts: Post[];
};

const DATABASE_KEY = 'ai-language-companion.mock-db';
const TOKEN_PREFIX = 'mock-token:';
const DEMO_USER_ID = 'local-demo-user';
const DEMO_PASSWORD = 'password123';

const allowedGoals = new Set(learningGoalOptions.map((option) => option.value));
const allowedLevels = new Set(proficiencyLevelOptions.map((option) => option.value));

const wait = (delay = 120) => new Promise((resolve) => window.setTimeout(resolve, delay));

const buildDemoUser = (): MockUserRecord => {
  const learnerProfile = defaultLearnerProfile(DEMO_USER_ID);
  const timestamp = new Date().toISOString();

  return {
    id: DEMO_USER_ID,
    username: 'demo',
    email: 'demo@local.test',
    displayName: 'Demo Learner',
    bio: 'Local development learner profile for testing without AWS.',
    password: DEMO_PASSWORD,
    createdAt: timestamp,
    updatedAt: timestamp,
    followersCount: 0,
    followingCount: 0,
    learnerProfile,
  };
};

const readDatabase = (): MockDatabase => {
  const existing = localStorage.getItem(DATABASE_KEY);

  if (existing) {
    return JSON.parse(existing) as MockDatabase;
  }

  const initialDatabase: MockDatabase = {
    users: [buildDemoUser()],
    phraseCards: phraseCardsSeed as PhraseCard[],
    posts: [],
  };

  localStorage.setItem(DATABASE_KEY, JSON.stringify(initialDatabase));
  return initialDatabase;
};

const writeDatabase = (database: MockDatabase) => {
  localStorage.setItem(DATABASE_KEY, JSON.stringify(database));
};

const sanitizeUser = (user: MockUserRecord): User => {
  const { password, ...publicUser } = user;
  return publicUser;
};

const toToken = (userId: string) => `${TOKEN_PREFIX}${userId}`;

const getUserIdFromToken = (token: string) => {
  if (!token.startsWith(TOKEN_PREFIX)) {
    throw new Error('Unauthorized');
  }

  return token.slice(TOKEN_PREFIX.length);
};

const getAuthenticatedUser = (token: string) => {
  const userId = getUserIdFromToken(token);
  const database = readDatabase();
  const user = database.users.find((candidate) => candidate.id === userId);

  if (!user) {
    throw new Error('Unauthorized');
  }

  return { database, user };
};

const validateLearnerProfilePayload = (learnerProfile: Omit<LearnerProfile, 'userId'>) => {
  if (!learnerProfile.nativeLanguage || !learnerProfile.learningLanguage || !learnerProfile.interfaceLanguage) {
    throw new Error('Languages are required');
  }

  if (!allowedLevels.has(learnerProfile.proficiencyLevel)) {
    throw new Error('Invalid proficiency level');
  }

  if (!allowedGoals.has(learnerProfile.learningGoal)) {
    throw new Error('Invalid learning goal');
  }
};

export const mockApi = {
  auth: {
    register: async (username: string, email: string, password: string, displayName: string) => {
      await wait();

      const database = readDatabase();
      const normalizedUsername = username.trim().toLowerCase();
      const normalizedEmail = email.trim().toLowerCase();

      if (database.users.some((user) => user.username.toLowerCase() === normalizedUsername)) {
        throw new Error('Username already exists');
      }

      if (database.users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
        throw new Error('Email already exists');
      }

      const id = crypto.randomUUID();
      const timestamp = new Date().toISOString();
      const learnerProfile = defaultLearnerProfile(id);

      const nextUser: MockUserRecord = {
        id,
        username: username.trim(),
        email: email.trim(),
        displayName: displayName.trim(),
        bio: '',
        password,
        createdAt: timestamp,
        updatedAt: timestamp,
        followersCount: 0,
        followingCount: 0,
        learnerProfile,
      };

      database.users.push(nextUser);
      writeDatabase(database);

      return {
        message: 'Registration successful',
        user: sanitizeUser(nextUser),
      };
    },

    login: async (username: string, password: string): Promise<{ token: string; user: User }> => {
      await wait();

      const database = readDatabase();
      const normalizedIdentifier = username.trim().toLowerCase();
      const user = database.users.find(
        (candidate) =>
          candidate.username.toLowerCase() === normalizedIdentifier ||
          candidate.email.toLowerCase() === normalizedIdentifier,
      );

      if (!user || user.password !== password) {
        throw new Error('Invalid username or password');
      }

      return {
        token: toToken(user.id),
        user: sanitizeUser(user),
      };
    },
  },

  users: {
    getProfile: async (userId: string, token: string): Promise<{ user: User }> => {
      await wait();

      getUserIdFromToken(token);
      const database = readDatabase();
      const user = database.users.find((candidate) => candidate.id === userId);

      if (!user) {
        throw new Error('User not found');
      }

      return { user: sanitizeUser(user) };
    },

    updateProfile: async (userId: string, data: Partial<User>, token: string): Promise<{ user: User }> => {
      await wait();

      const { database, user } = getAuthenticatedUser(token);

      if (user.id !== userId) {
        throw new Error('You can only update your own profile');
      }

      user.displayName = data.displayName?.trim() || user.displayName;
      user.bio = data.bio?.trim() || '';
      user.updatedAt = new Date().toISOString();

      writeDatabase(database);
      return { user: sanitizeUser(user) };
    },

    followUser: async () => {
      await wait();
      return { message: 'Follow is not available in local language-product mode.' };
    },

    unfollowUser: async () => {
      await wait();
      return { message: 'Unfollow is not available in local language-product mode.' };
    },

    checkFollowing: async () => {
      await wait();
      return { following: false };
    },
  },

  learnerProfile: {
    getLearnerProfile: async (token: string): Promise<{ learnerProfile: LearnerProfile }> => {
      await wait();

      const { user } = getAuthenticatedUser(token);
      return {
        learnerProfile: user.learnerProfile || defaultLearnerProfile(user.id),
      };
    },

    saveLearnerProfile: async (
      learnerProfile: Omit<LearnerProfile, 'userId'>,
      token: string,
    ): Promise<{ learnerProfile: LearnerProfile }> => {
      await wait();

      validateLearnerProfilePayload(learnerProfile);
      const { database, user } = getAuthenticatedUser(token);

      const nextLearnerProfile: LearnerProfile = {
        ...learnerProfile,
        userId: user.id,
      };

      user.learnerProfile = nextLearnerProfile;
      user.updatedAt = new Date().toISOString();
      writeDatabase(database);

      return { learnerProfile: nextLearnerProfile };
    },
  },

  phraseCards: {
    getPhraseCards: async (
      token: string,
      options: {
        sourceLanguage?: string;
        targetLanguage?: string;
        category?: string;
        level?: PhraseCardLevel;
      } = {},
    ): Promise<{
      phraseCards: PhraseCard[];
      filters: {
        sourceLanguage: string;
        targetLanguage: string;
        category: string | null;
        level: string | null;
      };
    }> => {
      await wait();

      const { database, user } = getAuthenticatedUser(token);
      const profile = user.learnerProfile || defaultLearnerProfile(user.id);
      const sourceLanguage = options.sourceLanguage || profile.nativeLanguage;
      const targetLanguage = options.targetLanguage || profile.learningLanguage;

      const phraseCards = database.phraseCards.filter((card) => {
        if (card.sourceLanguage !== sourceLanguage || card.targetLanguage !== targetLanguage) {
          return false;
        }

        if (options.category && options.category !== 'all' && card.category !== options.category) {
          return false;
        }

        if (options.level && card.level !== options.level) {
          return false;
        }

        return true;
      });

      return {
        phraseCards,
        filters: {
          sourceLanguage,
          targetLanguage,
          category: options.category && options.category !== 'all' ? options.category : null,
          level: options.level ?? null,
        },
      };
    },

    getPhraseCardById: async (id: string, token: string): Promise<{ phraseCard: PhraseCard }> => {
      await wait();

      getUserIdFromToken(token);
      const database = readDatabase();
      const phraseCard = database.phraseCards.find((card) => card.id === id);

      if (!phraseCard) {
        throw new Error('Phrase card not found');
      }

      return { phraseCard };
    },
  },

  posts: {
    getPosts: async (): Promise<{ posts: Post[]; nextToken: string | null }> => {
      await wait();
      return { posts: [], nextToken: null };
    },

    getPost: async () => {
      await wait();
      throw new Error('Posts are not available in local language-product mode.');
    },

    createPost: async () => {
      await wait();
      throw new Error('Posts are not available in local language-product mode.');
    },

    updatePost: async () => {
      await wait();
      throw new Error('Posts are not available in local language-product mode.');
    },

    deletePost: async () => {
      await wait();
      throw new Error('Posts are not available in local language-product mode.');
    },

    likePost: async () => {
      await wait();
      throw new Error('Posts are not available in local language-product mode.');
    },

    unlikePost: async () => {
      await wait();
      throw new Error('Posts are not available in local language-product mode.');
    },
  },

  getDemoCredentials: () => ({
    username: 'demo',
    password: DEMO_PASSWORD,
  }),
};
