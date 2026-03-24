import type { Project } from "~/types";

export default function useProjects() {
  const nuxtApp = useNuxtApp();

  const { data: projects } = useAsyncData("projects", () => $fetch("/api/projects"), {
    default: () => [] as Project[],
    server: false,
    dedupe: "defer",
    getCachedData(key) {
      return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
    },
  });

  function getProjectName(id: string) {
    return projects.value.find((p) => p.id === id)?.name ?? id;
  }

  function getProjectColor(id: string) {
    return projects.value.find((p) => p.id === id)?.color ?? "#f59e0b";
  }

  function isProjectDeleted(id: string) {
    const project = projects.value.find((p) => p.id === id);
    return !!project?.deletedAt;
  }

  async function getProjectEventsCount(id: string) {
    const response = await $fetch<{ count: number }>(`/api/projects/${id}/events/count`);
    return response.count;
  }

  async function createProject(name: string, color: string) {
    const created = await $fetch("/api/projects", {
      method: "POST",
      body: { name, color },
    });
    projects.value.push(created!);
  }

  async function updateProject(id: string, name: string, color: string) {
    await $fetch(`/api/projects/${id}`, {
      method: "PATCH",
      body: { name, color },
    });

    projects.value = [
      ...projects.value.filter((e) => e.id !== id),
      {
        id,
        name,
        color,
        deletedAt: projects.value.find((p) => p.id === id)?.deletedAt,
      },
    ];
  }

  async function deleteProject(id: string) {
    const response = await $fetch<{ softDeleted: boolean }>(`/api/projects/${id}`, { method: "DELETE" });
    if (response.softDeleted) {
      const project = projects.value.find((p) => p.id === id);
      if (project) {
        project.deletedAt = new Date().toISOString();
      }
    } else {
      projects.value = projects.value.filter((p) => p.id !== id);
    }
  }

  async function restoreProject(id: string, name: string, color: string) {
    const restored = await $fetch(`/api/projects/${id}`, {
      method: "PATCH",
      body: { name, color, deletedAt: null },
    });
    projects.value.push(restored!);
  }

  return {
    projects: readonly(projects),

    createProject,
    updateProject,
    deleteProject,
    restoreProject,
    getProjectName,
    getProjectColor,
    isProjectDeleted,
    getProjectEventsCount,
  };
}
