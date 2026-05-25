import { fmtMoney, fmt, fmtTime } from '../utils/formatters';

export function OfflineModal({ earnings, onDismiss }) {
  if (!earnings) return null;
  return (
    <Modal onClose={onDismiss}>
      <div className="text-center space-y-3">
        <div className="text-5xl">😴</div>
        <h2 className="text-xl font-bold text-gray-800">Welcome Back!</h2>
        <p className="text-sm text-gray-500">
          Your farm kept running for <strong>{fmtTime(earnings.elapsed)}</strong> while you were away.
        </p>
        <div className="bg-blue-50 rounded-xl p-3 space-y-1">
          <Row label="🥛 Milk Produced" value={`${fmt(earnings.milkEarned)} gal`} />
          <Row label="🚚 Milk Sold" value={`${fmt(earnings.milkSold)} gal`} />
          <Row label="💰 Money Earned" value={fmtMoney(earnings.moneyEarned)} />
        </div>
        <button
          onClick={onDismiss}
          className="w-full py-3 bg-gradient-to-b from-green-400 to-green-600 text-white rounded-xl font-bold active:scale-95"
        >
          Collect & Continue 🐄
        </button>
      </div>
    </Modal>
  );
}

export function DailyRewardModal({ streak, onClaim, onSkip }) {
  const reward = Math.floor(100 * Math.pow(1.8, Math.min((streak || 1) - 1, 7)));
  return (
    <Modal onClose={onSkip}>
      <div className="text-center space-y-3">
        <div className="text-5xl">🎁</div>
        <h2 className="text-xl font-bold text-gray-800">Daily Reward!</h2>
        {streak > 1 && (
          <p className="text-sm text-orange-600 font-semibold">
            🔥 {streak}-Day Streak Bonus!
          </p>
        )}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl py-4">
          <div className="text-4xl font-black text-green-700">{fmtMoney(reward)}</div>
          <div className="text-xs text-gray-500 mt-1">Daily reward</div>
        </div>
        <button
          onClick={onClaim}
          className="w-full py-3 bg-gradient-to-b from-yellow-400 to-amber-500 text-white rounded-xl font-bold active:scale-95"
        >
          Claim Reward! 🎉
        </button>
      </div>
    </Modal>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-pop-in">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-bold text-gray-800">{value}</span>
    </div>
  );
}
