/*
  # Repair Missing Category Tools

  Fixes older seeded projects where legacy category rows like
  `Coding` or `Image Generation` still exist alongside the newer
  category names. This migration:

  1. Ensures the canonical categories exist
  2. Moves any tools from legacy categories into the canonical ones
  3. Backfills missing tools
  4. Deletes the legacy category rows so the UI stops showing them
*/

insert into categories (name, icon)
select v.name, v.icon
from (
  values
    ('Code Generation & Developer Tools', 'Code2'),
    ('Image Generation & Design', 'Image')
) as v(name, icon)
where not exists (
  select 1
  from categories c
  where c.name = v.name
);

update categories
set icon = 'Code2'
where name = 'Code Generation & Developer Tools';

update categories
set icon = 'Image'
where name = 'Image Generation & Design';

do $$
declare
  legacy_id uuid;
  canonical_id uuid;
begin
  select id into canonical_id
  from categories
  where name = 'Code Generation & Developer Tools'
  limit 1;

  for legacy_id in
    select id
    from categories
    where name = 'Coding'
  loop
    update ai_tools
    set category_id = canonical_id
    where category_id = legacy_id;

    delete from categories
    where id = legacy_id;
  end loop;
end $$;

do $$
declare
  legacy_id uuid;
  canonical_id uuid;
begin
  select id into canonical_id
  from categories
  where name = 'Image Generation & Design'
  limit 1;

  for legacy_id in
    select id
    from categories
    where name = 'Image Generation'
  loop
    update ai_tools
    set category_id = canonical_id
    where category_id = legacy_id;

    delete from categories
    where id = legacy_id;
  end loop;
end $$;

with repair_tools (category_name, name, description, website_url, logo_url) as (
  values
    ('Code Generation & Developer Tools', 'GitHub Copilot', 'Code completion and assistant features inside developer tools.', 'https://github.com/features/copilot', null),
    ('Code Generation & Developer Tools', 'Codeium', 'AI coding assistant for autocomplete, chat, and code generation.', 'https://codeium.com', null),
    ('Code Generation & Developer Tools', 'Replit Ghostwriter', 'Coding assistant for building and debugging inside Replit.', 'https://replit.com/ai', null),
    ('Code Generation & Developer Tools', 'Tabnine', 'AI code completion tool with team and enterprise workflows.', 'https://www.tabnine.com', null),
    ('Code Generation & Developer Tools', 'Amazon CodeWhisperer', 'AWS coding assistant for suggestions and secure development help.', 'https://aws.amazon.com/codewhisperer/', null),

    ('Image Generation & Design', 'DALL·E', 'Generates images from prompts for concept art and design exploration.', 'https://openai.com/dall-e', null),
    ('Image Generation & Design', 'Midjourney', 'Prompt-based image generation known for detailed artistic visuals.', 'https://www.midjourney.com', null),
    ('Image Generation & Design', 'Stable Diffusion', 'Open image generation model for creative and production workflows.', 'https://stability.ai/stable-diffusion', null),
    ('Image Generation & Design', 'Leonardo AI', 'AI image generation platform for assets, illustrations, and concepts.', 'https://leonardo.ai', null),
    ('Image Generation & Design', 'Canva AI', 'Design tools with AI generation, editing, and creative assistance.', 'https://www.canva.com/ai-image-generator/', null)
)
insert into ai_tools (name, description, category_id, website_url, logo_url)
select
  rt.name,
  rt.description,
  c.id,
  rt.website_url,
  rt.logo_url
from repair_tools rt
join categories c on c.name = rt.category_name
where not exists (
  select 1
  from ai_tools t
  where t.name = rt.name
    and t.category_id = c.id
);
