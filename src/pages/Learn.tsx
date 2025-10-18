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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            className="p-8 hover:scale-105 transition-bounce shadow-card border-0 cursor-pointer animate-fade-in"
            onClick={() => navigate(`/ai-tutor/${childId}`)}
          >
            <div className="text-center">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">AI Tutor</h3>
              <p className="text-muted-foreground mb-4">Ask questions and learn anything</p>
              <Button className="w-full gradient-primary text-white border-0 hover:shadow-glow transition-all">
                Chat Now
              </Button>
            </div>
          </Card>

          <Card 
            className="p-8 hover:scale-105 transition-bounce shadow-card border-0 cursor-pointer animate-fade-in" 
            style={{ animationDelay: "0.1s" }}
            onClick={() => navigate(`/quizes/${childId}`)}
          >
            <div className="text-center">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Quizes</h3>
              <p className="text-muted-foreground mb-4">Test your knowledge on various topics</p>
              <Button className="w-full gradient-fun text-white border-0 hover:shadow-glow transition-all">
                Take Quiz
              </Button>
            </div>
          </Card>

          <Card 
            className="p-8 hover:scale-105 transition-bounce shadow-card border-0 cursor-pointer animate-fade-in" 
            style={{ animationDelay: "0.3s" }}
            onClick={() => navigate(`/certificates/${childId}`)}
          >
            <div className="text-center">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Certificates</h3>
              <p className="text-muted-foreground mb-4">View and download achievements</p>
              <Button className="w-full gradient-success text-white border-0 hover:shadow-glow transition-all">
                View All
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Learn;
