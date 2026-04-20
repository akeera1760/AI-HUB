import { useEffect, useMemo, useRef, useState } from 'react';
import { AITool, Category } from '../lib/supabase';
import {
  Bot,
  ExternalLink,
  MessageCircleMore,
  SendHorizontal,
  Sparkles,
  X,
} from 'lucide-react';

interface ChatbotWidgetProps {
  categories: Category[];
  tools: AITool[];
  selectedCategory: Category | null;
  isLoggedIn?: boolean;
  onLoginRequired?: () => void;
}

interface RecommendedTool {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  categoryName: string;
}

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  tools?: RecommendedTool[];
  quickReplies?: string[];
  suggestedNext?: string[];
}

interface ConversationContext {
  mentionedCategories: string[];
  mentionedTools: string[];
  askedAboutFeatures: Set<string>;
  lastToolRecommendations: string[];
}

const contactSummary =
  'You can reach the site owner at akeera1760@gmail.com. The footer also includes LinkedIn, Instagram, and Facebook links for quick contact.';

const starterPrompts = [
  'What is AI Hub?',
  'How do I use this website?',
  'Recommend tools for image generation',
  'Which tools are best for coding?',
];

// Response variations for more natural conversation
const responseVariations = {
  greeting: [
    'Hi! Ask me about the website, a category, or a use case like image generation, coding, research, video, or marketing.',
    'Hey there! I can help you find tools, explain categories, or answer questions about AI Hub.',
    'Welcome! Need help finding AI tools? Ask me about categories, specific tasks, or recommendations.',
  ],
  defaultHelp: [
    'I can help with site questions and tool discovery. Try asking for a category, a use case, or a recommendation like "recommend tools for image generation" or "show coding tools".',
    'Looking for something? I can recommend tools, explain categories, or guide you through the site.',
    'Tell me what you\'re looking to do, and I\'ll point you to the best tools and categories.',
  ],
  inCategory: [
    'I can recommend tools from this category, explain what the site does, or help you find a different category if you tell me the task you have in mind.',
    'Browsing this category? I can suggest the best tools here or help you explore other categories.',
    'Want recommendations from this category or thinking about something else? Just let me know!',
  ],
};

const stopWords = new Set([
  'a',
  'about',
  'an',
  'and',
  'are',
  'best',
  'can',
  'for',
  'from',
  'get',
  'give',
  'here',
  'how',
  'i',
  'in',
  'is',
  'it',
  'me',
  'need',
  'of',
  'on',
  'or',
  'please',
  'recommend',
  'show',
  'site',
  'suggest',
  'tell',
  'the',
  'this',
  'to',
  'tool',
  'tools',
  'website',
  'what',
  'which',
  'with',
]);

const categoryAliasMap: Record<string, string[]> = {
  'Chatbots & Assistants': ['chatbot', 'assistant', 'chat', 'conversation', 'qa'],
  'Text & Writing AI': ['writing', 'writer', 'content', 'copywriting', 'blog', 'email'],
  'Image Generation & Design': ['image', 'images', 'art', 'design', 'illustration', 'photo'],
  'Code Generation & Developer Tools': ['code', 'coding', 'developer', 'dev', 'programming'],
  'Audio & Voice AI': ['audio', 'voice', 'speech', 'tts', 'voiceover'],
  'Video Generation & Editing': ['video', 'editing', 'avatar', 'shorts', 'reels'],
  'Productivity & Office AI': ['productivity', 'office', 'documents', 'notes', 'meetings'],
  'Search & Research AI': ['research', 'search', 'papers', 'citations', 'study'],
  'Education & Learning AI': ['education', 'learning', 'student', 'tutoring', 'study'],
  'Utility AI Tools': ['utility', 'remove background', 'upscale', 'cleanup', 'enhance'],
  'AI Model Platforms': ['models', 'platform', 'notebooks', 'datasets', 'deploy'],
  'Business & Marketing AI': ['marketing', 'business', 'seo', 'campaigns', 'ads'],
};

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(' ')
    .filter((token) => token.length > 1 && !stopWords.has(token));
}

function joinLabels(labels: string[]) {
  if (labels.length === 0) return '';
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}

function getRandomVariation(variations: string[]): string {
  return variations[Math.floor(Math.random() * variations.length)];
}

function extractConversationContext(
  messages: ChatMessage[],
  categories: Category[],
  tools: AITool[]
): ConversationContext {
  const context: ConversationContext = {
    mentionedCategories: [],
    mentionedTools: [],
    askedAboutFeatures: new Set(),
    lastToolRecommendations: [],
  };

  for (const msg of messages) {
    const lowerContent = msg.content.toLowerCase();

    // Track mentioned categories
    for (const category of categories) {
      if (lowerContent.includes(category.name.toLowerCase())) {
        if (!context.mentionedCategories.includes(category.name)) {
          context.mentionedCategories.push(category.name);
        }
      }
    }

    // Track mentioned tools
    for (const tool of tools) {
      if (lowerContent.includes(tool.name.toLowerCase())) {
        if (!context.mentionedTools.includes(tool.name)) {
          context.mentionedTools.push(tool.name);
        }
      }
    }

    // Track features asked about
    if (/how.*use|navigate|find/i.test(lowerContent)) context.askedAboutFeatures.add('howto');
    if (/what.*website|about/i.test(lowerContent)) context.askedAboutFeatures.add('about');
    if (/categor|brows/i.test(lowerContent)) context.askedAboutFeatures.add('categories');
    if (/recommend|suggest|best/i.test(lowerContent)) context.askedAboutFeatures.add('recommend');

    // Track last recommendations shown
    if (msg.tools && msg.tools.length > 0) {
      context.lastToolRecommendations = msg.tools.map((t) => t.id);
    }
  }

  return context;
}

function generateNextQuestionSuggestions(
  context: ConversationContext,
  matchedCategories: Category[],
  lastMessage: ChatMessage
): string[] {
  const suggestions: string[] = [];

  // If we just showed tools, ask what they think
  if (lastMessage.tools && lastMessage.tools.length > 0) {
    suggestions.push('Tell me your preference');
    suggestions.push('Show different options');
  }

  // If we talked about categories, suggest drilling down
  if (context.askedAboutFeatures.has('categories')) {
    if (matchedCategories.length > 0) {
      suggestions.push(`Explore ${matchedCategories[0]?.name || 'this category'}`);
    }
  }

  // If they asked how to use, maybe they're ready to explore
  if (context.askedAboutFeatures.has('howto')) {
    suggestions.push('Show me some tools');
    suggestions.push('What category should I start with?');
  }

  // Always offer to do something different
  if (suggestions.length < 2) {
    suggestions.push('What else can you help with?');
  }

  return suggestions.slice(0, 3);
}

function buildWelcomeMessage(
  categories: Category[],
  tools: AITool[],
  selectedCategory: Category | null
): ChatMessage {
  const categoryMessage =
    selectedCategory !== null
      ? `You are currently browsing ${selectedCategory.name}. Ask me for recommendations in this category or across the whole site.`
      : `This site currently has ${categories.length} categories and ${tools.length} tools ready to explore.`;

  return {
    id: createId(),
    role: 'assistant',
    content:
      `Hi, I'm the AI Hub guide. I can explain the website, help you browse categories, and recommend tools from the catalog. ${categoryMessage}`,
    quickReplies: starterPrompts,
  };
}

export function ChatbotWidget({ categories, tools, selectedCategory, isLoggedIn = true, onLoginRequired }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    buildWelcomeMessage(categories, tools, selectedCategory),
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const catalog = useMemo(() => {
    const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

    return tools.map((tool) => ({
      ...tool,
      categoryName: categoryNameById.get(tool.category_id) ?? 'AI tools',
      normalizedName: normalizeText(tool.name),
      searchText: normalizeText(
        `${tool.name} ${tool.description} ${categoryNameById.get(tool.category_id) ?? ''}`
      ),
    }));
  }, [categories, tools]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    setMessages((current) => {
      if (current.length !== 1 || current[0].role !== 'assistant') {
        return current;
      }

      return [buildWelcomeMessage(categories, tools, selectedCategory)];
    });
  }, [categories, tools, selectedCategory]);

  function getMatchingCategories(query: string, queryTokens: string[]) {
    return categories
      .map((category) => {
        const normalizedName = normalizeText(category.name);
        const aliases = categoryAliasMap[category.name] ?? [];
        const keywords = new Set([
          ...tokenize(category.name),
          ...aliases.flatMap((alias) => tokenize(alias)),
        ]);

        let score = 0;

        if (query.includes(normalizedName)) {
          score += 8;
        }

        for (const alias of aliases) {
          if (query.includes(normalizeText(alias))) {
            score += 6;
          }
        }

        for (const token of queryTokens) {
          if (keywords.has(token)) {
            score += 2;
          }
        }

        if (
          selectedCategory &&
          category.id === selectedCategory.id &&
          /\b(this category|here|this page)\b/.test(query)
        ) {
          score += 7;
        }

        return { category, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score)
      .map((entry) => entry.category);
  }

  function getRecommendedTools(
    query: string,
    queryTokens: string[],
    context?: ConversationContext
  ) {
    const matchedCategories = getMatchingCategories(query, queryTokens);
    const primaryCategory = matchedCategories[0] ?? null;

    return catalog
      .map((tool) => {
        let score = 0;

        // Direct name match gets highest boost
        if (query.includes(tool.normalizedName)) {
          score += 10;
        }

        // Category match in primary category
        if (primaryCategory && tool.category_id === primaryCategory.id) {
          score += 7;
        }

        // Current category context
        if (
          selectedCategory &&
          tool.category_id === selectedCategory.id &&
          /\b(this category|here|this page)\b/.test(query)
        ) {
          score += 6;
        }

        // Token-based matching
        for (const token of queryTokens) {
          if (tool.searchText.includes(token)) {
            score += 1.5;
          }
        }

        // Avoid repeating recent recommendations (diversity)
        if (context && context.lastToolRecommendations.includes(tool.id)) {
          score *= 0.6;
        }

        // Boost tools not mentioned yet in conversation
        if (context && !context.mentionedTools.includes(tool.name)) {
          score += 0.5;
        }

        return { tool, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 3)
      .map(({ tool }) => ({
        id: tool.id,
        name: tool.name,
        description: tool.description,
        websiteUrl: tool.website_url,
        categoryName: tool.categoryName,
      }));
  }

  function buildAssistantReply(question: string, context: ConversationContext): ChatMessage {
    const query = normalizeText(question);
    const queryTokens = tokenize(question);
    const matchedCategories = getMatchingCategories(query, queryTokens);
    const recommendations = getRecommendedTools(query, queryTokens, context);

    // Enhanced intent detection
    const asksForCategories = /\b(categories|category|browse|all categories|what categories|show categories)\b/.test(query);
    const asksAboutSite =
      /\b(what is ai hub|what is this website|about this website|about the website|what can i do here|what does this do)\b/.test(
        query
      ) || (/\bwebsite\b/.test(query) && /\babout\b/.test(query));
    const asksHowToUse =
      /\b(how do i use|how to use|navigate|find tools|use this website|getting started|tutorial|guide)\b/.test(query);
    const asksForContact = /\b(contact|email|reach|linkedin|instagram|facebook|support)\b/.test(query);
    const asksForComparison = /\b(compare|versus|vs|difference|better|best|which one|difference between)\b/.test(
      query
    );
    const asksForRecommendation =
      /\b(recommend|suggest|best|top|good for|looking for|need|want|find me)\b/.test(query) ||
      matchedCategories.length > 0 ||
      /\btool\b/.test(query);
    const asksForMore = /\b(more|other|another|different|else|what else)\b/.test(query);

    // Greeting handling with variations
    if (/^(hi|hello|hey|greetings|good morning|good afternoon)\b/.test(query)) {
      const greeting = getRandomVariation(responseVariations.greeting);
      return {
        id: createId(),
        role: 'assistant',
        content: greeting,
        quickReplies: starterPrompts, // Keep quick replies only for welcome
      };
    }

    // Contact request
    if (asksForContact) {
      return {
        id: createId(),
        role: 'assistant',
        content: contactSummary,
      };
    }

    // About site question
    if (asksAboutSite) {
      const siteInfo = `AI Hub is a curated directory of ${tools.length} AI tools across ${categories.length} categories. You can browse categories, open any collection, compare short descriptions, and jump straight to each tool's official website.`;
      return {
        id: createId(),
        role: 'assistant',
        content: siteInfo,
      };
    }

    // How to use question
    if (asksHowToUse) {
      const currentCategoryNote = selectedCategory
        ? ` Since you're already browsing ${selectedCategory.name}, scan the tools here or ask me for specific recommendations.`
        : '';

      const howToUse = `Start from the category cards, open what interests you, compare tool options, and visit official websites from the cards.${currentCategoryNote} I can also help with specific tool recommendations!`;
      return {
        id: createId(),
        role: 'assistant',
        content: howToUse,
      };
    }

    // Show categories
    if (asksForCategories) {
      const topCategories = categories.slice(0, 6).map((category) => category.name);
      const categoryList = `AI Hub covers ${joinLabels(topCategories)}${
        categories.length > 6 ? ', and more' : ''
      }. Tell me what you need and I'll point you to the right category.`;

      return {
        id: createId(),
        role: 'assistant',
        content: categoryList,
      };
    }

    // Recommendation request with smart follow-ups
    if (asksForRecommendation && recommendations.length > 0) {
      const primaryCategory = matchedCategories[0];
      let lead = '';

      if (asksForMore && context.mentionedCategories.length > 0) {
        lead = `Here are more great options to explore:`;
      } else if (primaryCategory) {
        lead = `Perfect! Here are the best tools I found in ${primaryCategory.name}:`;
      } else {
        lead = `These are exactly what you're looking for:`;
      }

      const message: ChatMessage = {
        id: createId(),
        role: 'assistant',
        content: `${lead} Check them out and visit their websites to compare features.`,
        tools: recommendations,
      };

      // Add suggested next questions for tools
      message.suggestedNext = generateNextQuestionSuggestions(context, matchedCategories, message);
      return message;
    }

    // Comparison request
    if (asksForComparison) {
      const comparisonHelp = `I can show you specific tools so you can compare them side-by-side.${
        matchedCategories.length > 0
          ? ` Let's explore the best options in ${matchedCategories[0]?.name}!`
          : ' Tell me which category you want to explore.'
      }`;
      return {
        id: createId(),
        role: 'assistant',
        content: comparisonHelp,
      };
    }

    // In category
    if (selectedCategory) {
      const categoryMessage = getRandomVariation(responseVariations.inCategory);
      return {
        id: createId(),
        role: 'assistant',
        content: `You're in ${selectedCategory.name}. ${categoryMessage}`,
      };
    }

    // Default helpful response
    const defaultMessage = getRandomVariation(responseVariations.defaultHelp);
    return {
      id: createId(),
      role: 'assistant',
      content: defaultMessage,
    };
  }

  function submitQuestion(value?: string) {
    if (!isLoggedIn) {
      onLoginRequired?.();
      return;
    }

    const question = (value ?? draft).trim();

    if (!question) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      content: question,
    };

    setMessages((current) => {
      const updated = [...current, userMessage];
      const conversationContext = extractConversationContext(updated, categories, tools);
      const assistantReply = buildAssistantReply(question, conversationContext);
      return [...updated, assistantReply];
    });

    setDraft('');
    setIsOpen(true);
  }

  return (
    <div className="fixed right-4 top-24 z-50 md:right-6 md:top-28">
      {isOpen ? (
        <div className="w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-[28px] border border-violet-300/18 bg-[#120b22]/92 shadow-[0_24px_70px_rgba(7,4,16,0.55)] backdrop-blur-2xl">
          <div className="border-b border-violet-300/12 bg-gradient-to-r from-violet-500/18 via-fuchsia-500/14 to-indigo-500/16 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-indigo-500 text-white shadow-lg shadow-violet-950/30">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-200/70">
                    AI Hub Guide
                  </p>
                  <p className="mt-1 text-sm text-violet-100">
                    Ask about the website or get tool recommendations.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-violet-300/12 bg-white/5 p-2 text-violet-200 transition hover:border-violet-300/24 hover:bg-white/10"
                aria-label="Close chatbot"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[26rem] space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((message) => {
              const isAssistant = message.role === 'assistant';

              return (
                <div
                  key={message.id}
                  className={['flex', isAssistant ? 'justify-start' : 'justify-end'].join(' ')}
                >
                  <div
                    className={[
                      'max-w-[90%] rounded-3xl px-4 py-3 text-sm leading-7 shadow-sm',
                      isAssistant
                        ? 'border border-violet-300/10 bg-white/6 text-violet-100'
                        : 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 text-white',
                    ].join(' ')}
                  >
                    <p>{message.content}</p>

                    {message.tools && message.tools.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        {message.tools.map((tool) => (
                          <a
                            key={tool.id}
                            href={tool.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-[22px] border border-violet-300/10 bg-[#171028]/88 p-4 transition hover:-translate-y-0.5 hover:border-violet-300/24 hover:bg-[#1d1432]"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300/65">
                                  {tool.categoryName}
                                </p>
                                <h4 className="mt-2 text-base font-semibold text-violet-50">
                                  {tool.name}
                                </h4>
                              </div>
                              <ExternalLink className="mt-1 h-4 w-4 flex-shrink-0 text-violet-300/70" />
                            </div>
                            <p className="mt-2 text-sm leading-6 text-violet-200/78">
                              {tool.description}
                            </p>
                          </a>
                        ))}
                      </div>
                    ) : null}

                    {isAssistant && message.quickReplies && message.quickReplies.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {message.quickReplies.slice(0, 2).map((prompt) => (
                          <button
                            key={prompt}
                            type="button"
                            onClick={() => submitQuestion(prompt)}
                            className="rounded-full border border-violet-300/12 bg-white/5 px-2 py-1 text-xs font-medium text-violet-100 transition hover:border-violet-300/24 hover:bg-white/10"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-violet-300/10 px-4 py-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-violet-200/65">
              <Sparkles className="h-3.5 w-3.5 text-violet-300" />
              Type your question or question idea below
            </div>
            <div className="flex items-end gap-3">
              <textarea
                rows={1}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    submitQuestion();
                  }
                }}
                placeholder="Ask about tools, categories, or anything else..."
                className="max-h-28 min-h-[52px] flex-1 resize-none rounded-[22px] border border-violet-300/12 bg-white/5 px-4 py-3 text-sm text-violet-50 outline-none transition placeholder:text-violet-300/40 focus:border-violet-300/28 focus:ring-4 focus:ring-violet-500/10"
              />
              <button
                type="button"
                onClick={() => submitQuestion()}
                className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 text-white shadow-lg shadow-violet-950/35 transition hover:-translate-y-0.5 hover:brightness-110"
                aria-label="Send message"
              >
                <SendHorizontal className="h-4 w-4" />
              </button>
            </div>
            {messages.length > 0 && messages[messages.length - 1]?.suggestedNext && messages[messages.length - 1].suggestedNext!.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-xs text-violet-300/60">Next:</span>
                {messages[messages.length - 1].suggestedNext!.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => submitQuestion(suggestion)}
                    className="rounded-full border border-violet-300/12 bg-white/3 px-2 py-1 text-xs text-violet-200/70 transition hover:border-violet-300/24 hover:bg-white/8"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-end gap-3">
          <div className="hidden rounded-full border border-violet-300/12 bg-[#120b22]/88 px-4 py-2 text-sm font-medium text-violet-100 shadow-lg shadow-violet-950/30 backdrop-blur-xl sm:flex">
            Ask AI Hub
          </div>
          <button
            type="button"
            onClick={() => {
              if (!isLoggedIn) {
                onLoginRequired?.();
                return;
              }
              setIsOpen(true);
            }}
            className="group flex h-16 w-16 items-center justify-center rounded-[22px] border border-violet-300/18 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-indigo-500 text-white shadow-[0_18px_44px_rgba(73,36,154,0.42)] transition hover:-translate-y-1 hover:shadow-[0_22px_54px_rgba(73,36,154,0.48)]"
            aria-label="Open chatbot"
          >
            <MessageCircleMore className="h-6 w-6 transition group-hover:scale-105" />
          </button>
        </div>
      )}
    </div>
  );
}
