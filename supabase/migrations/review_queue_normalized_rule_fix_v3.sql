begin;

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
    normalized_answer text;
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

    normalized_answer := review_row.user_answer_normalized;
    target_global_key := coalesce(nullif(p_global_canonical_key, ''), review_row.global_canonical_key);

    update public.accepted_rules ar
    set is_active = false,
        updated_at = now()
    where (
            (ar.rule_type = 'per_word' and ar.word_key = review_row.word_key)
         or (ar.rule_type = 'blocked' and ar.word_key = review_row.word_key)
         or (ar.rule_type = 'global_synonym' and ar.word_key = coalesce(target_global_key, ar.word_key))
        )
      and exists (
            select 1
            from public.answer_review_queue q
            where q.word_key = review_row.word_key
              and q.user_answer_normalized = normalized_answer
              and q.user_answer_raw = ar.answer_text
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

grant execute on function public.apply_review_decision_v2(text, text, text, text, text, text, text) to anon, authenticated;

commit;
