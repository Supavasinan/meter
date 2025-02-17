"use client";

import { Activity } from "lucide-react";
import { PowerCard } from "./power-card";

export const PowerAmp = ({}) => {
  return <PowerCard label="Amp" value={2} unit="A" icon={Activity} />;
};
