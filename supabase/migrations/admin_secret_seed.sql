begin;

update public.admin_config
set is_active = false,
    updated_at = now()
where is_active = true
  and secret_hash <> '5c33533449f33b025ade542e5d726184103d8dd6402dd6547c8e1135f8e76720';

insert into public.admin_config (secret_hash, is_active)
select '5c33533449f33b025ade542e5d726184103d8dd6402dd6547c8e1135f8e76720', true
where not exists (
    select 1
    from public.admin_config
    where secret_hash = '5c33533449f33b025ade542e5d726184103d8dd6402dd6547c8e1135f8e76720'
      and is_active = true
);

commit;
