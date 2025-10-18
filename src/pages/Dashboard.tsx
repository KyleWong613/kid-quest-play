import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, User } from "lucide-react";
import { toast } from "sonner";
import CreateChildDialog from "@/components/CreateChildDialog";
import ScoreCalendar from "@/components/ScoreCalendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Child {
  id: string;
  name: string;
  age: number;
  mascot_id: string;
}

interface Badge {
  id: string;
  badge_name: string;
  badge_type: string;
  earned_at: string;
  child_id: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [children, setChildren] = useState<Child[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [badgesByChild, setBadgesByChild] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedChildForCalendar, setSelectedChildForCalendar] = useState<string>("");

  useEffect(() => {
    checkAuth();
    fetchChildren();
    fetchBadges();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchChildren = async () => {
    try {
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .order("age", { ascending: true });

      if (error) throw error;
      setChildren(data || []);
    } catch (error) {
      console.error("Error fetching children:", error);
      toast.error(t('dashboard.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const fetchBadges = async () => {
    try {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .order("earned_at", { ascending: false });

      if (error) throw error;
      setBadges(data || []);
      
      // Group badges by child_id
      const badgeCounts: Record<string, number> = {};
      (data || []).forEach((badge) => {
        badgeCounts[badge.child_id] = (badgeCounts[badge.child_id] || 0) + 1;
      });
      setBadgesByChild(badgeCounts);
    } catch (error) {
      console.error("Error fetching badges:", error);
    }
  };

  const handleChildSelect = (childId: string) => {
    navigate(`/learn/${childId}`);
  };

  const getBadgeEmoji = (badgeType: string) => {
    const types: { [key: string]: string } = {
      certificate: "🏆",
      achievement: "⭐",
      milestone: "🎯",
      special: "💎",
    };
    return types[badgeType] || "🎖️";
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
        <div className="text-white text-2xl animate-pulse">{t('dashboard.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-primary p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 animate-fade-in">
              {t('dashboard.welcomeBack')}
            </h1>
            <p className="text-xl text-white/90">{t('dashboard.chooselearner')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {children.map((child, index) => (
            <Card
              key={child.id}
              className="p-6 cursor-pointer hover:scale-105 transition-bounce shadow-card border-0 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleChildSelect(child.id)}
            >
              <div className="text-center">
                <div className="text-6xl mb-4 animate-float">{getMascotEmoji(child.mascot_id)}</div>
                <h3 className="text-2xl font-bold text-foreground mb-1">{child.name}</h3>
                <p className="text-muted-foreground mb-2">{t('dashboard.age')} {child.age}</p>
                <div className="flex items-center justify-center gap-2 mb-3 p-2 rounded-lg bg-fun/10">
                  <span className="text-2xl">🎖️</span>
                  <span className="text-lg font-bold text-fun">
                    {badgesByChild[child.id] || 0} {badgesByChild[child.id] === 1 ? 'Badge' : 'Badges'}
                  </span>
                </div>
                <Button className="mt-4 w-full gradient-primary text-white border-0 hover:shadow-glow transition-all">
                  {t('dashboard.startLearning')}
                </Button>
              </div>
            </Card>
          ))}

          <Card
            className="p-6 cursor-pointer hover:scale-105 transition-bounce border-2 border-dashed border-primary/30 bg-white/50 backdrop-blur-sm animate-fade-in"
            style={{ animationDelay: `${children.length * 0.1}s` }}
            onClick={() => setShowCreateDialog(true)}
          >
            <div className="text-center h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1">{t('dashboard.addLearner')}</h3>
              <p className="text-sm text-muted-foreground">{t('dashboard.createProfile')}</p>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-card border-0">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">{t('dashboard.parentDashboard')}</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            {t('dashboard.viewProgress')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-primary/10">
              <p className="text-sm text-primary font-semibold mb-1">{t('dashboard.totalLearners')}</p>
              <p className="text-3xl font-black text-primary">{children.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-success/10">
              <p className="text-sm text-success font-semibold mb-1">{t('dashboard.activeAdventures')}</p>
              <p className="text-3xl font-black text-success">{children.length > 0 ? "🚀" : "—"}</p>
            </div>
            <div className="p-4 rounded-2xl bg-fun/10">
              <p className="text-sm text-fun font-semibold mb-1">{t('dashboard.badgesEarned')}</p>
              <p className="text-3xl font-black text-fun">{badges.length} 🎖️</p>
              <div className="mt-2 space-y-1">
                {children.map((child) => (
                  <div key={child.id} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {getMascotEmoji(child.mascot_id)} {child.name}
                    </span>
                    <span className="font-bold text-fun">{badgesByChild[child.id] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {children.length > 0 && (
        <div className="mt-6 max-w-6xl mx-auto">
          <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-card border-0 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">{t('calendar.title')}</h2>
              <Select value={selectedChildForCalendar} onValueChange={setSelectedChildForCalendar}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t('calendar.selectChild')} />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {getMascotEmoji(child.mascot_id)} {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedChildForCalendar && (
              <ScoreCalendar childId={selectedChildForCalendar} />
            )}
            {!selectedChildForCalendar && (
              <p className="text-muted-foreground text-center py-8">{t('calendar.pleaseSelect')}</p>
            )}
          </Card>
        </div>
      )}

      {badges.length > 0 && (
        <Card className="mt-6 p-6 bg-white/80 backdrop-blur-sm shadow-card border-0 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-4">{t('dashboard.recentBadges')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.slice(0, 8).map((badge) => (
              <div key={badge.id} className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-fun/10 text-center">
                <div className="text-4xl mb-2">{getBadgeEmoji(badge.badge_type)}</div>
                <p className="text-sm font-bold text-foreground">{badge.badge_name}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <CreateChildDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onChildCreated={() => {
          fetchChildren();
          fetchBadges();
        }}
      />
    </div>
  );
};

export default Dashboard;
