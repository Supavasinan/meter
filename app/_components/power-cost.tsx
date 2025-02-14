"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DollarSign } from "lucide-react";
import { useState } from "react";

export const PowerCost = () => {
  const [value, setValue] = useState("");

  return (
    <div className=" border p-4 rounded-xl">
      <span className="uppercase opacity-55 text-sm">cost</span>
      <div className="flex justify-between items-center mt-2">
        <p className="font-semibold text-lg">
          0.2 <span className="uppercase">USD/H</span>
        </p>
        <div className="border w-fit border-primary rounded-xl p-2 bg-primary/10">
          <DollarSign className="size-6" />
        </div>
      </div>

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
    </div>
  );
};
