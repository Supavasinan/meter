import { create } from "zustand";

type Store = {
  liveMode: boolean;
    setLiveMode: (liveMode: boolean) => void;
};

export const useLiveModeStore = create<Store>((set) => ({
  liveMode: false,
  setLiveMode: (liveMode: boolean) => set({ liveMode }),
}));
