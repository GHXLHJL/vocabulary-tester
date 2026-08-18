begin;

revoke select, update on table public.answer_review_queue from anon, authenticated;
revoke insert, update on table public.accepted_rules from anon, authenticated;
revoke select on table public.admin_config from anon, authenticated;

drop policy if exists answer_review_queue_select_public on public.answer_review_queue;
drop policy if exists answer_review_queue_update_public on public.answer_review_queue;
drop policy if exists accepted_rules_write_public on public.accepted_rules;
drop policy if exists admin_config_select_public on public.admin_config;

create or replace function public.report_pending_answer(
    p_word text,
    p_word_key text,
    p_group_id integer,
    p_standard_answers text,
    p_user_answer_raw text,
    p_user_answer_normalized text,
    p_user_id text,
    p_user_name text,
    p_test_mode text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if coalesce(length(trim(p_word_key)), 0) = 0
       or coalesce(length(trim(p_user_answer_normalized)), 0) = 0
       or coalesce(length(trim(p_user_id)), 0) = 0 then
        return;
    end if;

    if length(coalesce(p_word, '')) > 80
       or length(coalesce(p_word_key, '')) > 80
       or length(coalesce(p_standard_answers, '')) > 500
       or length(coalesce(p_user_answer_raw, '')) > 120
       or length(coalesce(p_user_answer_normalized, '')) > 120
       or length(coalesce(p_user_id, '')) > 80
       or length(coalesce(p_user_name, '')) > 80
       or length(coalesce(p_test_mode, '')) > 20 then
        return;
    end if;

    insert into public.answer_review_queue (
        word,
        word_key,
        group_id,
        standard_answers,
        user_answer_raw,
        user_answer_normalized,
        user_id,
        user_name,
        test_mode,
        status,
        occur_count,
        first_seen_at,
        last_seen_at
    )
    values (
        p_word,
        p_word_key,
        p_group_id,
        p_standard_answers,
        p_user_answer_raw,
        p_user_answer_normalized,
        p_user_id,
        p_user_name,
        p_test_mode,
        'pending',
        1,
        now(),
        now()
    )
    on conflict (word_key, user_answer_normalized, user_id)
    do update
    set user_answer_raw = excluded.user_answer_raw,
        standard_answers = excluded.standard_answers,
        user_name = excluded.user_name,
        test_mode = excluded.test_mode,
        status = 'pending',
        occur_count = public.answer_review_queue.occur_count + 1,
        last_seen_at = now(),
        updated_at = now();
end;
$$;

create or replace function public.fetch_pending_reviews(p_secret text)
returns table (
    id bigint,
    word text,
    word_key text,
    group_id integer,
    standard_answers text,
    user_answer_raw text,
    user_answer_normalized text,
    user_id text,
    user_name text,
    test_mode text,
    status text,
    occur_count integer,
    review_note text,
    first_seen_at timestamptz,
    last_seen_at timestamptz,
    reviewed_at timestamptz,
    created_at timestamptz,
    updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
    if not exists (
        select 1
        from public.admin_config
        where is_active = true
          and secret_hash = encode(extensions.digest(p_secret, 'sha256'), 'hex')
    ) then
        raise exception 'invalid admin secret';
    end if;

    return query
    select
        q.id,
        q.word,
        q.word_key,
        q.group_id,
        q.standard_answers,
        q.user_answer_raw,
        q.user_answer_normalized,
        q.user_id,
        q.user_name,
        q.test_mode,
        q.status,
        q.occur_count,
        q.review_note,
        q.first_seen_at,
        q.last_seen_at,
        q.reviewed_at,
        q.created_at,
        q.updated_at
    from public.answer_review_queue q
    where q.status = 'pending'
    order by q.occur_count desc, q.last_seen_at desc;
end;
$$;

create or replace function public.review_pending_answer(
    p_secret text,
    p_review_id bigint,
    p_status text,
    p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    review_row public.answer_review_queue%rowtype;
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

    select *
    into review_row
    from public.answer_review_queue
    where id = p_review_id;

    if not found then
        raise exception 'review item not found';
    end if;

    if p_status = 'approved' then
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
        reviewed_at = now(),
        updated_at = now()
    where id = p_review_id;
end;
$$;

grant execute on function public.report_pending_answer(text, text, integer, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.fetch_pending_reviews(text) to anon, authenticated;
grant execute on function public.review_pending_answer(text, bigint, text, text) to anon, authenticated;

commit;
