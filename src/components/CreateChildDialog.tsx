import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MASCOTS = [
  { id: "dragon", name: "Dragon", emoji: "🐉" },
  { id: "unicorn", name: "Unicorn", emoji: "🦄" },
  { id: "robot", name: "Robot", emoji: "🤖" },
  { id: "panda", name: "Panda", emoji: "🐼" },
  { id: "fox", name: "Fox", emoji: "🦊" },
  { id: "owl", name: "Owl", emoji: "🦉" },
];

interface CreateChildDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChildCreated: () => void;
}

const CreateChildDialog = ({ open, onOpenChange, onChildCreated }: CreateChildDialogProps) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [selectedMascot, setSelectedMascot] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !age || !selectedMascot) {
      toast.error("Please fill in all fields");
      return;
    }

    const ageNum = parseInt(age);
    if (ageNum < 3 || ageNum > 18) {
      toast.error("Age must be between 3 and 18");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("children").insert({
        user_id: user.id,
        name,
        age: ageNum,
        mascot_id: selectedMascot,
      });

      if (error) throw error;

      toast.success(`${name}'s profile created! 🎉`);
      onChildCreated();
      onOpenChange(false);
      setName("");
      setAge("");
      setSelectedMascot("");
    } catch (error) {
      console.error("Error creating child:", error);
      toast.error("Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Create New Learner Profile 🌟
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter child's name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min="3"
              max="18"
              placeholder="Age (3-18)"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label>Choose a Learning Buddy</Label>
            <div className="grid grid-cols-3 gap-3">
              {MASCOTS.map((mascot) => (
                <button
                  key={mascot.id}
                  type="button"
                  onClick={() => setSelectedMascot(mascot.id)}
                  className={`p-4 rounded-2xl border-2 transition-all hover:scale-105 ${
                    selectedMascot === mascot.id
                      ? "border-primary bg-primary/10 shadow-glow"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-4xl mb-1">{mascot.emoji}</div>
                  <div className="text-xs font-medium">{mascot.name}</div>
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-white border-0 py-6 text-lg rounded-2xl hover:shadow-glow transition-all"
          >
            {loading ? "Creating..." : "Create Profile 🚀"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChildDialog;
