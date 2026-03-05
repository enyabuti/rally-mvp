'use client';

interface PhaseProgressProps {
  currentStatus: 'open' | 'preferences' | 'voting' | 'locked';
}

const phases = [
  { key: 'open', label: 'Signups' },
  { key: 'preferences', label: 'Preferences' },
  { key: 'voting', label: 'Options' },
  { key: 'locked', label: 'Locked' },
] as const;

export default function PhaseProgress({ currentStatus }: PhaseProgressProps) {
  const currentIndex = phases.findIndex((p) => p.key === currentStatus);

  return (
    <div className="bg-white border border-rally-border rounded-card p-6 mb-5">
      <div className="flex items-center justify-between">
        {phases.map((phase, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <div key={phase.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${
                    isComplete
                      ? 'bg-rally-green text-white'
                      : isCurrent
                      ? 'bg-rally-blue text-white'
                      : 'bg-rally-border text-rally-text-muted'
                  }`}
                >
                  {isComplete ? '✓' : index + 1}
                </div>
                <p
                  className={`text-xs font-semibold ${
                    isCurrent ? 'text-rally-black' : isComplete ? 'text-rally-green' : 'text-rally-text-muted'
                  }`}
                >
                  {phase.label}
                </p>
              </div>
              {index < phases.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${
                    isComplete ? 'bg-rally-green' : 'bg-rally-border'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
