begin;

grant usage on schema public to anon, authenticated;
grant select, insert on table public.leaderboard to anon, authenticated;
grant update (nickname) on table public.leaderboard to anon, authenticated;

do $$
begin
    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'leaderboard'
          and policyname = 'leaderboard_update_nickname_public'
    ) then
        create policy leaderboard_update_nickname_public
            on public.leaderboard
            for update
            to anon, authenticated
            using (true)
            with check (true);
    end if;
end
$$;

commit;
