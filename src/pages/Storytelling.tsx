import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";

interface Child {
  id: string;
  name: string;
  age: number;
  mascot_id: string;
}

const subjects = [
  { value: "History", emoji: "🏛️", topics: ["Ancient Egypt", "Medieval Knights", "Space Exploration", "Dinosaurs"] },
  { value: "Math", emoji: "🔢", topics: ["Counting Adventures", "Shape Detective", "Time Travel", "Money Magic"] },
  { value: "Science", emoji: "🔬", topics: ["Water Cycle Journey", "Plant Growth", "Animal Habitats", "Weather Wonders"] },
];

const storyRequestSchema = z.object({
  subject: z.string().min(1, "Please select a subject"),
  topic: z.string().trim().min(1, "Topic is required").max(100, "Topic must be less than 100 characters"),
  age: z.number().int().min(3).max(18),
  childName: z.string().trim().min(1).max(50),
});

const Storytelling = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      fetchChild();
    }
  }, [childId]);

  const fetchChild = async () => {
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
      setInitialLoading(false);
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

  const generateStory = async () => {
    const topic = customTopic || selectedTopic;

    // Validate input with zod
    const result = storyRequestSchema.safeParse({
      subject: selectedSubject,
      topic: topic,
      age: child?.age,
      childName: child?.name,
    });

    if (!result.success) {
      const errors = result.error.errors.map(err => err.message).join(", ");
      toast.error(errors);
      return;
    }

    setLoading(true);
    setStory("");

    try {
      const { data, error } = await supabase.functions.invoke("generate-story", {
        body: {
          subject: selectedSubject,
          topic,
          age: child?.age,
          childName: child?.name,
        },
      });

      if (error) {
        if (error.message?.includes("429")) {
          toast.error("Rate limit exceeded. Please try again later.");
        } else if (error.message?.includes("402")) {
          toast.error("Payment required. Please contact support.");
        } else {
          throw error;
        }
        return;
      }

      setStory(data.story);
      toast.success("Story generated!");
    } catch (error) {
      console.error("Error generating story:", error);
      toast.error("Failed to generate story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
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

  const currentSubject = subjects.find((s) => s.value === selectedSubject);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-fun/5">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <button
          onClick={() => navigate(`/learn/${childId}`)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Learning</span>
        </button>

        <Card className="mb-6 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{getMascotEmoji(child.mascot_id)}</div>
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="w-8 h-8 text-primary" />
                  Story Time
                </h1>
                <p className="text-muted-foreground">Learning through magical stories for {child.name}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="mb-6 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <div className="p-6 space-y-4">
            <div>
              <Label htmlFor="subject">Choose a Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select a subject..." />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.value} value={subject.value}>
                      {subject.emoji} {subject.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSubject && (
              <div>
                <Label htmlFor="topic">Choose a Topic</Label>
                <Select value={selectedTopic} onValueChange={(value) => {
                  setSelectedTopic(value);
                  setCustomTopic("");
                }}>
                  <SelectTrigger id="topic">
                    <SelectValue placeholder="Select a topic..." />
                  </SelectTrigger>
                  <SelectContent>
                    {currentSubject?.topics.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">✏️ Custom Topic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedTopic === "custom" && (
              <div>
                <Label htmlFor="customTopic">Enter Your Topic</Label>
                <Input
                  id="customTopic"
                  placeholder="E.g., The Solar System, Fractions, Ancient Rome..."
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                />
              </div>
            )}

            <Button
              onClick={generateStory}
              disabled={loading || !selectedSubject || (!selectedTopic && !customTopic)}
              className="w-full gradient-primary text-white border-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Your Story...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Story
                </>
              )}
            </Button>
          </div>
        </Card>

        {story && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-primary/5">
            <div className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Your Story</h2>
              </div>
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {story}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Storytelling;