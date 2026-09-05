import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Story, StoryDocument } from "./stories.schema";
import { StoryMessage, StoryMessageDocument } from "./story-message.schema";
import { TopicsService } from "src/topics/topics.service";
import { WordsService } from "src/words/words.service";
import { AiSuggestionsService } from "src/ai-suggestions/ai-suggestions.service";

const img = (seed: string) => `https://picsum.photos/seed/${seed}/200/200`;

@Injectable()
export class StoriesService {
    constructor(
        @InjectModel(Story.name) private storyModel: Model<Story>,
        @InjectModel(StoryMessage.name) private storyMessageModel: Model<StoryMessage>,
        private topicsService: TopicsService,
        private wordsService: WordsService,
        private aiSuggestionsService: AiSuggestionsService,
    ) {}

    /** Creates a new story scenario for a given topic, using the topic's actual learned/available words. */
    async startStory(userId: Types.ObjectId, topicId: Types.ObjectId): Promise<StoryDocument> {
        const topic = await this.topicsService.findOne(topicId);
        if (!topic) throw new NotFoundException('Topic not found');

        // Fetch the topic's words
        const wordsDocs = await this.wordsService.findAll({ topic: topicId });
        const words = (wordsDocs ?? [])
            .filter((w): w is NonNullable<typeof w> => Boolean(w))
            .map(w => ({
                word: w.word,
                meaning: w.meaning || '',
                example: w.example || '',
            }));

        // Scaffolding via LLM
        const scaffold = await this.aiSuggestionsService.generateStoryScaffold(
            topic.name,
            words.length > 0 ? words : [{ word: topic.name, meaning: 'Subject matter', example: '' }]
        );

        // Build cast with avatar images
        const cast = [
            {
                id: 'me',
                name: scaffold.userRole?.name || 'You',
                role: scaffold.userRole?.role || 'Protagonist',
                description: scaffold.userRole?.description || 'Main character',
                avatar: img('user-mc'),
                isUser: true,
            },
            ...scaffold.cast.map(c => ({
                id: c.id || c.name.toLowerCase().replace(/\s+/g, '_'),
                name: c.name,
                role: c.role,
                description: c.description,
                avatar: img(c.name.toLowerCase().replace(/\s+/g, '-')),
                isUser: false,
            })),
        ];

        // Format target words
        const targetWords = (scaffold.targetWords ?? []).map(tw => ({
            word: tw.word,
            meaning: tw.meaning || '',
            example: tw.example || '',
            semanticField: Array.isArray(tw.semanticField) ? tw.semanticField : [],
            biasStage: 0,
            hit: false,
        }));

        const story = await this.storyModel.create({
            creator: userId,
            topic: topicId,
            title: scaffold.title || `Story in ${topic.name}`,
            setting: scaffold.setting || '',
            plotSetup: scaffold.plotSetup || '',
            cast,
            targetWords,
            currentWordIndex: 0,
            status: 'in_progress',
        });

        // Insert opening DM Narration
        if (scaffold.openingNarration) {
            await this.storyMessageModel.create({
                story: story._id,
                senderId: 'narrator',
                senderName: 'Narrator',
                text: scaffold.openingNarration,
                kind: 'narration',
            });
        }

        // Insert opening Actor spoken line
        if (scaffold.openingActorLine) {
            const openingActor = cast.find(c => c.id === scaffold.openingActorId) || cast.find(c => !c.isUser) || cast[1];
            await this.storyMessageModel.create({
                story: story._id,
                senderId: openingActor?.id || 'actor_1',
                senderName: openingActor?.name || 'Companion',
                text: scaffold.openingActorLine,
                kind: 'actor',
            });
        }

        return story;
    }

    /** Finds all stories created for a given topic by user. */
    async findByTopic(userId: Types.ObjectId, topicId: Types.ObjectId) {
        return this.storyModel
            .find({ creator: userId, topic: topicId })
            .sort({ createdAt: -1 })
            .exec();
    }

    /** Finds a single story by ID. */
    async findOne(userId: Types.ObjectId, storyId: Types.ObjectId): Promise<StoryDocument> {
        const story = await this.storyModel.findOne({ _id: storyId, creator: userId }).exec();
        if (!story) throw new NotFoundException('Story not found');
        return story;
    }

    /** Gets all messages for a story. */
    async getMessages(userId: Types.ObjectId, storyId: Types.ObjectId): Promise<StoryMessageDocument[]> {
        await this.findOne(userId, storyId); // ensure ownership
        return this.storyMessageModel.find({ story: storyId }).sort({ createdAt: 1 }).exec();
    }

    /** Handles a user turn in the story, evaluates hit, and triggers DM/actor reply. */
    async sendUserMessage(userId: Types.ObjectId, storyId: Types.ObjectId, text: string) {
        const story = await this.findOne(userId, storyId);

        // 1. Save user message
        const userMsg = await this.storyMessageModel.create({
            story: story._id,
            senderId: 'me',
            senderName: 'You',
            text,
            kind: 'user',
        });

        // 2. Fetch recent message history
        const recentMessages = await this.storyMessageModel
            .find({ story: story._id })
            .sort({ createdAt: 1 })
            .limit(20)
            .exec();

        const history = recentMessages.map(m => ({
            role: m.kind,
            senderName: m.senderName,
            text: m.text,
        }));

        // 3. Determine current target word & current bias word
        const currentTarget = story.targetWords[story.currentWordIndex] || {
            word: '',
            meaning: '',
            example: '',
            semanticField: [],
            biasStage: 0,
            hit: false,
        };

        const biasWord =
            currentTarget.semanticField && currentTarget.semanticField.length > 0
                ? currentTarget.semanticField[Math.min(currentTarget.biasStage, currentTarget.semanticField.length - 1)]
                : currentTarget.word;

        // 4. LLM evaluation & response generation
        const turnResult = await this.aiSuggestionsService.evaluateStoryTurn({
            story: {
                title: story.title,
                setting: story.setting,
                plotSetup: story.plotSetup,
                cast: story.cast,
            },
            currentWord: currentTarget,
            biasWord,
            history,
            userText: text,
        });

        const createdMessages: StoryMessageDocument[] = [userMsg];

        // 5. Update story state if HIT
        if (turnResult.hit) {
            story.targetWords[story.currentWordIndex].hit = true;
            if (story.currentWordIndex + 1 < story.targetWords.length) {
                story.currentWordIndex += 1;
            } else {
                story.status = 'completed';
            }
            story.markModified('targetWords');
            await story.save();
        } else {
            // Advance bias stage for the current word if not hit
            story.targetWords[story.currentWordIndex].biasStage += 1;
            story.markModified('targetWords');
            await story.save();
        }

        // 6. Save DM Narration if generated
        if (turnResult.dmNarration) {
            const dmMsg = await this.storyMessageModel.create({
                story: story._id,
                senderId: 'narrator',
                senderName: 'Narrator',
                text: turnResult.dmNarration,
                kind: 'narration',
            });
            createdMessages.push(dmMsg);
        }

        // 7. Save Actor Spoken Line
        if (turnResult.actorLine) {
            const actor = story.cast.find(c => c.id === turnResult.actorId) ||
                story.cast.find(c => c.name.toLowerCase() === (turnResult.actorName || '').toLowerCase()) ||
                story.cast.find(c => !c.isUser) ||
                { id: 'actor', name: turnResult.actorName || 'Companion' };

            const actorMsg = await this.storyMessageModel.create({
                story: story._id,
                senderId: actor.id,
                senderName: actor.name,
                text: turnResult.actorLine,
                kind: 'actor',
            });
            createdMessages.push(actorMsg);
        }

        return {
            hit: turnResult.hit,
            feedback: turnResult.feedback,
            messages: createdMessages,
            story,
        };
    }
}
