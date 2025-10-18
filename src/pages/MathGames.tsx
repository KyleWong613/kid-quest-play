import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, Trophy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface Child {
  id: string;
  name: string;
  age: number;
  mascot_id: string;
}

interface Question {
  question: string;
  answer: number;
  options: number[];
}

const MathGames = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      fetchChildData();
    }
  }, [childId]);

  useEffect(() => {
    if (child) {
      generateQuestion();
    }
  }, [child]);

  const fetchChildData = async () => {
    try {
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("id", childId)
        .single();

      if (error) throw error;
      setChild(data);
    } catch (error) {
      console.error("Error fetching child:", error);
      toast.error("Failed to load learner data");
    } finally {
      setLoading(false);
    }
  };

  const getMascotEmoji = (mascotId: string) => {
    const mascots: { [key: string]: string } = {
      dragon: "🐉",
      unicorn: "🦄",
      robot: "🤖",
      panda: "🐼",
      fox: "🦊",
      owl: "🦉",
    };
    return mascots[mascotId] || "✨";
  };

  const generateQuestion = () => {
    if (!child) return;

    const age = child.age;
    let question: Question;

    if (age >= 6 && age <= 12) {
      // Simple arithmetic for younger kids
      const operations = ['+', '-', '×'];
      const operation = operations[Math.floor(Math.random() * operations.length)];
      
      let num1: number, num2: number, answer: number, questionText: string;
      
      if (operation === '+') {
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        questionText = `What is ${num1} + ${num2}?`;
      } else if (operation === '-') {
        num1 = Math.floor(Math.random() * 50) + 20;
        num2 = Math.floor(Math.random() * num1);
        answer = num1 - num2;
        questionText = `What is ${num1} - ${num2}?`;
      } else {
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        questionText = `What is ${num1} × ${num2}?`;
      }

      // Generate wrong options
      const options = [answer];
      while (options.length < 4) {
        const wrongAnswer = answer + Math.floor(Math.random() * 20) - 10;
        if (wrongAnswer !== answer && wrongAnswer > 0 && !options.includes(wrongAnswer)) {
          options.push(wrongAnswer);
        }
      }

      question = {
        question: questionText,
        answer,
        options: options.sort(() => Math.random() - 0.5),
      };
    } else {
      // More complex math for older kids (13-18)
      const questionTypes = ['algebra', 'geometry', 'percentages', 'equations'];
      const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];

      let questionText: string, answer: number;

      if (type === 'algebra') {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 20) + 1;
        const x = Math.floor(Math.random() * 15) + 1;
        answer = a * x + b;
        questionText = `If ${a}x + ${b} = ${answer}, what is x?`;
        answer = x;
      } else if (type === 'geometry') {
        const side = Math.floor(Math.random() * 10) + 5;
        answer = side * side;
        questionText = `What is the area of a square with side ${side} units?`;
      } else if (type === 'percentages') {
        const total = Math.floor(Math.random() * 200) + 100;
        const percent = Math.floor(Math.random() * 4 + 1) * 10;
        answer = Math.floor((total * percent) / 100);
        questionText = `What is ${percent}% of ${total}?`;
      } else {
        const a = Math.floor(Math.random() * 5) + 2;
        const b = Math.floor(Math.random() * 10) + 5;
        answer = Math.floor(b / a);
        questionText = `Solve: ${a}x = ${b}. What is x? (Round to nearest whole number)`;
      }

      // Generate options
      const options = [answer];
      while (options.length < 4) {
        const wrongAnswer = answer + Math.floor(Math.random() * 30) - 15;
        if (wrongAnswer !== answer && wrongAnswer > 0 && !options.includes(wrongAnswer)) {
          options.push(wrongAnswer);
        }
      }

      question = {
        question: questionText,
        answer,
        options: options.sort(() => Math.random() - 0.5),
      };
    }

    setCurrentQuestion(question);
    setFeedback("");
  };

  const handleAnswer = async (selectedAnswer: number) => {
    if (!currentQuestion || !child) return;

    const isCorrect = selectedAnswer === currentQuestion.answer;
    setQuestionsAnswered(prev => prev + 1);

    if (isCorrect) {
      const newScore = score + 10;
      setScore(newScore);
      setStreak(prev => prev + 1);
      setFeedback("🎉 Correct! Amazing work!");
      
      const feedbacks = [
        "You're a math superstar! ⭐",
        "Brilliant! Keep it up! 🌟",
        "Perfect! You're on fire! 🔥",
        "Excellent work! 🎯",
        "Outstanding! 🏆"
      ];
      toast.success(feedbacks[Math.floor(Math.random() * feedbacks.length)]);

      // Update points and award badge for 10 correct answers
      try {
        const { data: pointsData } = await supabase
          .from("points")
          .select("total_points")
          .eq("child_id", childId)
          .single();

        if (pointsData) {
          await supabase
            .from("points")
            .update({ total_points: pointsData.total_points + 10 })
            .eq("child_id", childId);
        }

        // Award Fast Learner certificate badge after 10 correct answers
        if (newScore === 100) {
          const { error: badgeError } = await supabase
            .from("badges")
            .insert({
              child_id: childId,
              badge_name: "Fast Learner",
              badge_type: "certificate"
            });

          if (!badgeError) {
            toast.success("🏆 Certificate Earned: Fast Learner!");
          }
        }
      } catch (error) {
        console.error("Error updating points:", error);
      }
    } else {
      setStreak(0);
      setFeedback(`Not quite! The answer is ${currentQuestion.answer}. Let's try another! 💪`);
      toast.error("Oops! Try the next one!");
    }

    setTimeout(() => {
      generateQuestion();
    }, 2000);
  };

  const resetGame = () => {
    setScore(0);
    setQuestionsAnswered(0);
    setStreak(0);
    setFeedback("");
    generateQuestion();
    toast.success("Starting fresh! 🎮");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-primary">
        <div className="text-white text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-primary">
        <div className="text-white text-2xl">Learner not found</div>
      </div>
    );
  }

  const progressPercentage = Math.min((questionsAnswered / 10) * 100, 100);

  return (
    <div className="min-h-screen gradient-primary p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => navigate(`/learn/${childId}`)}
          variant="secondary"
          className="mb-6 rounded-full hover:scale-105 transition-bounce"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="bg-white rounded-3xl shadow-card overflow-hidden mb-6">
          <div className="p-6 gradient-fun text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl animate-float">{getMascotEmoji(child.mascot_id)}</div>
                <div>
                  <h1 className="text-3xl font-black mb-1">Math Challenge! 🧮</h1>
                  <p className="text-white/90">{child.name}'s Math Adventure</p>
                </div>
              </div>
              <Button
                onClick={resetGame}
                variant="secondary"
                className="rounded-full hover:scale-105 transition-bounce"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                New Game
              </Button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-0">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-muted-foreground">Score</span>
                </div>
                <p className="text-3xl font-black text-primary">{score}</p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-success/10 to-success/5 border-0">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-5 h-5 text-success" />
                  <span className="text-sm font-semibold text-muted-foreground">Streak</span>
                </div>
                <p className="text-3xl font-black text-success">{streak} 🔥</p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-fun/10 to-fun/5 border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">📊</span>
                  <span className="text-sm font-semibold text-muted-foreground">Progress</span>
                </div>
                <p className="text-3xl font-black text-fun">{questionsAnswered}/10</p>
              </Card>
            </div>

            <Progress value={progressPercentage} className="mb-6 h-3" />

            {currentQuestion && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <h2 className="text-3xl font-bold text-foreground mb-2">
                    {currentQuestion.question}
                  </h2>
                  {feedback && (
                    <p className={`text-xl font-semibold mt-4 ${
                      feedback.includes('Correct') ? 'text-success' : 'text-fun'
                    }`}>
                      {feedback}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => handleAnswer(option)}
                      disabled={!!feedback}
                      className="h-24 text-2xl font-bold rounded-2xl gradient-primary text-white border-0 hover:shadow-glow transition-all hover:scale-105"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {questionsAnswered >= 10 && (
              <Card className="mt-8 p-8 bg-gradient-to-br from-success/20 to-success/10 border-0 text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-black text-foreground mb-2">
                  Challenge Complete!
                </h2>
                <p className="text-xl text-muted-foreground mb-4">
                  Final Score: <span className="font-bold text-success">{score} points</span>
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  You answered {questionsAnswered} questions! 🎉
                </p>
                <Button
                  onClick={resetGame}
                  className="gradient-primary text-white border-0 hover:shadow-glow transition-all text-lg px-8 py-6"
                >
                  Play Again! 🚀
                </Button>
              </Card>
            )}
          </div>
        </Card>

        <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-card border-0">
          <h3 className="text-xl font-bold text-foreground mb-3">Tips for Success 💡</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>✨ Take your time to think through each problem</li>
            <li>🎯 Build your streak for bonus motivation!</li>
            <li>🏆 Each correct answer earns you 10 points</li>
            <li>💪 Don't worry about mistakes - they help you learn!</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default MathGames;
