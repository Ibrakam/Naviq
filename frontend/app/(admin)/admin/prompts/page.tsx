"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { PromptOut } from "@/types/api";

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<PromptOut[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [model, setModel] = useState("gpt-4o");
  const [temperature, setTemperature] = useState("0.7");

  const load = async () => {
    const data = await api.get<PromptOut[]>("/admin/prompts");
    setPrompts(data);
    if (!selectedId && data[0]) {
      setSelectedId(data[0].id);
      setSystemPrompt(data[0].system_prompt);
      setModel(data[0].model);
      setTemperature(String(data[0].temperature));
    }
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Prompt List</CardTitle>
          <CardDescription>System prompts and models</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {prompts.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => {
                setSelectedId(prompt.id);
                setSystemPrompt(prompt.system_prompt);
                setModel(prompt.model);
                setTemperature(String(prompt.temperature));
              }}
              className="w-full rounded-xl border border-white/10 p-2 text-left text-sm hover:bg-white/5"
            >
              {prompt.name}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Prompt Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model" />
          <Input value={temperature} onChange={(e) => setTemperature(e.target.value)} placeholder="Temperature" />
          <Textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} className="min-h-[38vh]" />
          <Button
            onClick={async () => {
              if (!selectedId) return;
              try {
                await api.patch<PromptOut>(`/admin/prompts/${selectedId}`, {
                  model,
                  temperature: Number(temperature),
                  system_prompt: systemPrompt,
                });
                await load();
                toast.success("Prompt updated");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Update failed");
              }
            }}
          >
            Save changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
