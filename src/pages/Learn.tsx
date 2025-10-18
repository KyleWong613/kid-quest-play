import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, Trophy, BookOpen, ChevronRight, Calendar } from "lucide-react";
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

interface Lesson {
  id: string;
  title: string;
  subject: string;
  level: number;
  story_content: string;
}

const Learn = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [points, setPoints] = useState<Points | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
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

      // Fetch age-appropriate lessons
      // For older learners (age 15+), use age as level; for younger, divide by 3
      const ageToLevel = childData.age >= 15 ? childData.age : Math.min(Math.ceil(childData.age / 3), 10);
      const levelRange = childData.age >= 15 ? 3 : 2;
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .lte("level", ageToLevel)
        .gte("level", Math.max(1, ageToLevel - levelRange))
        .order("level", { ascending: true });

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);
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

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      Math: "from-primary/20 to-primary/10 border-primary/30",
      Science: "from-success/20 to-success/10 border-success/30",
      Reading: "from-fun/20 to-fun/10 border-fun/30",
      History: "from-warning/20 to-warning/10 border-warning/30",
      Algebra: "from-primary/20 to-primary/10 border-primary/30",
      "US History": "from-warning/20 to-warning/10 border-warning/30",
      Biology: "from-success/20 to-success/10 border-success/30",
      Chemistry: "from-success/20 to-success/10 border-success/30",
      Physics: "from-primary/20 to-primary/10 border-primary/30",
    };
    return colors[subject] || "from-primary/20 to-primary/10 border-primary/30";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-fun/5">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 animate-fade-in">
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Dashboard</span>
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="font-semibold text-foreground">{child.name}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-muted-foreground">Learning</span>
        </div>

        {/* Header Card - Minimalist */}
        <Card className="mb-6 border-0 shadow-sm bg-white/80 backdrop-blur-sm animate-fade-in">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{getMascotEmoji(child.mascot_id)}</div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{child.name}</h1>
                  <p className="text-sm text-muted-foreground">Age {child.age}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="text-center px-4 py-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                  <Star className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-2xl font-bold text-primary">{points?.total_points || 0}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-gradient-to-br from-fun/10 to-fun/5">
                  <BookOpen className="w-5 h-5 text-fun mx-auto mb-1" />
                  <p className="text-2xl font-bold text-fun">{lessons.length}</p>
                  <p className="text-xs text-muted-foreground">Lessons</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions - Minimalist Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card 
            className="group hover:shadow-md transition-all cursor-pointer border-0 bg-white/80 backdrop-blur-sm animate-fade-in"
            onClick={() => navigate(`/ai-tutor/${childId}`)}
          >
            <div className="p-6 flex items-center gap-4">
              <div className="text-4xl">🤖</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">AI Tutor</h3>
                <p className="text-xs text-muted-foreground">Get instant help</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Card>

          <Card 
            className="group hover:shadow-md transition-all cursor-pointer border-0 bg-white/80 backdrop-blur-sm animate-fade-in" 
            style={{ animationDelay: "0.05s" }}
            onClick={() => navigate(`/quizes/${childId}`)}
          >
            <div className="p-6 flex items-center gap-4">
              <div className="text-4xl">📝</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">Quizzes</h3>
                <p className="text-xs text-muted-foreground">Test knowledge</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-fun transition-colors" />
            </div>
          </Card>

          <Card 
            className="group hover:shadow-md transition-all cursor-pointer border-0 bg-white/80 backdrop-blur-sm animate-fade-in" 
            style={{ animationDelay: "0.1s" }}
            onClick={() => navigate(`/storytelling/${childId}`)}
          >
            <div className="p-6 flex items-center gap-4">
              <div className="text-4xl">📖</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">Story Time</h3>
                <p className="text-xs text-muted-foreground">Learn through stories</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-warning transition-colors" />
            </div>
          </Card>

          <Card 
            className="group hover:shadow-md transition-all cursor-pointer border-0 bg-white/80 backdrop-blur-sm animate-fade-in" 
            style={{ animationDelay: "0.15s" }}
            onClick={() => navigate(`/certificates/${childId}`)}
          >
            <div className="p-6 flex items-center gap-4">
              <div className="text-4xl">🏆</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">Certificates</h3>
                <p className="text-xs text-muted-foreground">View achievements</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-success transition-colors" />
            </div>
          </Card>
        </div>

        {/* Lessons Section */}
        <div className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Available Lessons</h2>
            <span className="text-sm text-muted-foreground">
              Level {child.age >= 15 ? child.age : Math.min(Math.ceil(child.age / 3), 10)}
            </span>
          </div>

          {lessons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lessons.map((lesson, index) => (
                <Card
                  key={lesson.id}
                  className={`group hover:shadow-lg transition-all cursor-pointer border bg-gradient-to-br ${getSubjectColor(lesson.subject)} animate-fade-in`}
                  style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                  onClick={() => navigate(`/lesson/${child.id}/${lesson.id}`)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/80 text-primary">
                        {lesson.subject}
                      </span>
                      <span className="text-xs text-muted-foreground">Level {lesson.level}</span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {lesson.story_content.substring(0, 100)}...
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full hover:bg-white/50 transition-colors"
                    >
                      Start Lesson
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-0 bg-white/50 backdrop-blur-sm">
              <BookOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No lessons available yet</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Learn;
