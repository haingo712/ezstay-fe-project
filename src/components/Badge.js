/**
 * Badge component để hiển thị số lượng unread items
 * Dùng cho notifications, messages, etc.
 */

export default function Badge({ count, variant = 'primary' }) {
  if (!count || count === 0) return null;

  const displayCount = count > 99 ? '99+' : count;

  const variants = {
    primary: 'bg-blue-600 text-white',
    danger: 'bg-red-600 text-white',
    warning: 'bg-yellow-600 text-white',
    success: 'bg-green-600 text-white',
  };

  return (
    <span className={`
      inline-flex items-center justify-center
      min-w-[20px] h-5 px-1.5
      text-xs font-bold
      rounded-full
      ${variants[variant] || variants.primary}
    `}>
      {displayCount}
    </span>
  );
}