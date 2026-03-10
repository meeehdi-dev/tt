import type { ShallowRef } from "vue";

interface UseLongPressProps {
  target: ShallowRef<HTMLElement | null>;
  onLongPress: (e: MouseEvent) => void;
  onRelease: (e: MouseEvent) => void;
}

export default function useLongPress({
  target,
  onLongPress,
  onRelease,
}: UseLongPressProps) {
  const longPressTimeout = shallowRef(0);
  const isLongPress = shallowRef(false);

  function onMouseUp(e: MouseEvent) {
    clearTimeout(longPressTimeout.value);
    if (!isLongPress.value) {
      return;
    }
    isLongPress.value = false;
    onRelease(e);
  }

  function onMouseDown(e: MouseEvent) {
    // left btn click only
    if (e.buttons !== 1) {
      return;
    }

    longPressTimeout.value = setTimeout(() => {
      isLongPress.value = true;
      onLongPress(e);
    }, 500);
  }

  watch(target, () => {
    if (!target.value) {
      return;
    }

    target.value.addEventListener("mousedown", onMouseDown);
    target.value.addEventListener("mouseup", onMouseUp);
  });

  return { isLongPress };
}
