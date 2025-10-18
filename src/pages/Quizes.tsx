import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Child {
  id: string;
  name: string;
  age: number;
  mascot_id: string;
}

const Quizes = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      fetchChildData();
    }
  }, [childId]);

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
          onClick={() => navigate(`/learn/${childId}`)}
          variant="secondary"
          className="mb-6 rounded-full hover:scale-105 transition-bounce"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Learning
        </Button>

        <div className="bg-white rounded-3xl p-6 md:p-8 mb-8 shadow-card animate-fade-in">
          <div className="flex items-center gap-6 mb-6">
            <div className="text-6xl animate-float">{getMascotEmoji(child.mascot_id)}</div>
            <div>
              <h1 className="text-4xl font-black text-foreground mb-2">{child.name}'s Quiz Hub</h1>
              <p className="text-xl text-muted-foreground">Choose a topic to test your knowledge!</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            className="p-8 hover:scale-105 transition-bounce shadow-card border-0 cursor-pointer animate-fade-in"
            onClick={() => navigate(`/math-games/${childId}`)}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">📐</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Math</h3>
              <p className="text-muted-foreground mb-4">Test your math skills with fun problems</p>
              <Button className="w-full gradient-fun text-white border-0 hover:shadow-glow transition-all">
                Start Math Quiz
              </Button>
            </div>
          </Card>

          <Card 
            className="p-8 hover:scale-105 transition-bounce shadow-card border-0 cursor-pointer animate-fade-in" 
            style={{ animationDelay: "0.1s" }}
            onClick={() => navigate(`/language-learning/${childId}`)}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🌍</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Language</h3>
              <p className="text-muted-foreground mb-4">Master multiple languages</p>
              <Button className="w-full gradient-primary text-white border-0 hover:shadow-glow transition-all">
                Start Language Quiz
              </Button>
            </div>
          </Card>

          <Card 
            className="p-8 hover:scale-105 transition-bounce shadow-card border-0 cursor-pointer animate-fade-in" 
            style={{ animationDelay: "0.2s" }}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">History</h3>
              <p className="text-muted-foreground mb-4">Explore events from the past</p>
              <Button 
                className="w-full gradient-success text-white border-0 hover:shadow-glow transition-all"
                onClick={() => toast.info("History quiz coming soon! 🚀")}
              >
                Coming Soon
              </Button>
            </div>
          </Card>

          <Card 
            className="p-8 hover:scale-105 transition-bounce shadow-card border-0 cursor-pointer animate-fade-in" 
            style={{ animationDelay: "0.3s" }}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🔬</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Science</h3>
              <p className="text-muted-foreground mb-4">Discover the wonders of science</p>
              <Button 
                className="w-full gradient-primary text-white border-0 hover:shadow-glow transition-all"
                onClick={() => toast.info("Science quiz coming soon! 🚀")}
              >
                Coming Soon
              </Button>
            </div>
          </Card>

          <Card 
            className="p-8 hover:scale-105 transition-bounce shadow-card border-0 cursor-pointer animate-fade-in" 
            style={{ animationDelay: "0.4s" }}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Arts</h3>
              <p className="text-muted-foreground mb-4">Explore creativity and culture</p>
              <Button 
                className="w-full gradient-fun text-white border-0 hover:shadow-glow transition-all"
                onClick={() => toast.info("Arts quiz coming soon! 🚀")}
              >
                Coming Soon
              </Button>
            </div>
          </Card>

          <Card 
            className="p-8 hover:scale-105 transition-bounce shadow-card border-0 cursor-pointer animate-fade-in" 
            style={{ animationDelay: "0.5s" }}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🌎</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Geography</h3>
              <p className="text-muted-foreground mb-4">Learn about our world</p>
              <Button 
                className="w-full gradient-success text-white border-0 hover:shadow-glow transition-all"
                onClick={() => toast.info("Geography quiz coming soon! 🚀")}
              >
                Coming Soon
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Quizes;
