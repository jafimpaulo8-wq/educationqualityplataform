import { useState, useEffect } from 'react';
import { auditService } from '../security/auditService';
import { AuditLogEntry, CriticalAuditAction, AuditEntity } from '../types/audit';

export function useAudit(limit = 20) {
  const [logs, setLogs] = useState<AuditLogEntry[]>(auditService.getLogs({ limit }));

  useEffect(() => {
    const unsubscribe = auditService.subscribe(allLogs => {
      setLogs(allLogs.slice(0, limit));
    });
    return () => unsubscribe();
  }, [limit]);

  return {
    logs,
    recordAction: (params: {
      action: CriticalAuditAction;
      actionLabel: string;
      entity: AuditEntity | string;
      entityId: string;
      summary: string;
      previousValue?: any;
      newValue?: any;
      metadata?: Record<string, any>;
      severity?: 'info' | 'aviso' | 'critico';
    }) => auditService.record(params)
  };
}
