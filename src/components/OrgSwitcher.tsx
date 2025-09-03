'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Select } from '@/components/ui/Select';

type Org = { id: string; name: string; role: 'ADMIN' | 'EDITOR' | 'VIEWER'; isActive: boolean };

interface OrgSwitcherProps {
  label?: string;
  className?: string;
}

export function OrgSwitcher({ label = 'Organization', className }: OrgSwitcherProps) {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string | undefined>();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/orgs');
        if (!res.ok) return;
        const data = (await res.json()) as Org[];
        if (!mounted) return;
        setOrgs(data);
        const current = data.find((o) => o.isActive) ?? data[0];
        setActive(current?.id);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onChange = async (val: string) => {
    setActive(val);
    await fetch(`/api/orgs/${val}/switch`, { method: 'POST' });
    // Soft refresh to reflect org context changes without full reload
    router.refresh();
  };

  if (loading || orgs.length === 0) return null;

  return (
    <div className={className ?? 'min-w-[180px]'}>
      <Select label={label} value={active} onChange={(e) => onChange(e.target.value)}>
        {orgs.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name} ({o.role.toLowerCase()})
          </option>
        ))}
      </Select>
    </div>
  );
}
