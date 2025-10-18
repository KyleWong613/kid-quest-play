import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ScoreData {
  date: Date;
  score: number;
  lesson_title: string;
}

interface ScoreCalendarProps {
  childId: string;
}

const ScoreCalendar = ({ childId }: ScoreCalendarProps) => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [scores, setScores] = useState<ScoreData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScores();
    
    // Set up real-time subscription for progress updates
    const channel = supabase
      .channel(`progress-${childId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'progress',
          filter: `child_id=eq.${childId}`
        },
        (payload) => {
          console.log('Real-time progress update:', payload);
          fetchScores(); // Refresh scores when progress updates
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [childId]);

  const fetchScores = async () => {
    try {
      const { data, error } = await supabase
        .from('progress')
        .select(`
          score,
          completion_time,
          lesson_id,
          lessons (title)
        `)
        .eq('child_id', childId)
        .not('completion_time', 'is', null)
        .order('completion_time', { ascending: false });

      if (error) throw error;

      console.log('Fetched scores data:', data); // Debug log

      const scoreData: ScoreData[] = (data || []).map((item: any) => ({
        date: new Date(item.completion_time),
        score: item.score,
        lesson_title: item.lessons?.title || 'Unknown Lesson'
      }));

      console.log('Processed score data:', scoreData); // Debug log
      setScores(scoreData);
      
      // Auto-select the most recent score date
      if (scoreData.length > 0) {
        setSelectedDate(scoreData[0].date);
      }
    } catch (error) {
      console.error('Error fetching scores:', error);
      toast.error(t('calendar.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const getScoresForDate = (date: Date) => {
    return scores.filter(
      (s) =>
        format(s.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const getDayScore = (date: Date) => {
    const dayScores = getScoresForDate(date);
    if (dayScores.length === 0) return null;
    const totalScore = dayScores.reduce((sum, s) => sum + s.score, 0);
    return Math.round(totalScore / dayScores.length);
  };

  const selectedDateScores = selectedDate ? getScoresForDate(selectedDate) : [];

  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Debug Info */}
      {scores.length > 0 && (
        <div className="p-3 rounded-lg bg-success/10 border border-success/20">
          <p className="text-sm font-semibold text-success">
            ✓ {scores.length} score{scores.length !== 1 ? 's' : ''} loaded! Click on highlighted dates to view details.
          </p>
        </div>
      )}
      
      <Card className="p-6 border-0 bg-gradient-to-br from-primary/5 to-fun/5">
        <h3 className="text-xl font-bold text-foreground mb-4">{t('calendar.dailyScores')}</h3>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-2xl border bg-white"
              modifiers={{
                scored: scores.map(s => s.date)
              }}
              modifiersStyles={{
                scored: {
                  fontWeight: 'bold',
                  backgroundColor: 'hsl(var(--primary) / 0.2)',
                  borderRadius: '0.5rem'
                }
              }}
            />
            <div className="mt-3 text-xs text-muted-foreground text-center">
              Dates with scores are highlighted
            </div>
          </div>
          
          <div className="flex-1">
            <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 min-h-[300px]">
              <h4 className="font-bold text-foreground mb-3">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : t('calendar.selectDate')}
              </h4>
              {selectedDateScores.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateScores.map((score, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl bg-gradient-to-r from-primary/10 to-fun/10 border border-primary/20"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-foreground">{score.lesson_title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(score.date, 'h:mm a')}
                          </p>
                        </div>
                        <div className="text-2xl font-black text-primary">{score.score}%</div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 p-3 rounded-xl bg-success/10 border border-success/20">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">{t('calendar.averageScore')}</span>
                      <span className="text-2xl font-black text-success">
                        {Math.round(
                          selectedDateScores.reduce((sum, s) => sum + s.score, 0) /
                            selectedDateScores.length
                        )}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">{t('calendar.noScores')}</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ScoreCalendar;
