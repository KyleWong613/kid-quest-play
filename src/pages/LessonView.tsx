import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Star } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface Lesson {
  id: string;
  title: string;
  subject: string;
  level: number;
  story_content: string;
  questions: Array<{
    question: string;
    options: string[];
    correct: number;
  }>;
}

interface Child {
  id: string;
  name: string;
  age: number;
  mascot_id: string;
}

const LessonView = () => {
  const { childId, lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [child, setChild] = useState<Child | null>(null);
  const [currentStep, setCurrentStep] = useState<"story" | "quiz">("story");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [childId, lessonId]);

  const fetchData = async () => {
    try {
      const [lessonResult, childResult] = await Promise.all([
        supabase.from("lessons").select("*").eq("id", lessonId).single(),
        supabase.from("children").select("*").eq("id", childId).single(),
      ]);

      if (lessonResult.error) throw lessonResult.error;
      if (childResult.error) throw childResult.error;

      setLesson({
        ...lessonResult.data,
        questions: lessonResult.data.questions as Array<{
          question: string;
          options: string[];
          correct: number;
        }>
      });
      setChild(childResult.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load lesson");
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setCurrentStep("quiz");
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !lesson) return;

    const isCorrect = selectedAnswer === lesson.questions[currentQuestionIndex].correct;
    setShowFeedback(true);

    if (isCorrect) {
      toast.success("Correct! 🎉");
      setAnswers([...answers, 1]);
    } else {
      toast.error("Not quite right. Keep trying! 💪");
      setAnswers([...answers, 0]);
    }

    setTimeout(() => {
      if (currentQuestionIndex < lesson.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        handleCompleteLesson();
      }
    }, 1500);
  };

  const handleCompleteLesson = async () => {
    if (!lesson || !child) return;

    const correctAnswers = answers.filter(a => a === 1).length + (selectedAnswer === lesson.questions[currentQuestionIndex].correct ? 1 : 0);
    const totalQuestions = lesson.questions.length;
    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

    try {
      // Save progress
      await supabase.from("progress").upsert({
        child_id: childId,
        lesson_id: lessonId,
        score: scorePercentage,
        completed: true,
        completion_time: new Date().toISOString(),
      });

      // Update points
      const pointsToAdd = correctAnswers * 10;
      const { data: pointsData } = await supabase
        .from("points")
        .select("total_points")
        .eq("child_id", childId)
        .single();

      if (pointsData) {
        await supabase
          .from("points")
          .update({
            total_points: pointsData.total_points + pointsToAdd,
            updated_at: new Date().toISOString(),
          })
          .eq("child_id", childId);
      }

      toast.success(`Lesson completed! You earned ${pointsToAdd} points! 🎉`);
      
      setTimeout(() => {
        navigate(`/learn/${childId}`);
      }, 2000);
    } catch (error) {
      console.error("Error saving progress:", error);
      toast.error("Failed to save progress");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-fun/5">
        <div className="text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!lesson || !child) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-fun/5">
        <div className="text-2xl">Lesson not found</div>
      </div>
    );
  }

  const progressPercentage = currentStep === "story" ? 0 : ((currentQuestionIndex + 1) / lesson.questions.length) * 100;
  const currentQuestion = lesson.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-fun/5">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <Button
          onClick={() => navigate(`/learn/${childId}`)}
          variant="secondary"
          className="mb-6 rounded-full hover:scale-105 transition-all"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Learning
        </Button>

        {/* Progress Bar */}
        <Card className="mb-6 p-4 border-0 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-muted-foreground">
              {currentStep === "story" ? "Reading Story" : `Question ${currentQuestionIndex + 1} of ${lesson.questions.length}`}
            </span>
            <span className="text-sm font-semibold text-primary">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </Card>

        {currentStep === "story" ? (
          /* Story Timeline */
          <Card className="p-8 border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
            <div className="mb-6">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-fun/20 text-primary">
                {lesson.subject}
              </span>
            </div>
            
            <h1 className="text-4xl font-bold text-foreground mb-6">
              {lesson.title}
            </h1>

            <div className="relative pl-8 border-l-4 border-primary/30">
              {lesson.story_content.split('. ').map((sentence, index) => (
                <div 
                  key={index} 
                  className="mb-6 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute -left-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white" />
                  </div>
                  <p className="text-lg text-foreground leading-relaxed">
                    {sentence.trim()}{sentence.trim() ? '.' : ''}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t">
              <Button
                onClick={handleStartQuiz}
                className="w-full gradient-primary text-white border-0 hover:shadow-glow transition-all text-lg py-6 rounded-2xl"
              >
                Start Quiz 🎯
              </Button>
            </div>
          </Card>
        ) : (
          /* Quiz Section */
          <Card className="p-8 border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correct;
                const showCorrect = showFeedback && isCorrect;
                const showWrong = showFeedback && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showFeedback}
                    className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
                      showCorrect
                        ? "border-success bg-success/10"
                        : showWrong
                        ? "border-destructive bg-destructive/10"
                        : isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-primary/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-foreground">
                        {option}
                      </span>
                      {showCorrect && (
                        <CheckCircle2 className="w-6 h-6 text-success" />
                      )}
                      {showWrong && (
                        <Star className="w-6 h-6 text-destructive" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {!showFeedback && (
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="w-full mt-8 gradient-primary text-white border-0 hover:shadow-glow transition-all text-lg py-6 rounded-2xl"
              >
                Submit Answer
              </Button>
            )}

            {showFeedback && currentQuestionIndex === lesson.questions.length - 1 && (
              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-success/20 to-success/10 text-center">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Great job completing the lesson! 🎉
                </h3>
                <p className="text-muted-foreground">
                  Calculating your score...
                </p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default LessonView;
