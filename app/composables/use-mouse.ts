import { createSharedComposable, useEventListener } from "@vueuse/core";

function useMouse() {
  const x = shallowRef(0);
  const y = shallowRef(0);

  function onMouseMove(e: MouseEvent) {
    x.value = e.clientX;
    y.value = e.clientY;
  }

  useEventListener("mousemove", onMouseMove);

  return {
    x,
    y,
  };
}

const useSharedMouse = createSharedComposable(useMouse);

export default useSharedMouse;
