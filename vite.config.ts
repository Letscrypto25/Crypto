import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import { mochaPlugins } from "@getmocha/vite-plugins";

export default defineConfig(({ mode }) => {
  // Load env variables based on mode (dev/prod)
  const env = loadEnv(mode, process.cwd(), ['VITE_']);

  return {
    plugins: [...mochaPlugins(process.env as any), react(), cloudflare()],
    server: {
      allowedHosts: true,
      proxy: {
        '/supabase': {
          target: env.VITE_SUPABASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/supabase/, ''),
          headers: {
            'apikey': env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${env.VITE_SUPABASE_ANON_KEY}`
          }
        }
      }
    },
    build: {
      chunkSizeWarningLimit: 5000,
      rollupOptions: {
        plugins: [
          {
            name: 'node-polyfills',
            setup(build) {
              build.onResolve({ filter: /^node:/ }, ({ path }) => {
                return { path: path.slice(5), external: true };
              });
            }
          }
        ]
      }
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        'supabase': path.resolve(__dirname, "./src/lib/supabase"),
      },
    },
    define: {
      // Only expose VITE_ prefixed env variables to client
      'process.env': Object.keys(env).reduce((acc, key) => {
        if (key.startsWith('VITE_')) {
          acc[key] = JSON.stringify(env[key]);
        }
        return acc;
      }, {} as Record<string, string>),
      'global': {}
    },
    optimizeDeps: {
      include: [
        '@supabase/supabase-js',
        'node-fetch',
        'isomorphic-fetch',
        'form-data'
      ],
      esbuildOptions: {
        define: {
          global: 'globalThis'
        }
      }
    }
  };
});
