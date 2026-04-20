/*
  # AI Hub Database Schema and Seed Data

  Creates the app tables, enables public read access, and loads
  the default AI categories and tools used by the UI.
*/

create extension if not exists pgcrypto;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null,
  created_at timestamptz default now()
);

create table if not exists ai_tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  category_id uuid references categories(id) on delete cascade,
  website_url text not null,
  logo_url text,
  created_at timestamptz default now()
);

alter table categories enable row level security;
alter table ai_tools enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'categories'
      and policyname = 'Anyone can view categories'
  ) then
    create policy "Anyone can view categories"
      on categories for select
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'ai_tools'
      and policyname = 'Anyone can view AI tools'
  ) then
    create policy "Anyone can view AI tools"
      on ai_tools for select
      using (true);
  end if;
end $$;

with category_data (name, icon) as (
  values
    ('Chatbots & Assistants', 'Bot'),
    ('Text & Writing AI', 'PenSquare'),
    ('Image Generation & Design', 'Image'),
    ('Code Generation & Developer Tools', 'Code2'),
    ('Audio & Voice AI', 'Mic'),
    ('Video Generation & Editing', 'Video'),
    ('Productivity & Office AI', 'Briefcase'),
    ('Search & Research AI', 'Search'),
    ('Education & Learning AI', 'GraduationCap'),
    ('Utility AI Tools', 'Wrench'),
    ('AI Model Platforms', 'Boxes'),
    ('Business & Marketing AI', 'Megaphone')
)
insert into categories (name, icon)
select cd.name, cd.icon
from category_data cd
where not exists (
  select 1
  from categories c
  where c.name = cd.name
);

with tool_data (category_name, name, description, website_url, logo_url) as (
  values
    ('Chatbots & Assistants', 'Gemini', 'Google''s AI assistant for chat, research, and everyday tasks.', 'https://gemini.google.com', null),
    ('Chatbots & Assistants', 'ChatGPT', 'Conversational AI for writing, coding, research, and problem solving.', 'https://chatgpt.com', null),
    ('Chatbots & Assistants', 'Microsoft Copilot', 'Microsoft''s assistant across web, office, and productivity workflows.', 'https://copilot.microsoft.com', null),
    ('Chatbots & Assistants', 'Meta AI', 'Meta''s assistant for chat, search, and social experiences.', 'https://www.meta.ai', null),

    ('Text & Writing AI', 'ChatGPT', 'Writing and brainstorming assistant for articles, emails, and creative work.', 'https://chatgpt.com', null),
    ('Text & Writing AI', 'Claude AI', 'AI assistant focused on writing, analysis, and long-form reasoning.', 'https://claude.ai', null),
    ('Text & Writing AI', 'Jasper AI', 'Marketing-focused writing assistant for campaigns and brand content.', 'https://www.jasper.ai', null),
    ('Text & Writing AI', 'Copy.ai', 'AI copywriting tool for sales, marketing, and content teams.', 'https://www.copy.ai', null),
    ('Text & Writing AI', 'Writesonic', 'AI writing suite for blogs, ads, product copy, and landing pages.', 'https://writesonic.com', null),

    ('Image Generation & Design', 'DALL·E', 'Generates images from prompts for concept art and design exploration.', 'https://openai.com/dall-e', null),
    ('Image Generation & Design', 'Midjourney', 'Prompt-based image generation known for detailed artistic visuals.', 'https://www.midjourney.com', null),
    ('Image Generation & Design', 'Stable Diffusion', 'Open image generation model for creative and production workflows.', 'https://stability.ai/stable-diffusion', null),
    ('Image Generation & Design', 'Leonardo AI', 'AI image generation platform for assets, illustrations, and concepts.', 'https://leonardo.ai', null),
    ('Image Generation & Design', 'Canva AI', 'Design tools with AI generation, editing, and creative assistance.', 'https://www.canva.com/ai-image-generator/', null),

    ('Code Generation & Developer Tools', 'GitHub Copilot', 'Code completion and assistant features inside developer tools.', 'https://github.com/features/copilot', null),
    ('Code Generation & Developer Tools', 'Codeium', 'AI coding assistant for autocomplete, chat, and code generation.', 'https://codeium.com', null),
    ('Code Generation & Developer Tools', 'Replit Ghostwriter', 'Coding assistant for building and debugging inside Replit.', 'https://replit.com/ai', null),
    ('Code Generation & Developer Tools', 'Tabnine', 'AI code completion tool with team and enterprise workflows.', 'https://www.tabnine.com', null),
    ('Code Generation & Developer Tools', 'Amazon CodeWhisperer', 'AWS coding assistant for suggestions and secure development help.', 'https://aws.amazon.com/codewhisperer/', null),

    ('Audio & Voice AI', 'ElevenLabs', 'Voice generation platform for narration, dubbing, and speech cloning.', 'https://elevenlabs.io', null),
    ('Audio & Voice AI', 'Murf AI', 'AI voiceover platform for presentations, videos, and training content.', 'https://murf.ai', null),
    ('Audio & Voice AI', 'PlayHT', 'Text-to-speech and conversational voice generation platform.', 'https://play.ht', null),
    ('Audio & Voice AI', 'Resemble AI', 'Custom voice generation for apps, games, and media production.', 'https://www.resemble.ai', null),
    ('Audio & Voice AI', 'Descript', 'Audio and video editor with voice AI and transcription tools.', 'https://www.descript.com', null),

    ('Video Generation & Editing', 'Runway ML', 'AI video generation and editing tools for creators and teams.', 'https://runwayml.com', null),
    ('Video Generation & Editing', 'Pictory', 'Turns scripts and articles into short videos with AI assistance.', 'https://pictory.ai', null),
    ('Video Generation & Editing', 'Synthesia', 'Creates avatar-led videos for training, demos, and internal communication.', 'https://www.synthesia.io', null),
    ('Video Generation & Editing', 'Lumen5', 'Transforms blog posts and ideas into social and marketing videos.', 'https://lumen5.com', null),
    ('Video Generation & Editing', 'InVideo AI', 'AI video creation platform for ads, explainers, and social content.', 'https://invideo.io/ai/', null),

    ('Productivity & Office AI', 'Notion AI', 'Workspace assistant for notes, summaries, drafting, and organization.', 'https://www.notion.so/product/ai', null),
    ('Productivity & Office AI', 'Grammarly', 'Writing assistant for grammar, clarity, tone, and rewriting.', 'https://www.grammarly.com', null),
    ('Productivity & Office AI', 'Microsoft Copilot', 'Office and work assistant for documents, meetings, and email.', 'https://copilot.microsoft.com', null),
    ('Productivity & Office AI', 'ClickUp AI', 'Project and task management assistant built into ClickUp workflows.', 'https://clickup.com/ai', null),
    ('Productivity & Office AI', 'Zoho Zia', 'AI assistant across CRM, analytics, and business operations in Zoho.', 'https://www.zoho.com/zia/', null),

    ('Search & Research AI', 'Perplexity AI', 'Answer engine for research, browsing, and cited responses.', 'https://www.perplexity.ai', null),
    ('Search & Research AI', 'Elicit', 'Research assistant for literature review and evidence gathering.', 'https://elicit.com', null),
    ('Search & Research AI', 'Scite', 'Research tool that analyzes citations and supporting evidence.', 'https://scite.ai', null),
    ('Search & Research AI', 'Consensus', 'Searches scientific papers and summarizes research findings.', 'https://consensus.app', null),
    ('Search & Research AI', 'You.com', 'Search engine with AI answers, research, and productivity tools.', 'https://you.com', null),

    ('Education & Learning AI', 'Khanmigo', 'Learning assistant for guided practice and tutoring experiences.', 'https://www.khanacademy.org/khan-labs', null),
    ('Education & Learning AI', 'Quizlet AI', 'Study support for flashcards, quizzes, and adaptive learning.', 'https://quizlet.com', null),
    ('Education & Learning AI', 'Socratic', 'Homework helper for understanding questions across school subjects.', 'https://socratic.org', null),
    ('Education & Learning AI', 'Duolingo Max', 'Language learning with advanced AI explanations and roleplay.', 'https://www.duolingo.com', null),
    ('Education & Learning AI', 'Course Hero AI', 'Study assistant for explanations, notes, and academic support.', 'https://www.coursehero.com', null),

    ('Utility AI Tools', 'Remove.bg', 'Removes image backgrounds instantly for design and e-commerce.', 'https://www.remove.bg', null),
    ('Utility AI Tools', 'Upscale.media', 'Image upscaling tool for sharper and higher-resolution visuals.', 'https://www.upscale.media', null),
    ('Utility AI Tools', 'Cleanup.pictures', 'Object removal and image cleanup tool for quick edits.', 'https://cleanup.pictures', null),
    ('Utility AI Tools', 'Let''s Enhance', 'Image enhancement tool for quality, upscaling, and cleanup.', 'https://letsenhance.io', null),
    ('Utility AI Tools', 'Clipdrop', 'Creative utility suite for background removal, relighting, and image tools.', 'https://clipdrop.co', null),

    ('AI Model Platforms', 'Hugging Face', 'Platform for discovering, sharing, and deploying machine learning models.', 'https://huggingface.co', null),
    ('AI Model Platforms', 'Google Colab', 'Cloud notebooks for experimentation, prototyping, and model training.', 'https://colab.research.google.com', null),
    ('AI Model Platforms', 'Kaggle', 'Datasets, notebooks, and competitions for applied machine learning.', 'https://www.kaggle.com', null),
    ('AI Model Platforms', 'Replicate', 'Run and deploy models with hosted APIs and ready-made examples.', 'https://replicate.com', null),
    ('AI Model Platforms', 'Paperspace', 'Cloud infrastructure and notebooks for AI development workflows.', 'https://www.paperspace.com', null),

    ('Business & Marketing AI', 'HubSpot AI', 'Marketing and CRM AI tools for campaigns, content, and sales.', 'https://www.hubspot.com/artificial-intelligence', null),
    ('Business & Marketing AI', 'AdCreative AI', 'Ad generation platform for creatives, banners, and campaign assets.', 'https://www.adcreative.ai', null),
    ('Business & Marketing AI', 'Ocoya', 'AI content planning and social media marketing assistant.', 'https://www.ocoya.com', null),
    ('Business & Marketing AI', 'Surfer SEO', 'SEO workflow assistant for research, briefs, and optimization.', 'https://surferseo.com', null),
    ('Business & Marketing AI', 'Writesonic', 'AI writing and marketing content platform for teams and campaigns.', 'https://writesonic.com', null)
)
insert into ai_tools (name, description, category_id, website_url, logo_url)
select
  td.name,
  td.description,
  c.id,
  td.website_url,
  td.logo_url
from tool_data td
join categories c on c.name = td.category_name
where not exists (
  select 1
  from ai_tools t
  where t.name = td.name
    and t.category_id = c.id
);
