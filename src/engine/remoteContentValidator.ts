import { REMOTE_CONTENT_SCHEMA_VERSION, type RemoteContentBundle } from '../types/remoteContent';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasUniqueIds(items: unknown[]): boolean {
  const ids = items.map((item) => (isObject(item) ? item.id : undefined));
  return ids.every(isNonEmptyString) && new Set(ids).size === ids.length;
}

export function validateRemoteContentBundle(value: unknown): RemoteContentBundle {
  if (!isObject(value)) throw new Error('Remote payload must be a JSON object.');
  if (value.schemaVersion !== REMOTE_CONTENT_SCHEMA_VERSION) {
    throw new Error(`Unsupported schemaVersion: ${String(value.schemaVersion)}.`);
  }
  if (!isNonEmptyString(value.generatedAt) || Number.isNaN(Date.parse(value.generatedAt))) {
    throw new Error('generatedAt must be a valid ISO date.');
  }
  if (!isNonEmptyString(value.contentVersion)) {
    throw new Error('contentVersion is required.');
  }

  const insights = value.insights;
  const worldProcesses = value.worldProcesses;
  const dailyStates = value.dailyStates;
  const dailyCandidates = value.dailyCandidates;
  const researchDrafts = value.researchDrafts;
  const writerDrafts = value.writerDrafts;

  const collections: Array<[string, unknown]> = [
    ['insights', insights],
    ['worldProcesses', worldProcesses],
    ['dailyStates', dailyStates],
    ['dailyCandidates', dailyCandidates],
  ];

  for (const [key, collection] of collections) {
    if (!Array.isArray(collection) || collection.length === 0) {
      throw new Error(`${key} must be a non-empty array.`);
    }
    if (!hasUniqueIds(collection)) {
      throw new Error(`${key} must contain unique, non-empty ids.`);
    }
  }


  if (researchDrafts !== undefined) {
    if (!Array.isArray(researchDrafts) || !hasUniqueIds(researchDrafts)) {
      throw new Error('researchDrafts must be an array with unique, non-empty ids.');
    }
    for (const raw of researchDrafts) {
      if (!isObject(raw) || !isNonEmptyString(raw.researchedAt) || !Array.isArray(raw.candidates)) {
        throw new Error('Every researchDraft needs researchedAt and candidates.');
      }
    }
  }

  if (writerDrafts !== undefined) {
    if (!Array.isArray(writerDrafts)) {
      throw new Error('writerDrafts must be an array when present.');
    }

    // Editorial history is useful, but it must never block the published reader.
    // Repair known legacy aliases and discard only malformed history records.
    const repairedWriterDrafts = writerDrafts
      .filter(isObject)
      .map((raw) => {
        const writtenAt =
          isNonEmptyString(raw.writtenAt)
            ? raw.writtenAt
            : isNonEmptyString(raw.writerAt)
              ? raw.writerAt
              : undefined;

        const dailyStateDraft =
          isObject(raw.dailyStateDraft)
            ? raw.dailyStateDraft
            : isObject(raw.dailyState)
              ? raw.dailyState
              : undefined;

        return {
          ...raw,
          ...(writtenAt ? { writtenAt } : {}),
          ...(dailyStateDraft ? { dailyStateDraft } : {}),
        };
      })
      .filter(
        (raw) =>
          isNonEmptyString(raw.id) &&
          isNonEmptyString(raw.writtenAt) &&
          isObject(raw.insight) &&
          isObject(raw.dailyStateDraft),
      );

    const uniqueWriterDrafts = repairedWriterDrafts.filter(
      (draft, index, all) =>
        all.findIndex((candidate) => candidate.id === draft.id) === index,
    );

    value.writerDrafts = uniqueWriterDrafts;
  }

  if (!Array.isArray(insights) || !Array.isArray(worldProcesses) || !Array.isArray(dailyStates)) {
    throw new Error('Remote collections are invalid.');
  }

  // Build012.1: upgrade World Process V1 records in memory without breaking
  // older remote-content files.
  value.worldProcesses = worldProcesses.map((raw) => {
    if (!isObject(raw)) return raw;

    const insightIds = Array.isArray(raw.insightIds)
      ? raw.insightIds.filter(isNonEmptyString)
      : [];
    const evolution = Array.isArray(raw.evolution) ? raw.evolution : [];
    const latestEvent =
      evolution.length > 0 && isObject(evolution[evolution.length - 1])
        ? evolution[evolution.length - 1]
        : undefined;

    return {
      ...raw,
      currentStage:
        isNonEmptyString(raw.currentStage)
          ? raw.currentStage
          : isObject(latestEvent) && isNonEmptyString(latestEvent.stage)
            ? latestEvent.stage
            : raw.status,
      stageChangedAt:
        isNonEmptyString(raw.stageChangedAt)
          ? raw.stageChangedAt
          : isObject(latestEvent) && isNonEmptyString(latestEvent.date)
            ? latestEvent.date
            : raw.updatedAt,
      supportingInsightIds: Array.isArray(raw.supportingInsightIds)
        ? raw.supportingInsightIds.filter(isNonEmptyString)
        : insightIds,
      contradictingInsightIds: Array.isArray(raw.contradictingInsightIds)
        ? raw.contradictingInsightIds.filter(isNonEmptyString)
        : [],
      keyActors: Array.isArray(raw.keyActors) ? raw.keyActors : [],
      domains: Array.isArray(raw.domains)
        ? raw.domains.filter(isNonEmptyString)
        : isObject(raw.content) &&
            isObject(raw.content.en) &&
            Array.isArray(raw.content.en.domains)
          ? raw.content.en.domains.filter(isNonEmptyString)
          : [],
      nextSignals: Array.isArray(raw.nextSignals)
        ? raw.nextSignals.filter(isNonEmptyString)
        : isObject(raw.content) &&
            isObject(raw.content.en) &&
            Array.isArray(raw.content.en.observeNext)
          ? raw.content.en.observeNext.filter(isNonEmptyString)
          : [],
    };
  });


  // Build012.2: repair Insight ↔ World Process links in both directions.
  const processMap = new Map(
    value.worldProcesses
      .filter(isObject)
      .map((process) => [process.id, process]),
  );

  value.insights = insights.map((insight) => {
    if (!isObject(insight)) return insight;

    let processId = isNonEmptyString(insight.processId)
      ? insight.processId
      : undefined;

    if (!processId) {
      const matched = value.worldProcesses.find((process) => {
        if (!isObject(process)) return false;
        const linkedIds = [
          ...(Array.isArray(process.insightIds) ? process.insightIds : []),
          ...(Array.isArray(process.supportingInsightIds)
            ? process.supportingInsightIds
            : []),
          ...(Array.isArray(process.contradictingInsightIds)
            ? process.contradictingInsightIds
            : []),
          ...(Array.isArray(process.evolution)
            ? process.evolution
                .filter(isObject)
                .map((event) => event.insightId)
            : []),
        ];
        return linkedIds.includes(insight.id);
      });
      processId =
        isObject(matched) && isNonEmptyString(matched.id)
          ? matched.id
          : undefined;
    }

    if (processId && processMap.has(processId)) {
      const process = processMap.get(processId);
      process.insightIds = Array.from(
        new Set([
          ...(Array.isArray(process.insightIds) ? process.insightIds : []),
          insight.id,
        ]),
      );
      if (
        !(
          Array.isArray(process.contradictingInsightIds) &&
          process.contradictingInsightIds.includes(insight.id)
        )
      ) {
        process.supportingInsightIds = Array.from(
          new Set([
            ...(Array.isArray(process.supportingInsightIds)
              ? process.supportingInsightIds
              : []),
            insight.id,
          ]),
        );
      }
    }

    return processId ? { ...insight, processId } : insight;
  });

  const insightIds = new Set(
    insights.map((item) => (isObject(item) && isNonEmptyString(item.id) ? item.id : '')),
  );
  const processIds = new Set(
    worldProcesses.map((item) => (isObject(item) && isNonEmptyString(item.id) ? item.id : '')),
  );

  for (const raw of dailyStates) {
    if (!isObject(raw) || !isNonEmptyString(raw.date) || !isNonEmptyString(raw.decidedAt)) {
      throw new Error('Every dailyState needs date and decidedAt.');
    }
    if (raw.insightId && (!isNonEmptyString(raw.insightId) || !insightIds.has(raw.insightId))) {
      throw new Error(`dailyState references missing insight: ${String(raw.insightId)}.`);
    }
    if (raw.processId && (!isNonEmptyString(raw.processId) || !processIds.has(raw.processId))) {
      throw new Error(`dailyState references missing process: ${String(raw.processId)}.`);
    }
  }

  return value as unknown as RemoteContentBundle;
}
