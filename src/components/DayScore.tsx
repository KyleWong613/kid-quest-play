import { format } from 'date-fns';

interface DayScoreProps {
  date: Date;
  score: number | null;
  isSelected: boolean;
  onClick: () => void;
}

export const DayScore = ({ date, score, isSelected, onClick }: DayScoreProps) => {
  return (
    <button
      onClick={onClick}
      className={`relative w-full h-full flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
        isSelected 
          ? 'bg-primary text-primary-foreground' 
          : 'hover:bg-muted'
      }`}
    >
      <span className="text-sm">{format(date, 'd')}</span>
      {score !== null && (
        <span className="text-xs font-bold text-primary mt-1">
          {score}
        </span>
      )}
    </button>
  );
};
