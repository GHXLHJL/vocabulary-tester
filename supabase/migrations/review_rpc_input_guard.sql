begin;

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

grant execute on function public.report_pending_answer(text, text, integer, text, text, text, text, text, text) to anon, authenticated;

commit;
