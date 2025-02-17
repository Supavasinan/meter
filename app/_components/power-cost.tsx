"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DollarSign } from "lucide-react";
import { useState } from "react";
import { PowerCard } from "./power-card";

export const PowerCost = () => {
  const [value, setValue] = useState("");

  return (
    <PowerCard label="cost" value={0.2} unit="USD/H" icon={DollarSign}>
      <ToggleGroup
        className="flex w-fit gap-0 -space-x-px rounded-lg shadow-sm shadow-black/5 rtl:space-x-reverse"
        type="single"
        variant="outline"
        value={value}
        onValueChange={(value) => {
          if (value) setValue(value);
        }}
      >
        <ToggleGroupItem
          className="flex-1 !p- data-[state=on]:font-bold rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
          value="left"
        >
          M
        </ToggleGroupItem>
        <ToggleGroupItem
          className="flex-1 data-[state=on]:font-bold rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
          value="center"
        >
          H
        </ToggleGroupItem>
      </ToggleGroup>
    </PowerCard>
  );
};
