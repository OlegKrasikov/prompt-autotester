'use client'

import React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ScenarioFull } from "@/lib/types";
import ScenarioEditor from "@/components/ScenarioEditor";

export default function EditScenarioPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [scenario, setScenario] = React.useState<ScenarioFull | null>(null);
  const [loading, setLoading] = React.useState(true);
  const resolvedParams = params;

  React.useEffect(() => {
    if (!isPending && !session && resolvedParams) {
      router.replace(`/login?redirect=/scenarios/${resolvedParams.id}/edit`);
    }
  }, [isPending, session, router, resolvedParams.id]);

  React.useEffect(() => {
    if (session && resolvedParams) {
      const fetchScenario = async () => {
        try {
          const response = await fetch(`/api/scenarios/${resolvedParams.id}`);
          if (response.ok) {
            const data = await response.json();
            setScenario(data);
          } else if (response.status === 404) {
            router.push('/scenarios');
          }
        } catch (error) {
          console.error('Failed to fetch scenario:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchScenario();
    }
  }, [session, resolvedParams.id, router]);

  if (!session || loading) return <div className="p-8">Loading...</div>;
  if (!scenario) return <div className="p-8">Scenario not found</div>;

  return (
    <ScenarioEditor
      mode="edit"
      initialData={scenario}
      onSave={(scenario) => {
        router.push('/scenarios');
      }}
      onCancel={() => router.push('/scenarios')}
    />
  );
}
