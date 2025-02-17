"use client";

import { ChevronsLeftRightEllipsis } from "lucide-react";
import { PowerCard } from "./power-card";

export const PowerUsage = () => {
  return (
    <PowerCard
      label="usage"
      value={233}
      unit="watt"
      icon={ChevronsLeftRightEllipsis}
    />
  );
};
