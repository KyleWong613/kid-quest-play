import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, Award, Star } from "lucide-react";
import { toast } from "sonner";

interface Child {
  id: string;
  name: string;
  age: number;
  mascot_id: string;
}

interface Badge {
  id: string;
  badge_type: string;
  badge_name: string;
  earned_at: string;
}

const Certificates = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      fetchData();
    }
  }, [childId]);

  const fetchData = async () => {
    try {
      const { data: childData, error: childError } = await supabase
        .from("children")
        .select("*")
        .eq("id", childId)
        .single();

      if (childError) throw childError;
      setChild(childData);

      const { data: badgesData, error: badgesError } = await supabase
        .from("badges")
        .select("*")
        .eq("child_id", childId)
        .order("earned_at", { ascending: false });

      if (badgesError) throw badgesError;
      setBadges(badgesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load certificates");
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

  const getBadgeEmoji = (badgeType: string) => {
    const emojis: { [key: string]: string } = {
      starter: "⭐",
      learner: "📚",
      master: "🏆",
      explorer: "🔍",
      achiever: "🎯",
    };
    return emojis[badgeType] || "🏅";
  };

  const generateCertificate = (badge: Badge) => {
    // Create a printable certificate
    const certificateWindow = window.open('', '_blank');
    if (!certificateWindow) return;

    const certificateHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${child?.name}</title>
          <style>
            body {
              font-family: 'Georgia', serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .certificate {
              background: white;
              padding: 60px;
              border-radius: 20px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 800px;
              border: 8px solid #667eea;
            }
            .badge {
              font-size: 80px;
              margin-bottom: 20px;
            }
            h1 {
              color: #667eea;
              font-size: 48px;
              margin: 20px 0;
            }
            .child-name {
              font-size: 36px;
              color: #333;
              font-weight: bold;
              margin: 30px 0;
            }
            .achievement {
              font-size: 24px;
              color: #666;
              margin: 20px 0;
            }
            .date {
              font-size: 18px;
              color: #999;
              margin-top: 40px;
            }
            .mascot {
              font-size: 60px;
              margin-top: 20px;
            }
            @media print {
              body {
                background: white;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="badge">${getBadgeEmoji(badge.badge_type)}</div>
            <h1>Certificate of Achievement</h1>
            <p class="achievement">This certificate is proudly presented to</p>
            <div class="child-name">${child?.name}</div>
            <p class="achievement">
              For earning the <strong>${badge.badge_name}</strong> badge<br/>
              and demonstrating excellence in learning!
            </p>
            <div class="mascot">${child ? getMascotEmoji(child.mascot_id) : '✨'}</div>
            <p class="date">
              Awarded on ${new Date(badge.earned_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p class="no-print" style="margin-top: 40px;">
              <button onclick="window.print()" style="
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                padding: 15px 40px;
                border-radius: 25px;
                font-size: 18px;
                cursor: pointer;
              ">Print Certificate</button>
            </p>
          </div>
        </body>
      </html>
    `;

    certificateWindow.document.write(certificateHTML);
    certificateWindow.document.close();
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
          Back
        </Button>

        <div className="bg-white rounded-3xl p-6 md:p-8 mb-8 shadow-card animate-fade-in">
          <div className="flex items-center gap-6 mb-6">
            <div className="text-6xl animate-float">{getMascotEmoji(child.mascot_id)}</div>
            <div>
              <h1 className="text-4xl font-black text-foreground mb-2">
                {child.name}'s Certificates
              </h1>
              <p className="text-xl text-muted-foreground">
                {badges.length} Achievement{badges.length !== 1 ? 's' : ''} Earned!
              </p>
            </div>
          </div>
        </div>

        {badges.length === 0 ? (
          <Card className="p-12 text-center animate-fade-in">
            <Award className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              No Certificates Yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Complete lessons to earn badges and certificates!
            </p>
            <Button
              onClick={() => navigate(`/learn/${childId}`)}
              className="gradient-primary text-white border-0 hover:shadow-glow transition-all"
            >
              Start Learning
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {badges.map((badge, index) => (
              <Card
                key={badge.id}
                className="p-6 hover:scale-105 transition-bounce shadow-card border-0 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">{getBadgeEmoji(badge.badge_type)}</div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {badge.badge_name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Earned on {new Date(badge.earned_at).toLocaleDateString()}
                  </p>
                  <Button
                    onClick={() => generateCertificate(badge)}
                    className="w-full gradient-primary text-white border-0 hover:shadow-glow transition-all"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Certificate
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-0 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <Star className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">How to Earn More Certificates</h2>
          </div>
          <ul className="space-y-2 text-muted-foreground">
            <li>✨ Complete lessons to earn your first badge</li>
            <li>🎯 Master different subjects to unlock special achievements</li>
            <li>🏆 Consistency is key - keep learning every day!</li>
            <li>🌟 Challenge yourself with harder levels for bonus badges</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Certificates;
