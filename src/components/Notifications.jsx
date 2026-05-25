export default function Notifications({ notifications }) {
  if (!notifications.length) return null;

  return (
    <div className="fixed top-20 right-3 z-50 space-y-2 pointer-events-none max-w-[220px]">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`px-3 py-2 rounded-xl text-xs font-semibold shadow-lg border animate-pop-in ${
            n.type === 'achievement'
              ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
              : n.type === 'success'
              ? 'bg-green-50 border-green-300 text-green-800'
              : n.type === 'warn'
              ? 'bg-orange-50 border-orange-300 text-orange-800'
              : 'bg-white border-gray-200 text-gray-700'
          }`}
        >
          {n.msg}
        </div>
      ))}
    </div>
  );
}
