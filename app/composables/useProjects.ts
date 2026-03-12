export interface Project {
  label: string;
  value: string;
}

export const useProjects = () => {
  const projects = useCookie<Project[]>("projects", {
    default: () => [],
    watch: true,
  });

  const getProjectLabel = (value: string) => {
    return projects.value.find((p) => p.value === value)!.label;
  };

  return {
    projects,
    getProjectLabel,
  };
};
