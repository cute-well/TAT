import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type ProcessDocumentInput = z.infer<typeof api.documents.process.input>;

export function useDocuments() {
  return useQuery({
    queryKey: [api.documents.list.path],
    queryFn: async () => {
      const res = await fetch(api.documents.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      // Ensure data is an array before parsing
      if (!Array.isArray(data)) throw new Error("Invalid response format");
      return api.documents.list.responses[200].parse(data);
    },
  });
}

export function useDocument(id: number) {
  return useQuery({
    queryKey: [api.documents.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.documents.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch document");
      const data = await res.json();
      return api.documents.get.responses[200].parse(data);
    },
    enabled: !!id,
  });
}

export function useProcessDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: ProcessDocumentInput) => {
      const validated = api.documents.process.input.parse(input);
      const res = await fetch(api.documents.process.path, {
        method: api.documents.process.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.documents.process.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to process document");
      }
      
      const data = await res.json();
      return api.documents.process.responses[201].parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.documents.list.path] });
      toast({
        title: "Processing Complete",
        description: "The document has been successfully analyzed and categorized.",
      });
    },
    onError: (error) => {
      toast({
        title: "Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
