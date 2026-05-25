import { ACHIEVEMENTS } from '../../game/gameData';

export default function AchievementsTab({ state }) {
  const earned = ACHIEVEMENTS.filter((a) => state.achievements[a.id]);
  const locked = ACHIEVEMENTS.filter((a) => !state.achievements[a.id]);

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-700">Achievements</h3>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
          {earned.length} / {ACHIEVEMENTS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all"
          style={{ width: `${(earned.length / ACHIEVEMENTS.length) * 100}%` }}
        />
      </div>

      {/* Earned */}
      {earned.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Earned</h4>
          <div className="grid grid-cols-1 gap-2">
            {earned.map((a) => (
              <AchievementCard key={a.id} ach={a} earned />
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div>
          <h4 className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Locked</h4>
          <div className="grid grid-cols-1 gap-2">
            {locked.map((a) => (
              <AchievementCard key={a.id} ach={a} earned={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AchievementCard({ ach, earned }) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
        earned ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200 opacity-60'
      }`}
    >
      <div className={`text-2xl ${!earned && 'grayscale opacity-50'}`}>{ach.emoji}</div>
      <div>
        <div className={`font-bold text-sm ${earned ? 'text-gray-800' : 'text-gray-500'}`}>
          {earned ? ach.name : '???'}
        </div>
        <div className="text-[11px] text-gray-500">
          {earned ? ach.description : 'Keep playing to unlock'}
        </div>
      </div>
      {earned && (
        <div className="ml-auto text-yellow-500 text-lg">⭐</div>
      )}
    </div>
  );
}
