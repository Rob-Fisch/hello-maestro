-- Secure RPC for Public Gig Invites
-- Allows unauthenticated fetching of event details IF the inviteId matches a slot

create or replace function get_invite_info(p_invite_id text)
returns table (
  event_id text,
  event_title text,
  event_date text,
  event_time text,
  event_venue text,
  slot_id text,
  slot_role text,
  slot_fee text,
  slot_status text,
  invite_type text,
  invite_expires_at text
) 
security definer
language plpgsql
as $$
declare
  r record;
  slot jsonb;
begin
  -- Search through all events that have slots
  for r in select id, title, date, time, venue, slots from  public.events where slots is not null and slots::text != '[]'
  loop
    -- Check if any slot has a matching inviteId
    -- We use a lateral join or simple jsonb iteration logic. 
    -- For simplicity in PL/PGSQL without complex JSON path syntax (which can be version dependent), we iterate or use jsonb_array_elements.
    
    select item into slot
    from jsonb_array_elements(r.slots) as item
    where item->>'inviteId' = p_invite_id
    limit 1;

    if slot is not null then
      -- Found the match! Return the mixed data
      event_id := r.id;
      event_title := r.title;
      event_date := r.date;
      event_time := r.time;
      event_venue := r.venue;
      
      slot_id := slot->>'id';
      slot_role := slot->>'role';
      slot_fee := slot->>'fee';
      slot_status := slot->>'status';
      invite_type := slot->>'inviteType';
      invite_expires_at := slot->>'inviteExpiresAt';
      
      return next;
      return; -- Exit after finding the first match
    end if;
  end loop;
end;
$$;
