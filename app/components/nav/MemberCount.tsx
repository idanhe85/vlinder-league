'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export function MemberCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    createClient()
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .then(({ count: c }) => setCount(c));
  }, []);

  if (count === null) return null;
  return <>{count} Member{count !== 1 ? 's' : ''} Active</>;
}
