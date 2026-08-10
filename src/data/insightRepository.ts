import { insightRepository } from '../engine/insightRepository';

export const getCurrentInsight = insightRepository.getCurrent;
export const getInsightById = insightRepository.getById;
export const getArchive = insightRepository.getArchive;
