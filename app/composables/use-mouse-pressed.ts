import type { ShallowRef } from "vue";
import { useEventListener } from "@vueuse/core";

interface useMousePressedProps {
  target: ShallowRef<HTMLElement | null>;
  onPressed: (event: MouseEvent) => void;
  onReleased: (event: MouseEvent) => void;
}

export default function useMousePressed({ target, onPressed, onReleased }: useMousePressedProps) {
  function onMouseDown(e: MouseEvent) {
    onPressed(e);
  }
  function onMouseUp(e: MouseEvent) {
    onReleased(e);
  }

  useEventListener(target, "mousedown", onMouseDown);
  useEventListener(target, "mouseup", onMouseUp);
}
