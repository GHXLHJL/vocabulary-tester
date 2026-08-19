begin;

create table if not exists public.ai_judge_cache (
    cache_key text primary key,
    word_key text not null,
    normalized_user_answer text not null,
    answer_basis text not null,
    verdict text not null,
    confidence double precision not null default 0,
    scope text not null default 'per_word',
    reason text null,
    provider text null,
    model_name text null,
    hit_count integer not null default 1,
    first_cached_at timestamptz not null default now(),
    last_cached_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.ai_judge_cache enable row level security;

revoke all on table public.ai_judge_cache from anon, authenticated;

create or replace function public.bump_ai_judge_cache_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    new.last_cached_at = coalesce(new.last_cached_at, now());
    return new;
end;
$$;

drop trigger if exists trg_ai_judge_cache_updated_at on public.ai_judge_cache;
create trigger trg_ai_judge_cache_updated_at
before update on public.ai_judge_cache
for each row
execute function public.bump_ai_judge_cache_updated_at();

create or replace function public.get_ai_judge_cache_v1(
    p_cache_key text
)
returns table (
    cache_key text,
    verdict text,
    confidence double precision,
    scope text,
    reason text,
    provider text,
    model_name text,
    updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
    if coalesce(length(trim(p_cache_key)), 0) = 0
       or length(coalesce(p_cache_key, '')) > 500 then
        return;
    end if;

    return query
    select
        c.cache_key,
        c.verdict,
        c.confidence,
        c.scope,
        c.reason,
        c.provider,
        c.model_name,
        c.updated_at
    from public.ai_judge_cache c
    where c.cache_key = p_cache_key
    limit 1;
end;
$$;

create or replace function public.upsert_ai_judge_cache_v1(
    p_cache_key text,
    p_word_key text,
    p_normalized_user_answer text,
    p_answer_basis text,
    p_verdict text,
    p_confidence double precision,
    p_scope text default 'per_word',
    p_reason text default null,
    p_provider text default null,
    p_model_name text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if coalesce(length(trim(p_cache_key)), 0) = 0
       or coalesce(length(trim(p_word_key)), 0) = 0
       or coalesce(length(trim(p_normalized_user_answer)), 0) = 0
       or length(coalesce(p_cache_key, '')) > 500
       or length(coalesce(p_word_key, '')) > 120
       or length(coalesce(p_normalized_user_answer, '')) > 120
       or length(coalesce(p_answer_basis, '')) > 1000
       or length(coalesce(p_reason, '')) > 300
       or length(coalesce(p_provider, '')) > 40
       or length(coalesce(p_model_name, '')) > 80 then
        return;
    end if;

    if p_verdict not in ('correct', 'incorrect') then
        return;
    end if;

    if coalesce(p_scope, 'per_word') not in ('per_word', 'global_synonym') then
        return;
    end if;

    insert into public.ai_judge_cache (
        cache_key,
        word_key,
        normalized_user_answer,
        answer_basis,
        verdict,
        confidence,
        scope,
        reason,
        provider,
        model_name,
        hit_count,
        first_cached_at,
        last_cached_at
    )
    values (
        p_cache_key,
        p_word_key,
        p_normalized_user_answer,
        coalesce(p_answer_basis, ''),
        p_verdict,
        greatest(0, least(1, coalesce(p_confidence, 0))),
        coalesce(p_scope, 'per_word'),
        nullif(p_reason, ''),
        nullif(p_provider, ''),
        nullif(p_model_name, ''),
        1,
        now(),
        now()
    )
    on conflict (cache_key)
    do update
    set verdict = excluded.verdict,
        confidence = excluded.confidence,
        scope = excluded.scope,
        reason = excluded.reason,
        provider = excluded.provider,
        model_name = excluded.model_name,
        answer_basis = excluded.answer_basis,
        word_key = excluded.word_key,
        normalized_user_answer = excluded.normalized_user_answer,
        hit_count = public.ai_judge_cache.hit_count + 1,
        last_cached_at = now(),
        updated_at = now();
end;
$$;

grant execute on function public.get_ai_judge_cache_v1(text) to anon, authenticated;
grant execute on function public.upsert_ai_judge_cache_v1(text, text, text, text, text, double precision, text, text, text, text) to anon, authenticated;

commit;
