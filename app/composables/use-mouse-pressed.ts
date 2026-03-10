import type { ShallowRef } from "vue";

interface useMousePressedProps {
  target: ShallowRef<HTMLElement | null>;
  onPressed: (event: MouseEvent) => void;
  onReleased: (event: MouseEvent) => void;
}

export default function useMousePressed({
  target,
  onPressed,
  onReleased,
}: useMousePressedProps) {
  function onMouseDown(e: MouseEvent) {
    onPressed(e);
  }
  function onMouseUp(e: MouseEvent) {
    onReleased(e);
  }

  watch(target, () => {
    if (!target.value) {
      return;
    }

    target.value.addEventListener("mousedown", onMouseDown);
    target.value.addEventListener("mouseup", onMouseUp);
  });
}
