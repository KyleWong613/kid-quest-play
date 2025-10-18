import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Languages } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Question {
  word: string;
  translation: string;
  options: string[];
  correctAnswer: string;
}

const languageData = {
  english: {
    name: "English",
    flag: "🇬🇧",
    lessons: [
      { word: "Hello", translation: "Greeting", options: ["Hello", "Goodbye", "Thank you", "Please"], correctAnswer: "Hello" },
      { word: "Cat", translation: "Animal", options: ["Dog", "Cat", "Bird", "Fish"], correctAnswer: "Cat" },
      { word: "Red", translation: "Color", options: ["Blue", "Green", "Red", "Yellow"], correctAnswer: "Red" },
      { word: "One", translation: "Number", options: ["One", "Two", "Three", "Four"], correctAnswer: "One" },
      { word: "Happy", translation: "Emotion", options: ["Sad", "Happy", "Angry", "Tired"], correctAnswer: "Happy" },
      { word: "Book", translation: "Object", options: ["Book", "Pen", "Paper", "Desk"], correctAnswer: "Book" },
      { word: "Run", translation: "Action", options: ["Walk", "Jump", "Run", "Swim"], correctAnswer: "Run" },
      { word: "Big", translation: "Size", options: ["Small", "Big", "Tiny", "Medium"], correctAnswer: "Big" },
      { word: "Water", translation: "Drink", options: ["Juice", "Milk", "Water", "Tea"], correctAnswer: "Water" },
      { word: "Sun", translation: "Sky object", options: ["Moon", "Star", "Sun", "Cloud"], correctAnswer: "Sun" },
    ],
  },
  chinese: {
    name: "Chinese",
    flag: "🇨🇳",
    lessons: [
      { word: "你好 (Nǐ hǎo)", translation: "Hello", options: ["你好", "再见", "谢谢", "对不起"], correctAnswer: "你好" },
      { word: "猫 (Māo)", translation: "Cat", options: ["狗", "猫", "鸟", "鱼"], correctAnswer: "猫" },
      { word: "红 (Hóng)", translation: "Red", options: ["蓝", "绿", "红", "黄"], correctAnswer: "红" },
      { word: "一 (Yī)", translation: "One", options: ["一", "二", "三", "四"], correctAnswer: "一" },
      { word: "开心 (Kāixīn)", translation: "Happy", options: ["伤心", "开心", "生气", "累"], correctAnswer: "开心" },
      { word: "书 (Shū)", translation: "Book", options: ["书", "笔", "纸", "桌子"], correctAnswer: "书" },
      { word: "跑 (Pǎo)", translation: "Run", options: ["走", "跳", "跑", "游"], correctAnswer: "跑" },
      { word: "大 (Dà)", translation: "Big", options: ["小", "大", "微小", "中"], correctAnswer: "大" },
      { word: "水 (Shuǐ)", translation: "Water", options: ["果汁", "牛奶", "水", "茶"], correctAnswer: "水" },
      { word: "太阳 (Tàiyáng)", translation: "Sun", options: ["月亮", "星星", "太阳", "云"], correctAnswer: "太阳" },
    ],
  },
  malay: {
    name: "Malay",
    flag: "🇲🇾",
    lessons: [
      { word: "Hello", translation: "Greeting", options: ["Hello", "Selamat tinggal", "Terima kasih", "Tolong"], correctAnswer: "Hello" },
      { word: "Kucing", translation: "Cat", options: ["Anjing", "Kucing", "Burung", "Ikan"], correctAnswer: "Kucing" },
      { word: "Merah", translation: "Red", options: ["Biru", "Hijau", "Merah", "Kuning"], correctAnswer: "Merah" },
      { word: "Satu", translation: "One", options: ["Satu", "Dua", "Tiga", "Empat"], correctAnswer: "Satu" },
      { word: "Gembira", translation: "Happy", options: ["Sedih", "Gembira", "Marah", "Penat"], correctAnswer: "Gembira" },
      { word: "Buku", translation: "Book", options: ["Buku", "Pen", "Kertas", "Meja"], correctAnswer: "Buku" },
      { word: "Lari", translation: "Run", options: ["Jalan", "Lompat", "Lari", "Berenang"], correctAnswer: "Lari" },
      { word: "Besar", translation: "Big", options: ["Kecil", "Besar", "Sangat kecil", "Sederhana"], correctAnswer: "Besar" },
      { word: "Air", translation: "Water", options: ["Jus", "Susu", "Air", "Teh"], correctAnswer: "Air" },
      { word: "Matahari", translation: "Sun", options: ["Bulan", "Bintang", "Matahari", "Awan"], correctAnswer: "Matahari" },
    ],
  },
};

const LanguageLearning = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof languageData>("english");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const questions = languageData[selectedLanguage].lessons;
  const question = questions[currentQuestion];

  const handleAnswer = async (answer: string) => {
    setQuestionsAnswered((prev) => prev + 1);
    const isCorrect = answer === question.correctAnswer;

    if (isCorrect) {
      const newScore = score + 10;
      setScore(newScore);
      setStreak((prev) => prev + 1);
      setFeedback("🎉 Correct! Well done!");

      const feedbacks = [
        "Amazing! 🌟",
        "Perfect! 🎯",
        "Excellent! 💫",
        "Outstanding! 🏆",
        "Brilliant! ✨",
      ];
      toast.success(feedbacks[Math.floor(Math.random() * feedbacks.length)]);

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

        if (newScore === 100) {
          const { error: badgeError } = await supabase
            .from("badges")
            .insert({
              child_id: childId,
              badge_name: "Language Master",
              badge_type: "certificate",
            });

          if (!badgeError) {
            toast.success("🏆 Certificate Earned: Language Master!");
          }
        }
      } catch (error) {
        console.error("Error updating points:", error);
      }
    } else {
      setStreak(0);
      setFeedback(`Not quite! The correct answer is: ${question.correctAnswer}`);
      toast.error("Try again! 💪");
    }

    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      setFeedback("");
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        setCurrentQuestion(0);
      }
    }, 2000);
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang as keyof typeof languageData);
    setCurrentQuestion(0);
    setScore(0);
    setStreak(0);
    setQuestionsAnswered(0);
    setFeedback("");
    setShowFeedback(false);
  };

  return (
    <div className="min-h-screen gradient-primary p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => navigate(`/learn/${childId}`)}
          variant="secondary"
          className="mb-6 rounded-full hover:scale-105 transition-bounce"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Learning
        </Button>

        <Card className="p-6 md:p-8 bg-white/90 backdrop-blur-sm shadow-card border-0 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Languages className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-black text-foreground">Language Learning</h1>
            </div>
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(languageData).map(([key, data]) => (
                  <SelectItem key={key} value={key}>
                    {data.flag} {data.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 rounded-2xl bg-primary/10">
              <p className="text-sm text-muted-foreground mb-1">Score</p>
              <p className="text-3xl font-black text-primary">{score}</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-success/10">
              <p className="text-sm text-muted-foreground mb-1">Streak</p>
              <p className="text-3xl font-black text-success">{streak} 🔥</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-fun/10">
              <p className="text-sm text-muted-foreground mb-1">Progress</p>
              <p className="text-3xl font-black text-fun">{questionsAnswered}/10</p>
            </div>
          </div>

          <Progress value={(questionsAnswered / 10) * 100} className="mb-6" />

          {!showFeedback ? (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center p-6 rounded-3xl bg-gradient-to-br from-primary/5 to-fun/5">
                <p className="text-sm text-muted-foreground mb-2">Translate this word:</p>
                <p className="text-4xl font-black text-foreground mb-2">{question.word}</p>
                <p className="text-lg text-muted-foreground italic">({question.translation})</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {question.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className="h-20 text-xl font-bold rounded-2xl hover:scale-105 transition-bounce"
                    variant="outline"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-fun/10 animate-fade-in">
              <p className="text-3xl font-black text-foreground">{feedback}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default LanguageLearning;
