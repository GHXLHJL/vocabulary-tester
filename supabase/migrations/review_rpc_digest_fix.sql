begin;

create extension if not exists pgcrypto;

create or replace function public.verify_admin_secret(input_secret text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    matched boolean;
begin
    select exists(
        select 1
        from public.admin_config
        where is_active = true
          and secret_hash = encode(extensions.digest(input_secret, 'sha256'), 'hex')
    ) into matched;

    return jsonb_build_object('valid', matched);
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

grant execute on function public.verify_admin_secret(text) to anon, authenticated;
grant execute on function public.fetch_pending_reviews(text) to anon, authenticated;
grant execute on function public.review_pending_answer(text, bigint, text, text) to anon, authenticated;

commit;
