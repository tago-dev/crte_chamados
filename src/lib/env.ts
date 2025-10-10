type EnvVarOptions = {
  defaultValue?: string;
  required?: boolean;
};

const readEnv = (name: string, options: EnvVarOptions = {}) => {
  const value = process.env[name] ?? options.defaultValue;

  if (options.required && (!value || value.length === 0)) {
    throw new Error(
      `A variável de ambiente ${name} é obrigatória, mas não foi encontrada.`
    );
  }

  return value;
};

export const env = {
  clerkPublishableKey: readEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
  clerkSecretKey: readEnv("CLERK_SECRET_KEY"),
  supabaseUrl: readEnv("SUPABASE_URL", { required: true }),
  supabaseAnonKey: readEnv("SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: readEnv("SUPABASE_SERVICE_ROLE_KEY", {
    required: true,
  }),
};
