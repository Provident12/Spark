import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { emailNewMessage } from '../utils/emailService';

export default function MessageThread({
  applicationId,
  currentUserEmail,
  currentUserName,
  otherUserName,
  otherUserEmail,
  recipientType, // 'student' or 'org'
}) {
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollRef = useRef(null);

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', applicationId],
    queryFn: () => base44.entities.Message.filter({ application_id: applicationId }),
    enabled: !!applicationId,
    initialData: [],
    refetchInterval: open ? 5000 : 15000, // Poll every 5s when open, 15s when closed
  });

  const sorted = [...messages].sort(
    (a, b) => new Date(a.created_date) - new Date(b.created_date)
  );

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sorted.length, open]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      await base44.entities.Message.create({
        application_id: applicationId,
        sender_email: currentUserEmail,
        sender_name: currentUserName,
        recipient_email: otherUserEmail,
        content: newMessage.trim(),
      });

      // Notify the other user
      await base44.entities.Notification.create({
        recipient_email: otherUserEmail,
        recipient_type: recipientType,
        type: 'new_message',
        title: 'New Message',
        message: `${currentUserName} sent you a message: "${newMessage.trim().substring(0, 80)}${newMessage.trim().length > 80 ? '...' : ''}"`,
        application_id: applicationId,
        read: false,
        created_date: new Date().toISOString(),
      });

      emailNewMessage({
        recipientEmail: otherUserEmail,
        recipientName: otherUserName,
        senderName: currentUserName,
        messagePreview: newMessage.trim().substring(0, 120),
      });

      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages', applicationId] });
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  };

  const unreadCount = messages.filter(
    m => m.sender_email !== currentUserEmail && !m.read
  ).length;

  const totalCount = messages.length;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
          unreadCount > 0
            ? 'text-red-600 bg-red-50 border border-red-200 hover:bg-red-100'
            : 'text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100'
        }`}
      >
        <MessageCircle className="w-4 h-4" />
        Messages
        {totalCount > 0 && (
          <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${
            unreadCount > 0 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {unreadCount > 0 ? unreadCount : totalCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Chat with {otherUserName}
          </span>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Minimise
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="h-56 overflow-y-auto px-4 py-3 space-y-3"
      >
        {sorted.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-8">
            No messages yet. Start the conversation.
          </p>
        )}
        {sorted.map(msg => {
          const isMe = msg.sender_email === currentUserEmail;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-red-500 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-red-200' : 'text-gray-400'}`}>
                  {msg.created_date
                    ? format(new Date(msg.created_date), 'MMM d, h:mm a')
                    : ''}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 px-3 py-2.5 flex gap-2">
        <Textarea
          placeholder="Type a message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="min-h-[36px] max-h-24 text-sm resize-none flex-1"
          rows={1}
        />
        <Button
          size="icon"
          className="bg-red-500 hover:bg-red-600 text-white shrink-0 h-9 w-9"
          disabled={!newMessage.trim() || sending}
          onClick={handleSend}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
