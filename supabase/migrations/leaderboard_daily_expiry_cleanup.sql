begin;

grant delete on table public.leaderboard to anon, authenticated;

do $$
begin
    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'leaderboard'
          and policyname = 'leaderboard_delete_expired_daily_public'
    ) then
        create policy leaderboard_delete_expired_daily_public
            on public.leaderboard
            for delete
            to anon, authenticated
            using (
                test_mode = 'daily'
                and test_date is not null
                and test_date < (now() - interval '5 days')
            );
    end if;
end
$$;

commit;
