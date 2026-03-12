<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";

useSeoMeta({
  title: "Sign In",
});

const { signIn } = useAuth();

const fields: AuthFormField[] = [
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "Enter your email",
    required: true,
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    required: true,
  },
];

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type Schema = z.output<typeof schema>;

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  // Simulating an API call/authentication delay
  console.log("Submitting login for:", payload.data.email);
  await signIn();
}
</script>

<template>
  <div class="flex h-screen items-center justify-center p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="Welcome back"
        description="Enter your credentials to access your account."
        icon="i-lucide-lock"
        :fields="fields"
        @submit="onSubmit"
      />
    </UPageCard>
  </div>
</template>
