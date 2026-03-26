export enum ModalKey {
  Settings = "settings",
  Summary = "summary",
  Event = "event",
}

export default function useModal() {
  const isOpen = useState<ModalKey | undefined>("open-modal", () => undefined);

  function open(key: ModalKey) {
    if (isOpen.value === undefined) {
      isOpen.value = key;
      return true;
    }
    return false;
  }

  function close() {
    isOpen.value = undefined;
  }

  defineShortcuts({
    escape: {
      usingInput: true,
      handler: close,
    },
  });

  const isSettingsModalOpen = computed(() => isOpen.value === ModalKey.Settings);
  const isSummaryModalOpen = computed(() => isOpen.value === ModalKey.Summary);
  const isEventModalOpen = computed(() => isOpen.value === ModalKey.Event);

  return {
    isSettingsModalOpen,
    isSummaryModalOpen,
    isEventModalOpen,

    open,
    close,
  };
}
