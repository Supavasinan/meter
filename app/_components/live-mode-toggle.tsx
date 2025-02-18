import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLiveModeStore } from "@/project/store/live-mode";
import { Radio } from "lucide-react";
import { useId } from "react";

export const LiveModeToggle = () => {
  const id = useId();
  const { liveMode, setLiveMode } = useLiveModeStore();

  return (
    <div className="mt-3 relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring">
      <Switch
        checked={liveMode}
        onCheckedChange={setLiveMode}
        id={id}
        className="order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 [&_span]:data-[state=checked]:translate-x-2 rtl:[&_span]:data-[state=checked]:-translate-x-2"
      />
      <div className="flex grow items-center gap-3">
        <Radio className="size-10" />
        <div className="grid grow gap-2">
          <Label htmlFor={id}>Live Mode</Label>
          <p id={`${id}-description`} className="text-xs text-muted-foreground">
            Enable live mode for real-time updates.
          </p>
        </div>
      </div>
    </div>
  );
};
