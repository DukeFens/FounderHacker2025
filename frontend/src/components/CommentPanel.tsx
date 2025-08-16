'use client';

import React, { useState, useEffect } from 'react';
import { Comment } from '@/types';
import { MessageSquare, Clock, User, Trash2 } from 'lucide-react';
import { useSessionStore } from '@/lib/store/useSessionStore';
import { api } from '@/lib/adapters/api';
import { formatTime } from '@/lib/utils';

interface CommentPanelProps {
  sessionId: string;
  currentTime: number;
  onAddComment: (text: string) => void;
}

export const CommentPanel: React.FC<CommentPanelProps> = ({
  sessionId,
  currentTime,
  onAddComment
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addComment, removeComment } = useSessionStore();

  useEffect(() => {
    loadComments();
  }, [sessionId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const sessionComments = await api.listComments(sessionId);
      setComments(sessionComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const comment = await api.createComment(sessionId, {
        author: 'clinician',
        t: currentTime,
        text: newComment.trim()
      });

      addComment(comment);
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.deleteComment?.(sessionId, commentId);
      removeComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const formatCommentTime = (ms: number) => {
    return formatTime(ms);
  };

  const getAuthorIcon = (author: string) => {
    return author === 'clinician' ? '👨‍⚕️' : '👤';
  };

  const getAuthorColor = (author: string) => {
    return author === 'clinician' ? 'text-blue-600' : 'text-green-600';
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Comments
      </h3>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={`Add comment at ${formatCommentTime(currentTime)}...`}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={200}
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {newComment.length}/200 characters
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No comments yet</p>
            <p className="text-xs text-gray-400">Add your first comment above</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 rounded-2xl border-l-4 ${
                comment.author === 'clinician' 
                  ? 'border-l-blue-500 bg-blue-50' 
                  : 'border-l-green-500 bg-green-50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getAuthorIcon(comment.author)}</span>
                    <span className={`font-medium text-sm ${getAuthorColor(comment.author)}`}>
                      {comment.author === 'clinician' ? 'Clinician' : 'Patient'}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatCommentTime(comment.t)}
                    </span>
                  </div>
                  
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {comment.text}
                  </p>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(comment.createdAt).toLocaleString()}
                  </div>
                </div>
                
                {/* Delete button for clinician comments */}
                {comment.author === 'clinician' && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Comment Buttons */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Comments</h4>
        <div className="flex flex-wrap gap-2">
          {[
            'Good form',
            'Keep chest up',
            'Go deeper',
            'Push knees out',
            'Maintain symmetry',
            'Excellent ROM'
          ].map((quickComment) => (
            <button
              key={quickComment}
              onClick={() => setNewComment(quickComment)}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
            >
              {quickComment}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
