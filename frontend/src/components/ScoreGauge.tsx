'use client';

// Jauge circulaire du Score BCX (0-100), affichée sur une carte gradient verte
export default function ScoreGauge({ score }: { score: number }) {
  const rayon = 60;
  const circonference = 2 * Math.PI * rayon;
  const progres = (score / 100) * circonference;

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg width="144" height="144" className="-rotate-90">
        <circle cx="72" cy="72" r={rayon} stroke="rgba(255,255,255,0.25)" strokeWidth="10" fill="none" />
        <circle
          cx="72"
          cy="72"
          r={rayon}
          stroke="#F9A825"
          strokeWidth="10"
          fill="none"
          strokeDasharray={`${progres} ${circonference}`}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute flex flex-col items-center text-white">
        <span className="text-3xl font-bold">{score}</span>
        <span className="text-xs opacity-80">/ 100</span>
      </div>
    </div>
  );
}
