import type { Project } from "~/types";

export default function useProjects() {
  const nuxtApp = useNuxtApp();

  const { data: projects } = useAsyncData(
    "projects",
    () => $fetch("/api/projects"),
    {
      default: () => [] as Project[],
      server: false,
      dedupe: "defer",
      getCachedData(key) {
        return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      },
    },
  );

  function getProjectName(id: string) {
    return projects.value.find((p) => p.id === id)?.name ?? id;
  }

  async function createProject(name: string) {
    const created = await $fetch("/api/projects", {
      method: "POST",
      body: { name: name },
    });
    projects.value.push(created!);
  }

  async function updateProject(id: string, name: string) {
    await $fetch(`/api/projects/${id}`, {
      method: "PATCH",
      body: { name },
    });

    projects.value = [
      ...projects.value.filter((e) => e.id !== id),
      { id, name },
    ];
  }

  async function deleteProject(id: string) {
    await $fetch(`/api/projects/${id}`, { method: "DELETE" });
  }

  return {
    projects: readonly(projects),

    createProject,
    updateProject,
    deleteProject,
    getProjectName,
  };
}
