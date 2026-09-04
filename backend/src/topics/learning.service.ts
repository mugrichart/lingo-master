import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Learning, Topic } from "./topics.schema";
import { Model, Types } from "mongoose";
import { ScoreLearningAttemptDto } from "./learning.dto";
import { AiSuggestionsService } from "src/ai-suggestions/ai-suggestions.service";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";

@Injectable()
export class TopicLearningPlanService {
    constructor(
        @InjectModel(Learning.name) private learningModel: Model<Learning>,
        @InjectModel(Topic.name) private topicModel: Model<Topic>,
        private aiSuggestionsService: AiSuggestionsService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    async findAll(user?: Types.ObjectId, topic?: Types.ObjectId) {
        const query = {}
        if (topic) query['topic'] = topic
        if (user) query['user'] = user
        return this.learningModel.find(query).exec()
    }

    async findOne(id: Types.ObjectId) {
        return this.learningModel.findById(id)
    }

    async findMastery(user: Types.ObjectId, topic: Types.ObjectId) {
        return this.learningModel.findOne({ user, topic }).exec()
    }

    async scoreAttempt(userId: Types.ObjectId, dto: ScoreLearningAttemptDto) {
        const result = await this.aiSuggestionsService.scoreMastery(dto.records)
        if (dto.persistMastery) {
            await this.learningModel.findOneAndUpdate(
                { user: userId, topic: dto.topic },
                { $set: { topicLevel: result.overallScore } },
                { upsert: true, new: true }
            ).exec()
            // aggregated mastery values depending on this topic are now stale
            await this.invalidateMasteryCache(userId, dto.topic)
        }
        return result
    }

    /**
     * Recursive, cached mastery for a topic: average of the topic's own recorded
     * mastery (only when it has words) and the aggregated mastery of each subtopic.
     * null means "nothing testable/tested anywhere in this branch".
     */
    async getAggregatedMastery(userId: Types.ObjectId, topicId: Types.ObjectId): Promise<number | null> {
        const cacheKey = this.masteryCacheKey(userId, topicId)
        const cached = await this.cacheManager.get<number | null>(cacheKey)
        if (cached !== undefined) return cached
        const mastery = await this.computeAggregatedMastery(userId, topicId)
        await this.cacheManager.set(cacheKey, mastery, 600000) // 10 minutes
        return mastery
    }

    private async computeAggregatedMastery(userId: Types.ObjectId, topicId: Types.ObjectId): Promise<number | null> {
        const topic = await this.topicModel.findById(topicId).exec()
        if (!topic) return null

        const ownLearning = await this.learningModel.findOne({ user: userId, topic: topicId }).exec()
        const ownScore = (topic.words?.length ?? 0) > 0 ? (ownLearning?.topicLevel ?? null) : null

        const subtopics = await this.topicModel.find({ parent: topicId }).exec()
        const subScores = await Promise.all(
            subtopics.map(s => this.getAggregatedMastery(userId, s._id as Types.ObjectId))
        )

        const parts: number[] = []
        if (ownScore !== null) parts.push(ownScore)
        for (const score of subScores) if (score !== null) parts.push(score)
        if (!parts.length) return null
        return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length)
    }

    /** Drops cached mastery for the topic and every ancestor (their aggregates include this topic). */
    async invalidateMasteryCache(userId: Types.ObjectId, topicId: Types.ObjectId | null | undefined): Promise<void> {
        let current = topicId ?? null
        while (current) {
            await this.cacheManager.del(this.masteryCacheKey(userId, current))
            const topic = await this.topicModel.findById(current).exec()
            current = (topic?.parent ?? null) as Types.ObjectId | null
        }
    }

    private masteryCacheKey(userId: Types.ObjectId, topicId: Types.ObjectId) {
        return `mastery:user=${userId}:topic=${topicId}`
    }

}