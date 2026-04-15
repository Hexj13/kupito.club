import type { ImportCommandOptions } from '../../partner-import-shared/import-workflow-types';
import type {
  CurrentPlpSnapshotData,
  RegistryItem,
  SourceCloseReason,
  SourceStatus,
} from '../types';

function getSourceStatusRank(status: SourceStatus): number {
  if (status === 'missing_candidate') return 0;
  if (status === 'active') return 1;
  return 2;
}

export function normalizeSourceStatus(item: RegistryItem): SourceStatus {
  if (
    item.sourceStatus === 'active' ||
    item.sourceStatus === 'missing_candidate' ||
    item.sourceStatus === 'closed'
  ) {
    return item.sourceStatus;
  }
  return item.state === 'closed' ? 'closed' : 'active';
}

export function buildActivePlpSnapshot(items: RegistryItem[]): CurrentPlpSnapshotData {
  const activeItems = [...items]
    .filter((item) => normalizeSourceStatus(item) === 'active')
    .sort((a, b) => a.discoveredAt.localeCompare(b.discoveredAt));

  return {
    items: Object.fromEntries(activeItems.map((item) => [item.sourceListingId, item])) as Record<
      string,
      RegistryItem
    >,
    meta: {
      lastUpdatedAt: new Date().toISOString(),
      activeItemsCount: activeItems.length,
      missingCandidatesCount: items.filter(
        (item) => normalizeSourceStatus(item) === 'missing_candidate',
      ).length,
      closedItemsCount: items.filter((item) => normalizeSourceStatus(item) === 'closed').length,
    },
  };
}

export interface FinalizePlpScanResult {
  items: RegistryItem[];
  activeItems: number;
  missingCandidates: number;
  closedItems: number;
  closeEstimate: number;
  closeValid: boolean;
}

export function finalizeRegistryAfterPlpScan(params: {
  items: RegistryItem[];
  seenSourceIds: Set<string>;
  closeValid: boolean;
  now: string;
}): FinalizePlpScanResult {
  const nextItems = params.items.map((item) => {
    const sourceStatus = normalizeSourceStatus(item);

    if (
      !params.closeValid ||
      params.seenSourceIds.has(item.sourceListingId) ||
      sourceStatus === 'closed'
    ) {
      return item;
    }

    return {
      ...item,
      sourceStatus: 'missing_candidate' as const,
      missingSince: item.missingSince ?? params.now,
      missingCount: sourceStatus === 'missing_candidate' ? (item.missingCount ?? 0) + 1 : 1,
      closeReason: 'plp_missing_candidate' as const,
      closeOutcome: undefined,
      updatedAt: params.now,
    };
  });

  const activeItems = nextItems.filter((item) => normalizeSourceStatus(item) === 'active').length;
  const missingCandidates = nextItems.filter(
    (item) => normalizeSourceStatus(item) === 'missing_candidate',
  ).length;
  const closedItems = nextItems.filter((item) => normalizeSourceStatus(item) === 'closed').length;
  const closeEstimate = nextItems.filter(
    (item) =>
      normalizeSourceStatus(item) === 'missing_candidate' &&
      typeof item.kupitoListingId === 'string',
  ).length;

  return {
    items: nextItems,
    activeItems,
    missingCandidates,
    closedItems,
    closeEstimate,
    closeValid: params.closeValid,
  };
}

export function selectImportCandidates(
  items: RegistryItem[],
  options: Pick<ImportCommandOptions, 'sourceId' | 'onlyFailed' | 'resume'>,
): RegistryItem[] {
  const ordered = [...items].sort((a, b) => {
    const statusRank =
      getSourceStatusRank(normalizeSourceStatus(a)) - getSourceStatusRank(normalizeSourceStatus(b));
    if (statusRank !== 0) {
      return statusRank;
    }
    return a.discoveredAt.localeCompare(b.discoveredAt);
  });

  if (options.sourceId) {
    return ordered.filter((item) => item.sourceListingId === options.sourceId);
  }

  if (options.onlyFailed) {
    return ordered.filter(
      (item) => normalizeSourceStatus(item) !== 'closed' && item.state === 'failed',
    );
  }

  return ordered.filter((item) => {
    const sourceStatus = normalizeSourceStatus(item);

    if (sourceStatus === 'closed') {
      return false;
    }

    if (sourceStatus === 'missing_candidate') {
      return true;
    }

    if (
      options.resume &&
      (item.state === 'created' || item.state === 'updated' || item.state === 'skipped')
    ) {
      return false;
    }

    return item.state === 'discovered' || item.state === 'pdp_parsed' || item.state === 'failed';
  });
}

export function selectRunReportItems(items: RegistryItem[], startedAt: string): RegistryItem[] {
  return items.filter((item) => item.updatedAt >= startedAt);
}

export function resolveClosedPdpErrorReason(error: unknown): SourceCloseReason | null {
  const message = String(error);

  if (/\bHTTP 404\b/i.test(message)) {
    return 'pdp_http_404';
  }

  if (/\bHTTP 410\b/i.test(message)) {
    return 'pdp_http_410';
  }

  return null;
}
