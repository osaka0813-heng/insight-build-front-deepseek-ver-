import { insightRepository } from '../engine/insightRepository';

export const today = insightRepository.getCurrent('en');
