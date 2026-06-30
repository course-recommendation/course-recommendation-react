import useRequest from '@/common/hooks/network/useRequest';
import { User } from '@/common/types/User.types';
import { useMeContext } from '@/screen/AuthenticateChecking/Authenticated/context/MeContext';
import { SendOutlined } from '@ant-design/icons';
import { Avatar, Button } from 'antd';
import { useRef, useState } from 'react';

type MentionEntry = { name: string; id: string };

type Props = {
  onComment: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
};

function convertMentions(text: string, mentions: MentionEntry[]): string {
  let result = text;
  for (const { name, id } of mentions) {
    result = result.split(`@${name}`).join(`@[${name}](${id})`);
  }
  return result;
}

function renderHighlighted(text: string, mentions: MentionEntry[]): React.ReactNode {
  if (mentions.length === 0) return text;
  const sorted = [...mentions].sort((a, b) => b.name.length - a.name.length);
  const escaped = sorted.map((m) => m.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`@(${escaped.join('|')})`, 'g');
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(
      <span key={match.index} className='text-indigo-600 font-medium'>
        @{match[1]}
      </span>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return <>{parts}</>;
}

export default function PostCommentInput({
  onComment,
  placeholder = 'Bình luận...',
  autoFocus,
}: Props) {
  const { me } = useMeContext();
  const [text, setText] = useState('');
  const [mentions, setMentions] = useState<MentionEntry[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionUsers, setMentionUsers] = useState<User[]>([]);
  const [mentionAnchor, setMentionAnchor] = useState<number>(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const { request: searchUsers, isPending: searchPending } = useRequest<User[]>();

  const getMentionContext = (
    value: string,
    cursor: number,
  ): { query: string; start: number } | null => {
    let i = cursor - 1;
    while (i >= 0 && value[i] !== ' ' && value[i] !== '\n' && value[i] !== '@') {
      i--;
    }
    if (i >= 0 && value[i] === '@') {
      return { query: value.slice(i + 1, cursor), start: i };
    }
    return null;
  };

  const handleChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursor = e.target.selectionStart;
    setText(value);

    const ctx = getMentionContext(value, cursor);
    if (ctx) {
      setMentionQuery(ctx.query);
      setMentionAnchor(ctx.start);
      if (ctx.query.length >= 1) {
        try {
          const res = await searchUsers({ url: '/users', params: { search: ctx.query } });
          setMentionUsers(res?.data ?? []);
        } catch {
          setMentionUsers([]);
        }
      } else {
        setMentionUsers([]);
      }
    } else {
      setMentionQuery(null);
      setMentionUsers([]);
    }
  };

  const selectMention = (user: User) => {
    if (mentionAnchor < 0) return;
    const cursor = textareaRef.current?.selectionStart ?? text.length;
    const inserted = `@${user.fullName} `;
    const newText = text.slice(0, mentionAnchor) + inserted + text.slice(cursor);
    setText(newText);
    setMentions((prev) => {
      const filtered = prev.filter((m) => m.id !== user.id);
      return [...filtered, { name: user.fullName, id: user.id }];
    });
    setMentionQuery(null);
    setMentionUsers([]);
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursor = mentionAnchor + inserted.length;
        textareaRef.current.setSelectionRange(newCursor, newCursor);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    onComment(convertMentions(text, mentions));
    setText('');
    setMentions([]);
    setMentionQuery(null);
    setMentionUsers([]);
  };

  const syncScroll = () => {
    if (backdropRef.current && textareaRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const showDropdown = mentionQuery !== null && (mentionUsers.length > 0 || searchPending);

  return (
    <div className='flex gap-2 items-start'>
      <Avatar src={me.avatarUrl} size={32} className='shrink-0 mt-1' />
      <div className='relative flex-1'>
        {showDropdown && (
          <div className='absolute bottom-full mb-1 left-0 right-0 bg-white rounded-lg border border-[#E8E5E0] shadow-md z-50 overflow-hidden max-h-40 overflow-y-auto'>
            {searchPending ? (
              <div className='px-3 py-2 text-xs text-slate-400'>Đang tìm...</div>
            ) : (
              mentionUsers.map((user) => (
                <button
                  key={user.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectMention(user);
                  }}
                  className='w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 text-left transition-colors'
                >
                  <Avatar src={user.avatarUrl} size={22} className='shrink-0' />
                  <span className='font-medium text-[#1C1917]'>{user.fullName}</span>
                  <span className='text-slate-400 text-xs truncate'>{user.email}</span>
                </button>
              ))
            )}
          </div>
        )}
        <div className='relative rounded-lg border border-[#E8E5E0] bg-[#F7F8FA] focus-within:border-indigo-300 focus-within:bg-white transition-colors'>
          {/* Backdrop for @mention coloring */}
          <div
            ref={backdropRef}
            aria-hidden
            className='absolute inset-0 px-3 py-2 pr-10 text-sm leading-relaxed whitespace-pre-wrap break-words overflow-hidden pointer-events-none select-none rounded-lg'
          >
            {renderHighlighted(text, mentions)}
            {'​'}
          </div>
          <textarea
            ref={textareaRef}
            className='relative w-full pr-10 resize-none bg-transparent px-3 py-2 text-sm leading-relaxed focus:outline-none placeholder:text-slate-400 min-h-[36px] block'
            style={{ maxHeight: 120, caretColor: '#1c1917', color: 'transparent' }}
            placeholder={placeholder}
            value={text}
            onChange={handleChange}
            autoFocus={autoFocus}
            onScroll={syncScroll}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && mentionQuery !== null) {
                e.preventDefault();
                setMentionQuery(null);
                setMentionUsers([]);
                return;
              }
              if (e.key === 'Enter' && !e.shiftKey && !showDropdown) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            rows={1}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
            }}
          />
          <Button
            type='text'
            icon={<SendOutlined className='text-sm' />}
            disabled={!text.trim()}
            onClick={handleSubmit}
            className='absolute bottom-0.5 right-1 flex h-7 w-7 items-center justify-center rounded-full text-primary enabled:hover:bg-indigo-50 enabled:hover:text-indigo-600'
          />
        </div>
      </div>
    </div>
  );
}
