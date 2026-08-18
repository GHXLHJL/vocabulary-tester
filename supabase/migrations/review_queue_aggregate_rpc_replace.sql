begin;

drop function if exists public.fetch_pending_reviews(text);
drop function if exists public.review_pending_answer(text, bigint, text, text);

create or replace function public.fetch_pending_reviews(p_secret text, p_review_status text)
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
    last_seen_at timestamptz
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
            max(q.last_seen_at) as last_seen_at
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
        grouped.last_seen_at
    from grouped
    order by grouped.total_count desc, grouped.last_seen_at desc;
end;
$$;

create or replace function public.review_pending_answer(
    p_secret text,
    p_word_key text,
    p_user_answer_normalized text,
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
    where word_key = p_word_key
      and user_answer_normalized = p_user_answer_normalized
    order by last_seen_at desc
    limit 1;

    if not found then
        raise exception 'review item not found';
    end if;

    if p_status = 'approved' then
        update public.accepted_rules
        set is_active = false,
            updated_at = now()
        where word_key = review_row.word_key
          and answer_text = review_row.user_answer_raw
          and rule_type = 'blocked';

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
        update public.accepted_rules
        set is_active = false,
            updated_at = now()
        where word_key = review_row.word_key
          and answer_text = review_row.user_answer_raw
          and rule_type = 'per_word';

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
    elsif p_status = 'pending' then
        update public.accepted_rules
        set is_active = false,
            updated_at = now()
        where word_key = review_row.word_key
          and answer_text = review_row.user_answer_raw
          and rule_type in ('per_word', 'blocked');
    end if;

    update public.answer_review_queue
    set status = p_status,
        review_note = p_note,
        reviewed_at = now(),
        updated_at = now()
    where word_key = p_word_key
      and user_answer_normalized = p_user_answer_normalized
      and status = 'pending';
end;
$$;

grant execute on function public.fetch_pending_reviews(text, text) to anon, authenticated;
grant execute on function public.review_pending_answer(text, text, text, text, text) to anon, authenticated;

commit;
