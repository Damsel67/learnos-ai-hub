CREATE OR REPLACE FUNCTION public.list_org_members(_org uuid)
RETURNS TABLE(member_id uuid, user_id uuid, full_name text, email text, role org_role, status text, joined_at timestamptz, is_self boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT is_org_member(auth.uid(), _org, 'admin') THEN
    RAISE EXCEPTION 'You do not have permission to view these members';
  END IF;
  RETURN QUERY
    SELECT m.id, m.user_id, p.full_name, u.email::text, m.role, m.status, m.created_at, m.user_id = auth.uid()
    FROM organization_members m
    LEFT JOIN profiles p ON p.id = m.user_id
    LEFT JOIN auth.users u ON u.id = m.user_id
    WHERE m.organization_id = _org
    ORDER BY m.created_at DESC;
END; $$;

CREATE OR REPLACE FUNCTION public._org_member_guard(_member_id uuid)
RETURNS organization_members
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE _m organization_members;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO _m FROM organization_members WHERE id = _member_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Member not found'; END IF;
  IF NOT is_org_member(auth.uid(), _m.organization_id, 'admin') THEN
    RAISE EXCEPTION 'You do not have permission to manage this member';
  END IF;
  IF _m.user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot change your own membership';
  END IF;
  RETURN _m;
END; $$;

CREATE OR REPLACE FUNCTION public._is_last_active_admin(_m organization_members)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT _m.role = 'admin' AND _m.status = 'active' AND NOT EXISTS (
    SELECT 1 FROM organization_members WHERE organization_id = _m.organization_id
      AND role = 'admin' AND status = 'active' AND id <> _m.id);
$$;

CREATE OR REPLACE FUNCTION public.update_member_role(_member_id uuid, _role org_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE _m organization_members;
BEGIN
  _m := _org_member_guard(_member_id);
  IF _m.role = _role THEN RETURN; END IF;
  IF _is_last_active_admin(_m) THEN RAISE EXCEPTION 'An organisation needs at least one active administrator'; END IF;
  IF EXISTS (SELECT 1 FROM organization_members WHERE organization_id = _m.organization_id AND user_id = _m.user_id AND role = _role) THEN
    RAISE EXCEPTION 'This person already has that role in your organisation';
  END IF;
  UPDATE organization_members SET role = _role WHERE id = _m.id;
END; $$;

CREATE OR REPLACE FUNCTION public.set_member_status(_member_id uuid, _status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE _m organization_members;
BEGIN
  IF _status NOT IN ('active','suspended') THEN RAISE EXCEPTION 'Invalid status'; END IF;
  _m := _org_member_guard(_member_id);
  IF _status = 'suspended' AND _is_last_active_admin(_m) THEN
    RAISE EXCEPTION 'An organisation needs at least one active administrator';
  END IF;
  UPDATE organization_members SET status = _status WHERE id = _m.id;
END; $$;

CREATE OR REPLACE FUNCTION public.remove_org_member(_member_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE _m organization_members;
BEGIN
  _m := _org_member_guard(_member_id);
  IF _is_last_active_admin(_m) THEN RAISE EXCEPTION 'An organisation needs at least one active administrator'; END IF;
  DELETE FROM organization_members WHERE id = _m.id;
END; $$;

REVOKE ALL ON FUNCTION public._org_member_guard(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._is_last_active_admin(organization_members) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.list_org_members(uuid), public.update_member_role(uuid, org_role), public.set_member_status(uuid, text), public.remove_org_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_org_members(uuid), public.update_member_role(uuid, org_role), public.set_member_status(uuid, text), public.remove_org_member(uuid) TO authenticated;