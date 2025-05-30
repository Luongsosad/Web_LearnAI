import { create } from "zustand";

interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  setOpen: (value: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => {
  // đọc từ sessionStorage khi khởi tạo
  let initial = false;
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem("isOpen");
    initial = stored === "true";
  }

  return {
    isOpen: initial,
    toggle: () => set((state) => {
      const newValue = !state.isOpen;
      sessionStorage.setItem("isOpen", newValue.toString());
      return { isOpen: newValue };
    }),
    setOpen: (value) => {
      sessionStorage.setItem("isOpen", value.toString());
      set({ isOpen: value });
    },
  };
});
