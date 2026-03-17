import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types/user';
import { Post } from '../types/post';
import {
  defaultLearnerProfile,
  languageOptions,
  learningGoalOptions,
  LearnerProfile,
  proficiencyLevelOptions,
} from '../domain/learnerProfile';
import { learnerProfileApi, postsApi, usersApi } from '../services/api';

type EditableProfileForm = {
  displayName: string;
  bio: string;
  nativeLanguage: LearnerProfile['nativeLanguage'];
  learningLanguage: LearnerProfile['learningLanguage'];
  interfaceLanguage: LearnerProfile['interfaceLanguage'];
  proficiencyLevel: LearnerProfile['proficiencyLevel'];
  learningGoal: LearnerProfile['learningGoal'];
};

const toEditableForm = (userId: string, user?: User | null, learnerProfile?: LearnerProfile): EditableProfileForm => {
  const profile = learnerProfile || user?.learnerProfile || defaultLearnerProfile(userId);

  return {
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    nativeLanguage: profile.nativeLanguage,
    learningLanguage: profile.learningLanguage,
    interfaceLanguage: profile.interfaceLanguage,
    proficiencyLevel: profile.proficiencyLevel,
    learningGoal: profile.learningGoal,
  };
};

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, token, refreshUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EditableProfileForm>(toEditableForm(userId || ''));
  const [saveLoading, setSaveLoading] = useState(false);

  const isOwnProfile = !!userId && currentUser?.id === userId;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId || !token) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { user: userData } = await usersApi.getProfile(userId, token);
        setUser(userData);

        if (isOwnProfile) {
          const { learnerProfile } = await learnerProfileApi.getLearnerProfile(token);
          setUser((previous) => (previous ? { ...previous, learnerProfile } : previous));
          setFormData(toEditableForm(userId, userData, learnerProfile));
        } else {
          setFormData(toEditableForm(userId, userData, userData.learnerProfile));
          const postsData = await postsApi.getPosts(token, { userId });
          setPosts(postsData.posts);
        }
      } catch (err) {
        setError('Failed to load profile. Please try again later.');
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [isOwnProfile, token, userId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !token || !isOwnProfile) {
      return;
    }

    try {
      setSaveLoading(true);
      setError(null);

      const [{ user: updatedUser }, { learnerProfile }] = await Promise.all([
        usersApi.updateProfile(userId, { displayName: formData.displayName, bio: formData.bio }, token),
        learnerProfileApi.saveLearnerProfile(
          {
            nativeLanguage: formData.nativeLanguage,
            learningLanguage: formData.learningLanguage,
            interfaceLanguage: formData.interfaceLanguage,
            proficiencyLevel: formData.proficiencyLevel,
            learningGoal: formData.learningGoal,
          },
          token,
        ),
      ]);

      const mergedUser = { ...updatedUser, learnerProfile };
      setUser(mergedUser);
      setFormData(toEditableForm(userId, mergedUser, learnerProfile));
      setIsEditing(false);
      await refreshUser();
    } catch (err) {
      setError('Failed to update learner profile. Please try again.');
      console.error('Error updating learner profile:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const formatGoal = (goal: LearnerProfile['learningGoal']) =>
    learningGoalOptions.find((option) => option.value === goal)?.label ?? goal;

  const formatLevel = (level: LearnerProfile['proficiencyLevel']) =>
    proficiencyLevelOptions.find((option) => option.value === level)?.label ?? level;

  const formatLanguage = (language: LearnerProfile['nativeLanguage']) =>
    languageOptions.find((option) => option.value === language)?.label ?? language;

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!user) {
    return <div className="error-message">User not found</div>;
  }

  const activeLearnerProfile = user.learnerProfile || defaultLearnerProfile(user.id);

  return (
    <div className="profile-page">
      <div className="profile-header">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="edit-profile-form">
            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="profile-preferences-grid">
              <div className="form-group">
                <label htmlFor="nativeLanguage">Native language</label>
                <select
                  id="nativeLanguage"
                  name="nativeLanguage"
                  value={formData.nativeLanguage}
                  onChange={handleInputChange}
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="learningLanguage">Learning language</label>
                <select
                  id="learningLanguage"
                  name="learningLanguage"
                  value={formData.learningLanguage}
                  onChange={handleInputChange}
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="interfaceLanguage">Interface language</label>
                <select
                  id="interfaceLanguage"
                  name="interfaceLanguage"
                  value={formData.interfaceLanguage}
                  onChange={handleInputChange}
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="proficiencyLevel">Proficiency level</label>
                <select
                  id="proficiencyLevel"
                  name="proficiencyLevel"
                  value={formData.proficiencyLevel}
                  onChange={handleInputChange}
                >
                  {proficiencyLevelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="learningGoal">Learning goal</label>
                <select
                  id="learningGoal"
                  name="learningGoal"
                  value={formData.learningGoal}
                  onChange={handleInputChange}
                >
                  {learningGoalOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={saveLoading}>
                {saveLoading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData(toEditableForm(user.id, user, activeLearnerProfile));
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h2>{user.displayName}</h2>
            <p className="username">@{user.username}</p>
            {user.bio && <p className="bio">{user.bio}</p>}

            <div className="profile-stats">
              <span>Native: {formatLanguage(activeLearnerProfile.nativeLanguage)}</span>
              <span>Learning: {formatLanguage(activeLearnerProfile.learningLanguage)}</span>
              <span>UI: {formatLanguage(activeLearnerProfile.interfaceLanguage)}</span>
            </div>

            <div className="profile-stats">
              <span>Level: {formatLevel(activeLearnerProfile.proficiencyLevel)}</span>
              <span>Goal: {formatGoal(activeLearnerProfile.learningGoal)}</span>
            </div>

            {isOwnProfile && (
              <button onClick={() => setIsEditing(true)} className="edit-profile-button">
                Edit learner settings
              </button>
            )}
          </>
        )}
      </div>

      {!isOwnProfile && (
        <div className="profile-posts">
          <h3>Legacy posts</h3>
          {posts.length === 0 ? (
            <p>No posts yet.</p>
          ) : (
            <div className="posts-list">
              {posts.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="post-content">{post.content}</div>
                  <div className="post-footer">
                    <span className="post-date">{formatDate(post.createdAt)}</span>
                    <span>{post.likesCount} likes</span>
                    <span>{post.commentsCount} comments</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
