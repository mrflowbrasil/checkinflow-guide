update public.tenant_integrations
set status = 'error',
    last_error = 'manual_reset: webhook callback did not return (import stuck)'
where tenant_id = '133562b8-d16c-4877-9c28-a688787ff9b3'
  and provider = 'stays'
  and status = 'syncing';
