-- Function to handle responding to an invite
-- This must be called by an authenticated user
create or replace function respond_to_invite(
  p_invite_id text,
  p_response text -- 'confirmed' or 'declined'
) 
returns boolean
language plpgsql
security definer
as $$
declare
  v_event_id text;
  v_slots jsonb;
  v_slot_index int;
  v_user_id uuid;
  v_new_slot jsonb;
begin
  -- Get current user ID
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  -- Validate response
  if p_response not in ('confirmed', 'declined') then
    raise exception 'Invalid response';
  end if;

  -- Find the event containing this invite
  select id, slots into v_event_id, v_slots
  from events
  where exists (
    select 1
    from jsonb_array_elements(slots) as s
    where (s->>'inviteId') = p_invite_id
  );

  if v_event_id is null then
    raise exception 'Invite not found';
  end if;

  -- Find the specific slot index
  -- We need to iterate again to find the index to update
  -- Or we can reconstruct the array.
  
  -- Let's construct a new slots array
  select jsonb_agg(
    case 
      when (elem->>'inviteId') = p_invite_id then
        elem || jsonb_build_object(
          'status', p_response,
          'musicianId', v_user_id, -- Link the user!
          'respondedAt', now()
        )
      else elem
    end
  )
  into v_slots
  from jsonb_array_elements(v_slots) as elem;

  -- Update the event
  update events
  set slots = v_slots
  where id = v_event_id;

  return true;
end;
$$;
