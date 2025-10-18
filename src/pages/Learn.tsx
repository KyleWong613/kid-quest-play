import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, Trophy, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface Child {
  id: string;
  name: string;
  age: number;
  mascot_id: string;
}

interface Points {
  total_points: number;
}

const Learn = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [points, setPoints] = useState<Points | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      fetchChildData();
    }
  }, [childId]);

  const fetchChildData = async () => {
    try {
      const { data: childData, error: childError } = await supabase
        .from("children")
        .select("*")
        .eq("id", childId)
        .single();

      if (childError) throw childError;
      setChild(childData);

      const { data: pointsData, error: pointsError } = await supabase
        .from("points")
        .select("total_points")
        .eq("child_id", childId)
        .single();

      if (pointsError) throw pointsError;
      setPoints(pointsData);
    } catch (error) {
      console.error("Error fetching data:", error);
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

  return (
    <div className="min-h-screen gradient-primary p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          onClick={() => navigate("/dashboard")}
          variant="secondary"
          className="mb-6 rounded-full hover:scale-105 transition-bounce"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="bg-white rounded-3xl p-6 md:p-8 mb-8 shadow-card animate-fade-in">
          <div className="flex items-center gap-6 mb-6">
            <div className="text-6xl animate-float">{getMascotEmoji(child.mascot_id)}</div>
            <div>
              <h1 className="text-4xl font-black text-foreground mb-2">{child.name}'s Learning Adventure</h1>
              <p className="text-xl text-muted-foreground">Age {child.age}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-0">
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Points</h3>
              </div>
              <p className="text-4xl font-black text-primary">{points?.total_points || 0}</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5 border-0">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-6 h-6 text-success" />
                <h3 className="text-lg font-bold text-foreground">Badges</h3>
              </div>
              <p className="text-4xl font-black text-success">0</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-fun/10 to-fun/5 border-0">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-6 h-6 text-fun" />
                <h3 className="text-lg font-bold text-foreground">Lessons</h3>
              </div>
              <p className="text-4xl font-black text-fun">0</p>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-8 hover:scale-105 transition-bounce shadow-card border-0 cursor-pointer animate-fade-in">
            <div className="text-center">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Story Time</h3>
              <p className="text-muted-foreground mb-4">Learn through magical stories</p>
              <Button className="w-full gradient-primary text-white border-0">
                Start Story
              </Button>
            </div>
          </Card>

          <Card className="p-8 hover:scale-105 transition-bounce shadow-card border-0 cursor-pointer animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="text-center">
              <div className="text-5xl mb-4">🧮</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Math Fun</h3>
              <p className="text-muted-foreground mb-4">Solve puzzles and challenges</p>
              <Button className="w-full gradient-fun text-white border-0">
                Play Now
              </Button>
            </div>
          </Card>

          <Card className="p-8 hover:scale-105 transition-bounce shadow-card border-0 cursor-pointer animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="text-center">
              <div className="text-5xl mb-4">🔬</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Science Lab</h3>
              <p className="text-muted-foreground mb-4">Discover amazing facts</p>
              <Button className="w-full gradient-success text-white border-0">
                Explore
              </Button>
            </div>
          </Card>
        </div>

        <Card className="mt-8 p-8 bg-white/80 backdrop-blur-sm shadow-card border-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <h2 className="text-3xl font-bold text-foreground mb-4">Coming Soon! 🎮</h2>
          <p className="text-lg text-muted-foreground mb-4">
            We're working hard to bring you interactive lessons, voice-guided stories, and AI-powered tutoring. Stay tuned for the adventure!
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm">Voice Stories</span>
            <span className="px-4 py-2 rounded-full bg-secondary/10 text-secondary font-semibold text-sm">AI Tutor</span>
            <span className="px-4 py-2 rounded-full bg-success/10 text-success font-semibold text-sm">Certificates</span>
            <span className="px-4 py-2 rounded-full bg-fun/10 text-fun font-semibold text-sm">Leaderboards</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Learn;
