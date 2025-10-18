import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, Book, Star, Trophy, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        navigate("/dashboard");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen gradient-primary overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <nav className="flex justify-between items-center mb-16 animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-white" />
            <span className="text-2xl font-black text-white">Kidsify</span>
          </div>
          <Button
            onClick={() => navigate("/auth")}
            variant="secondary"
            className="rounded-full hover:scale-105 transition-bounce"
          >
            Get Started
          </Button>
        </nav>

        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block mb-6">
            <div className="flex gap-3 text-6xl md:text-7xl animate-float">
              <span>🐉</span>
              <span style={{ animationDelay: "0.2s" }} className="animate-float">🦄</span>
              <span style={{ animationDelay: "0.4s" }} className="animate-float">🤖</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Where Learning
            <br />
            Becomes Adventure
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Gamified, AI-powered education that helps children aged 3-18 learn through interactive storytelling and voice-guided fun
          </p>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="gradient-fun text-white border-0 text-xl px-8 py-6 rounded-2xl hover:shadow-glow transition-all hover:scale-105"
          >
            Start Your Journey 🚀
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            {
              icon: Book,
              title: "Story-Based Learning",
              description: "Learn through magical tales",
              color: "primary",
              delay: "0s",
            },
            {
              icon: Sparkles,
              title: "Voice-First",
              description: "Perfect for early readers",
              color: "secondary",
              delay: "0.1s",
            },
            {
              icon: Star,
              title: "Earn Rewards",
              description: "Points, badges & certificates",
              color: "accent",
              delay: "0.2s",
            },
            {
              icon: Trophy,
              title: "Track Progress",
              description: "Parent dashboard included",
              color: "success",
              delay: "0.3s",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-6 shadow-card hover:scale-105 transition-bounce animate-fade-in"
              style={{ animationDelay: feature.delay }}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-glow text-center animate-fade-in">
          <Heart className="w-16 h-16 text-primary mx-auto mb-6 animate-float" />
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
            Made for Every Family
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Kidsify works offline, supports multiple languages, and adapts to each child's learning style. From rural villages to bustling cities, every child deserves joyful education.
          </p>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="gradient-primary text-white border-0 text-lg px-8 py-6 rounded-2xl hover:shadow-glow transition-all"
          >
            Join Kidsify Today
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
