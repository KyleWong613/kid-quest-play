import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

const Auth = () => {
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
    <div className="min-h-screen flex items-center justify-center gradient-primary p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block p-4 bg-white/20 backdrop-blur-sm rounded-3xl mb-4 animate-float">
            <Sparkles className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-black text-white mb-2">Kidsify</h1>
          <p className="text-xl text-white/90">Where Learning Becomes Adventure!</p>
        </div>

        <div className="bg-white rounded-3xl shadow-glow p-8">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "hsl(270 80% 60%)",
                    brandAccent: "hsl(200 90% 55%)",
                    inputBackground: "hsl(240 100% 98%)",
                    inputBorder: "hsl(240 30% 88%)",
                    inputBorderFocus: "hsl(270 80% 60%)",
                    inputBorderHover: "hsl(270 80% 60%)",
                  },
                  radii: {
                    borderRadiusButton: "1rem",
                    buttonBorderRadius: "1rem",
                    inputBorderRadius: "1rem",
                  },
                },
              },
              className: {
                button: "transition-bounce hover:scale-105",
                input: "transition-all",
              },
            }}
            providers={[]}
            redirectTo={window.location.origin + "/dashboard"}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;
