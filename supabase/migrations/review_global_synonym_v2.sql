begin;

alter table public.answer_review_queue
    add column if not exists review_scope text null,
    add column if not exists global_canonical_key text null;

create or replace function public.fetch_review_aggregates_v2(p_secret text, p_review_status text)
returns table (
    aggregate_key text,
    word text,
    word_key text,
    standard_answers text,
    user_answer_raw text,
    user_answer_normalized text,
    total_count bigint,
    distinct_user_count bigint,
    sample_user_names text,
    latest_test_mode text,
    first_seen_at timestamptz,
    last_seen_at timestamptz,
    review_scope text,
    global_canonical_key text
)
language plpgsql
security definer
set search_path = public
as $$
begin
    if p_review_status not in ('pending', 'approved', 'rejected') then
        raise exception 'invalid review filter';
    end if;

    if not exists (
        select 1
        from public.admin_config
        where is_active = true
          and secret_hash = encode(extensions.digest(p_secret, 'sha256'), 'hex')
    ) then
        raise exception 'invalid admin secret';
    end if;

    return query
    with grouped as (
        select
            q.word_key,
            q.user_answer_normalized,
            min(q.word) as word,
            min(q.standard_answers) as standard_answers,
            min(q.user_answer_raw) as user_answer_raw,
            sum(q.occur_count)::bigint as total_count,
            count(distinct q.user_id)::bigint as distinct_user_count,
            string_agg(distinct coalesce(q.user_name, '匿名'), ' / ') as sample_user_names,
            (array_agg(q.test_mode order by q.last_seen_at desc))[1] as latest_test_mode,
            min(q.first_seen_at) as first_seen_at,
            max(q.last_seen_at) as last_seen_at,
            (array_agg(q.review_scope order by q.last_seen_at desc))[1] as review_scope,
            (array_agg(q.global_canonical_key order by q.last_seen_at desc))[1] as global_canonical_key
        from public.answer_review_queue q
        where q.status = p_review_status
        group by q.word_key, q.user_answer_normalized
    )
    select
        grouped.word_key || '::' || grouped.user_answer_normalized as aggregate_key,
        grouped.word,
        grouped.word_key,
        grouped.standard_answers,
        grouped.user_answer_raw,
        grouped.user_answer_normalized,
        grouped.total_count,
        grouped.distinct_user_count,
        grouped.sample_user_names,
        grouped.latest_test_mode,
        grouped.first_seen_at,
        grouped.last_seen_at,
        grouped.review_scope,
        grouped.global_canonical_key
    from grouped
    order by grouped.total_count desc, grouped.last_seen_at desc;
end;
$$;

create or replace function public.apply_review_decision_v2(
    p_secret text,
    p_word_key text,
    p_user_answer_normalized text,
    p_status text,
    p_note text default null,
    p_rule_scope text default null,
    p_global_canonical_key text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    review_row public.answer_review_queue%rowtype;
    target_global_key text;
begin
    if not exists (
        select 1
        from public.admin_config
        where is_active = true
          and secret_hash = encode(extensions.digest(p_secret, 'sha256'), 'hex')
    ) then
        raise exception 'invalid admin secret';
    end if;

    if p_status not in ('approved', 'rejected', 'pending') then
        raise exception 'invalid review status';
    end if;

    if p_status = 'approved' and coalesce(p_rule_scope, '') not in ('per_word', 'global_synonym') then
        raise exception 'invalid review scope';
    end if;

    select *
    into review_row
    from public.answer_review_queue
    where word_key = p_word_key
      and user_answer_normalized = p_user_answer_normalized
    order by last_seen_at desc
    limit 1;

    if not found then
        raise exception 'review item not found';
    end if;

    target_global_key := coalesce(nullif(p_global_canonical_key, ''), review_row.global_canonical_key);

    update public.accepted_rules
    set is_active = false,
        updated_at = now()
    where answer_text = review_row.user_answer_raw
      and (
        (rule_type = 'per_word' and word_key = review_row.word_key)
        or (rule_type = 'blocked' and word_key = review_row.word_key)
        or (rule_type = 'global_synonym' and word_key = coalesce(target_global_key, word_key))
      );

    if p_status = 'approved' then
        if p_rule_scope = 'per_word' then
            insert into public.accepted_rules (
                word_key,
                answer_text,
                rule_type,
                is_active,
                review_note
            )
            values (
                review_row.word_key,
                review_row.user_answer_raw,
                'per_word',
                true,
                p_note
            )
            on conflict (word_key, answer_text, rule_type)
            do update
            set is_active = true,
                review_note = excluded.review_note,
                updated_at = now();
        else
            if coalesce(target_global_key, '') = '' then
                raise exception 'missing global canonical key';
            end if;

            insert into public.accepted_rules (
                word_key,
                answer_text,
                rule_type,
                is_active,
                review_note
            )
            values (
                target_global_key,
                review_row.user_answer_raw,
                'global_synonym',
                true,
                p_note
            )
            on conflict (word_key, answer_text, rule_type)
            do update
            set is_active = true,
                review_note = excluded.review_note,
                updated_at = now();
        end if;
    elsif p_status = 'rejected' then
        insert into public.accepted_rules (
            word_key,
            answer_text,
            rule_type,
            is_active,
            review_note
        )
        values (
            review_row.word_key,
            review_row.user_answer_raw,
            'blocked',
            true,
            p_note
        )
        on conflict (word_key, answer_text, rule_type)
        do update
        set is_active = true,
            review_note = excluded.review_note,
            updated_at = now();
    end if;

    update public.answer_review_queue
    set status = p_status,
        review_note = p_note,
        reviewed_at = case when p_status = 'pending' then null else now() end,
        updated_at = now(),
        review_scope = case
            when p_status = 'approved' then p_rule_scope
            when p_status = 'rejected' then 'blocked'
            else null
        end,
        global_canonical_key = case
            when p_status = 'approved' and p_rule_scope = 'global_synonym' then target_global_key
            else null
        end
    where word_key = p_word_key
      and user_answer_normalized = p_user_answer_normalized;
end;
$$;

grant execute on function public.fetch_review_aggregates_v2(text, text) to anon, authenticated;
grant execute on function public.apply_review_decision_v2(text, text, text, text, text, text, text) to anon, authenticated;

commit;
