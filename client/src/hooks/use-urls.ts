import { useMutation, useQuery } from "@tanstack/react-query";
import { api, buildUrl, type CreateUrlInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCreateUrl() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateUrlInput) => {
      // Validate with Zod before sending
      const validated = api.urls.create.input.parse(data);
      
      const res = await fetch(api.urls.create.path, {
        method: api.urls.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 409) {
           throw new Error("Custom code already taken!");
        }
        if (res.status === 400) {
           const error = await res.json();
           throw new Error(error.message || "Invalid input");
        }
        throw new Error("Failed to shorten URL");
      }

      return api.urls.create.responses[201].parse(await res.json());
    },
    onError: (error) => {
      toast({
        title: "SYSTEM ERROR",
        description: error.message,
        variant: "destructive",
        className: "font-mono border-2 border-red-500 bg-black text-red-500 rounded-none box-shadow-retro"
      });
    },
  });
}

export function useResolveUrl(code: string) {
  return useQuery({
    queryKey: [api.urls.resolve.path, code],
    queryFn: async () => {
      const url = buildUrl(api.urls.resolve.path, { code });
      const res = await fetch(url);
      
      if (res.status === 404 || res.status === 410) {
        throw new Error("LINK_EXPIRED_OR_NOT_FOUND");
      }
      
      if (!res.ok) {
        throw new Error("Failed to resolve URL");
      }

      return api.urls.resolve.responses[200].parse(await res.json());
    },
    retry: false,
    enabled: !!code,
  });
}
