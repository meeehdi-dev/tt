export default function useMouse() {
  const x = shallowRef(0);
  const y = shallowRef(0);

  function onMouseMove(e: MouseEvent) {
    x.value = e.clientX;
    y.value = e.clientY;
  }

  onMounted(() => {
    document.addEventListener("mousemove", onMouseMove);
  });
  onUnmounted(() => {
    document.removeEventListener("mousemove", onMouseMove);
  });

  return {
    x,
    y,
  };
}
