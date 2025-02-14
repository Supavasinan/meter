"use client";

import { ChevronsLeftRightEllipsis } from "lucide-react";

export const PowerUsage = () => {
  return (
    <div className="border p-4 rounded-xl">
      <span className="uppercase opacity-55 text-sm">usage</span>
      <div className="flex justify-between items-center mt-2">
        <p className="font-semibold text-lg">
          233 <span className="uppercase">watt</span>
        </p>
        <div className="border w-fit border-primary rounded-xl p-2 bg-primary/10">
          <ChevronsLeftRightEllipsis className="size-6" />
        </div>
      </div>
    </div>
  );
};
