import { useEventListener } from "@vueuse/core";
import type { ShallowRef } from "vue";

interface UseLongPressProps {
  target: ShallowRef<HTMLElement | null>;
  onLongPress: (e: MouseEvent) => void;
  onRelease: (e: MouseEvent) => void;
}

const DISTANCE_THRESHOLD = 10;

export default function useLongPress({
  target,
  onLongPress,
  onRelease,
}: UseLongPressProps) {
  const longPressTimeout = shallowRef(0);
  const isLongPress = shallowRef(false);

  const { x, y } = useMouse();
  const initialX = shallowRef(0);
  const initialY = shallowRef(0);

  function getDistanceFromInitial() {
    return Math.sqrt(
      Math.pow(x.value - initialX.value, 2) +
        Math.pow(y.value - initialY.value, 2),
    );
  }

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

    initialX.value = x.value;
    initialY.value = y.value;

    longPressTimeout.value = setTimeout(() => {
      if (getDistanceFromInitial() > DISTANCE_THRESHOLD) {
        return;
      }

      isLongPress.value = true;
      onLongPress(e);
    }, 500);
  }

  useEventListener(target, "mousedown", onMouseDown);
  useEventListener(target, "mouseup", onMouseUp);

  return { isLongPress };
}
