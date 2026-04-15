import {
  buildActivePlpSnapshot,
  finalizeRegistryAfterPlpScan,
  selectImportCandidates,
  selectRunReportItems,
} from './registry-lifecycle';
import type { RegistryItem } from '../types';

function makeItem(
  partial: Partial<RegistryItem> & Pick<RegistryItem, 'sourceListingId'>,
): RegistryItem {
  const { sourceListingId, ...rest } = partial;

  return {
    source: 'cipauto',
    sourceListingId,
    url: rest.url ?? `https://cipauto.md/vehicul/${sourceListingId}-test/`,
    canonicalUrl: rest.canonicalUrl ?? `https://cipauto.md/vehicul/${sourceListingId}-test/`,
    state: rest.state ?? 'discovered',
    discoveredAt: rest.discoveredAt ?? '2026-04-15T10:00:00.000Z',
    updatedAt: rest.updatedAt ?? '2026-04-15T10:00:00.000Z',
    ...rest,
  };
}

describe('registry lifecycle helpers', () => {
  it('marks unseen items as missing candidates only on close-valid scans', () => {
    const items: RegistryItem[] = [
      makeItem({
        sourceListingId: 'seen-active',
        sourceStatus: 'active',
      }),
      makeItem({
        sourceListingId: 'missing-with-listing',
        sourceStatus: 'active',
        kupitoListingId: 'kupito-1',
      }),
      makeItem({
        sourceListingId: 'already-closed',
        sourceStatus: 'closed',
        state: 'closed',
      }),
    ];

    const result = finalizeRegistryAfterPlpScan({
      items,
      seenSourceIds: new Set(['seen-active']),
      closeValid: true,
      now: '2026-04-15T12:00:00.000Z',
    });

    expect(result.closeValid).toBe(true);
    expect(result.missingCandidates).toBe(1);
    expect(result.closeEstimate).toBe(1);
    expect(result.activeItems).toBe(1);
    expect(result.closedItems).toBe(1);

    const missingItem = result.items.find(
      (item) => item.sourceListingId === 'missing-with-listing',
    );
    expect(missingItem?.sourceStatus).toBe('missing_candidate');
    expect(missingItem?.missingSince).toBe('2026-04-15T12:00:00.000Z');
    expect(missingItem?.missingCount).toBe(1);
    expect(missingItem?.closeReason).toBe('plp_missing_candidate');
  });

  it('prioritizes missing candidates for import and excludes closed items', () => {
    const candidates = selectImportCandidates(
      [
        makeItem({
          sourceListingId: 'created-active',
          sourceStatus: 'active',
          state: 'created',
          discoveredAt: '2026-04-15T10:00:00.000Z',
        }),
        makeItem({
          sourceListingId: 'missing-updated',
          sourceStatus: 'missing_candidate',
          state: 'updated',
          discoveredAt: '2026-04-15T09:00:00.000Z',
        }),
        makeItem({
          sourceListingId: 'fresh-discovered',
          sourceStatus: 'active',
          state: 'discovered',
          discoveredAt: '2026-04-15T11:00:00.000Z',
        }),
        makeItem({
          sourceListingId: 'closed-item',
          sourceStatus: 'closed',
          state: 'closed',
          discoveredAt: '2026-04-15T08:00:00.000Z',
        }),
      ],
      {
        resume: true,
      },
    );

    expect(candidates.map((item) => item.sourceListingId)).toEqual([
      'missing-updated',
      'fresh-discovered',
    ]);
  });

  it('builds active snapshot and report items from the latest updates', () => {
    const items = [
      makeItem({
        sourceListingId: 'active-item',
        sourceStatus: 'active',
        updatedAt: '2026-04-15T12:05:00.000Z',
      }),
      makeItem({
        sourceListingId: 'missing-item',
        sourceStatus: 'missing_candidate',
        updatedAt: '2026-04-15T12:10:00.000Z',
      }),
      makeItem({
        sourceListingId: 'closed-item',
        sourceStatus: 'closed',
        state: 'closed',
        updatedAt: '2026-04-15T12:15:00.000Z',
      }),
    ];

    const snapshot = buildActivePlpSnapshot(items);
    const reportItems = selectRunReportItems(items, '2026-04-15T12:07:00.000Z');

    expect(Object.keys(snapshot.items)).toEqual(['active-item']);
    expect(snapshot.meta.activeItemsCount).toBe(1);
    expect(snapshot.meta.missingCandidatesCount).toBe(1);
    expect(snapshot.meta.closedItemsCount).toBe(1);
    expect(reportItems.map((item) => item.sourceListingId)).toEqual([
      'missing-item',
      'closed-item',
    ]);
  });
});
