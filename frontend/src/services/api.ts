import { appRuntimeMode, apiUrl } from '../config/runtime';
import { LearnerProfile } from '../domain/learnerProfile';
import { PhraseCard, PhraseCardLevel } from '../domain/phraseCard';
import { mockApi } from '../dev/mockApi';
import { Post } from '../types/post';
import { User } from '../types/user';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  return response.json();
};

const buildHeaders = (token?: string, withJson = false) => {
  const headers: Record<string, string> = {};

  if (withJson) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const buildUrl = (path: string, params?: URLSearchParams) =>
  `${apiUrl}${path}${params && params.toString() ? `?${params.toString()}` : ''}`;

const authApiFetch = {
  register: async (username: string, email: string, password: string, displayName: string): Promise<any> => {
    const response = await fetch(buildUrl('/auth/register'), {
      method: 'POST',
      headers: buildHeaders(undefined, true),
      body: JSON.stringify({ username, email, password, displayName }),
    });

    return handleResponse(response);
  },

  login: async (username: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await fetch(buildUrl('/auth/login'), {
      method: 'POST',
      headers: buildHeaders(undefined, true),
      body: JSON.stringify({ username, email: username, password }),
    });

    return handleResponse(response);
  },
};

const usersApiFetch = {
  getProfile: async (userId: string, token: string): Promise<{ user: User }> => {
    const response = await fetch(buildUrl(`/users/${userId}`), {
      headers: buildHeaders(token),
    });

    return handleResponse(response);
  },

  updateProfile: async (userId: string, data: Partial<User>, token: string): Promise<{ user: User }> => {
    const response = await fetch(buildUrl(`/users/${userId}`), {
      method: 'PUT',
      headers: buildHeaders(token, true),
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  },

  followUser: async (userId: string, token: string): Promise<any> => {
    const response = await fetch(buildUrl(`/users/${userId}/follow`), {
      method: 'POST',
      headers: buildHeaders(token),
    });

    return handleResponse(response);
  },

  unfollowUser: async (userId: string, token: string): Promise<any> => {
    const response = await fetch(buildUrl(`/users/${userId}/unfollow`), {
      method: 'POST',
      headers: buildHeaders(token),
    });

    return handleResponse(response);
  },

  checkFollowing: async (userId: string, token: string): Promise<{ following: boolean }> => {
    const response = await fetch(buildUrl(`/users/${userId}/following`), {
      headers: buildHeaders(token),
    });

    return handleResponse(response);
  },
};

const learnerProfileApiFetch = {
  getLearnerProfile: async (token: string): Promise<{ learnerProfile: LearnerProfile }> => {
    const response = await fetch(buildUrl('/learner-profile'), {
      headers: buildHeaders(token),
    });

    return handleResponse(response);
  },

  saveLearnerProfile: async (
    learnerProfile: Omit<LearnerProfile, 'userId'>,
    token: string,
  ): Promise<{ learnerProfile: LearnerProfile }> => {
    const response = await fetch(buildUrl('/learner-profile'), {
      method: 'PUT',
      headers: buildHeaders(token, true),
      body: JSON.stringify(learnerProfile),
    });

    return handleResponse(response);
  },
};

const phraseCardsApiFetch = {
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
    const params = new URLSearchParams();

    if (options.sourceLanguage) params.set('sourceLanguage', options.sourceLanguage);
    if (options.targetLanguage) params.set('targetLanguage', options.targetLanguage);
    if (options.category && options.category !== 'all') params.set('category', options.category);
    if (options.level) params.set('level', options.level);

    const response = await fetch(buildUrl('/phrase-cards', params), {
      headers: buildHeaders(token),
    });

    return handleResponse(response);
  },

  getPhraseCardById: async (id: string, token: string): Promise<{ phraseCard: PhraseCard }> => {
    const response = await fetch(buildUrl(`/phrase-cards/${id}`), {
      headers: buildHeaders(token),
    });

    return handleResponse(response);
  },
};

const postsApiFetch = {
  getPosts: async (
    token: string,
    options: {
      limit?: number;
      nextToken?: string;
      sortBy?: 'newest' | 'popular';
      userId?: string;
    } = {},
  ): Promise<{ posts: Post[]; nextToken: string | null }> => {
    const { limit = 10, nextToken, sortBy = 'newest', userId } = options;
    const params = new URLSearchParams({
      limit: String(limit),
      sortBy,
    });

    if (nextToken) params.set('nextToken', nextToken);
    if (userId) params.set('userId', userId);

    const response = await fetch(buildUrl('/posts', params), {
      headers: buildHeaders(token),
    });

    return handleResponse(response);
  },

  getPost: async (postId: string, token: string): Promise<{ post: Post }> => {
    const response = await fetch(buildUrl(`/posts/${postId}`), {
      headers: buildHeaders(token),
    });

    return handleResponse(response);
  },

  createPost: async (content: string, token: string): Promise<{ post: Post }> => {
    const response = await fetch(buildUrl('/posts'), {
      method: 'POST',
      headers: buildHeaders(token, true),
      body: JSON.stringify({ content }),
    });

    return handleResponse(response);
  },

  updatePost: async (postId: string, content: string, token: string): Promise<{ post: Post }> => {
    const response = await fetch(buildUrl(`/posts/${postId}`), {
      method: 'PUT',
      headers: buildHeaders(token, true),
      body: JSON.stringify({ content }),
    });

    return handleResponse(response);
  },

  deletePost: async (postId: string, token: string): Promise<any> => {
    const response = await fetch(buildUrl(`/posts/${postId}`), {
      method: 'DELETE',
      headers: buildHeaders(token),
    });

    return handleResponse(response);
  },

  likePost: async (postId: string, token: string): Promise<any> => {
    const response = await fetch(buildUrl(`/posts/${postId}/like`), {
      method: 'POST',
      headers: buildHeaders(token),
    });

    return handleResponse(response);
  },

  unlikePost: async (postId: string, token: string): Promise<any> => {
    const response = await fetch(buildUrl(`/posts/${postId}/unlike`), {
      method: 'POST',
      headers: buildHeaders(token),
    });

    return handleResponse(response);
  },
};

const usingMockApi = appRuntimeMode === 'mock';

export const authApi = usingMockApi ? mockApi.auth : authApiFetch;
export const usersApi = usingMockApi ? mockApi.users : usersApiFetch;
export const learnerProfileApi = usingMockApi ? mockApi.learnerProfile : learnerProfileApiFetch;
export const phraseCardsApi = usingMockApi ? mockApi.phraseCards : phraseCardsApiFetch;
export const postsApi = usingMockApi ? mockApi.posts : postsApiFetch;
