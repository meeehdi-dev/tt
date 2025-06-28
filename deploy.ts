interface DeployResponse {
  deployments: {
    message: string;
    resource_uuid: string;
    deployment_uuid: string;
  }[];
}

interface DeployError {
  message: string;
}

function isDeployError(
  data: DeployResponse | DeployError,
): data is DeployError {
  return (data as DeployError).message !== undefined;
}

async function main() {
  const res = await fetch(
    "https://coolify.kokoro-soft.fr/api/v1/deploy?uuid=nscgkwok408sskw44kcowo8k&force=false",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.COOLIFY_API_TOKEN}`,
      },
    },
  );
  const data = (await res.json()) as DeployResponse | DeployError;
  if (isDeployError(data)) {
    console.error(data.message);
    return;
  }
  console.log(data.deployments[0].message);
}

void main();
