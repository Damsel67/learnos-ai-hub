CREATE TYPE public.org_role AS ENUM ('admin','tutor','learner');
CREATE TYPE public.invitation_type AS ENUM ('admin','tutor','learner');
CREATE TYPE public.invitation_status AS ENUM ('pending','accepted','expired','revoked');

CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role public.org_role NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id, role)
);
GRANT SELECT ON public.organization_members TO authenticated;
GRANT ALL ON public.organization_members TO service_role;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.parent_learner_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (parent_id, learner_id)
);
GRANT SELECT ON public.parent_learner_links TO authenticated;
GRANT ALL ON public.parent_learner_links TO service_role;
ALTER TABLE public.parent_learner_links ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  invitation_type public.invitation_type NOT NULL,
  inviter_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  intended_role public.org_role NOT NULL,
  status public.invitation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '7 days',
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users ON DELETE SET NULL
);
CREATE INDEX invitations_org_idx ON public.invitations(organization_id);
CREATE INDEX invitations_inviter_idx ON public.invitations(inviter_id);
GRANT ALL ON public.invitations TO service_role;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
-- No direct client access to invitations: all access goes through security-definer functions below.

CREATE OR REPLACE FUNCTION public.is_org_member(_user UUID, _org UUID, _role public.org_role DEFAULT NULL)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM organization_members
    WHERE user_id = _user AND organization_id = _org AND status = 'active'
      AND (_role IS NULL OR role = _role));
$$;

CREATE POLICY "Members view their organizations" ON public.organizations
  FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), id));
CREATE POLICY "Users view own memberships" ON public.organization_members
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Org admins view org memberships" ON public.organization_members
  FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), organization_id, 'admin'));
CREATE POLICY "Parents and learners view own links" ON public.parent_learner_links
  FOR SELECT TO authenticated USING (parent_id = auth.uid() OR learner_id = auth.uid());

-- Users can no longer change their own account type from the app
CREATE OR REPLACE FUNCTION public.prevent_account_type_change()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.account_type IS DISTINCT FROM OLD.account_type AND auth.role() = 'authenticated' THEN
    RAISE EXCEPTION 'Account type cannot be changed';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER profiles_lock_account_type BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_account_type_change();

-- Provision a workspace for organisation accounts
CREATE OR REPLACE FUNCTION public.ensure_my_organization()
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid UUID := auth.uid(); _org UUID; _p profiles;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT organization_id INTO _org FROM organization_members
    WHERE user_id = _uid AND role = 'admin' AND status = 'active' ORDER BY created_at LIMIT 1;
  IF _org IS NOT NULL THEN RETURN _org; END IF;
  SELECT * INTO _p FROM profiles WHERE id = _uid;
  IF _p.account_type <> 'organization' THEN RETURN NULL; END IF;
  INSERT INTO organizations(name, created_by)
    VALUES (COALESCE(NULLIF(trim(_p.full_name), ''), 'My') || '''s Organisation', _uid) RETURNING id INTO _org;
  INSERT INTO organization_members(organization_id, user_id, role) VALUES (_org, _uid, 'admin');
  RETURN _org;
END; $$;

CREATE OR REPLACE FUNCTION public.my_invite_context()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid UUID := auth.uid(); _org UUID; _name TEXT; _type account_type;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  _org := ensure_my_organization();
  SELECT name INTO _name FROM organizations WHERE id = _org;
  SELECT account_type INTO _type FROM profiles WHERE id = _uid;
  RETURN json_build_object(
    'organization_id', _org, 'organization_name', _name,
    'can_invite_staff', _org IS NOT NULL,
    'can_invite_learner', _org IS NOT NULL OR _type = 'parent',
    'is_parent', _type = 'parent');
END; $$;

CREATE OR REPLACE FUNCTION public.create_invitation(_type public.invitation_type, _email TEXT, _first TEXT DEFAULT NULL, _last TEXT DEFAULT NULL)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE _uid UUID := auth.uid(); _org UUID; _acct account_type; _token TEXT; _id UUID; _clean TEXT := lower(trim(_email));
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _clean !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' THEN RAISE EXCEPTION 'Enter a valid email address'; END IF;
  _org := ensure_my_organization();
  SELECT account_type INTO _acct FROM profiles WHERE id = _uid;
  IF _org IS NULL THEN
    IF NOT (_type = 'learner' AND _acct = 'parent') THEN
      RAISE EXCEPTION 'You do not have permission to send this invitation';
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM invitations WHERE lower(email) = _clean AND invitation_type = _type
      AND status = 'pending' AND expires_at > now()
      AND ((_org IS NOT NULL AND organization_id = _org) OR (_org IS NULL AND organization_id IS NULL AND inviter_id = _uid))) THEN
    RAISE EXCEPTION 'A pending invitation already exists for this email. Use Resend instead.';
  END IF;
  _token := translate(encode(gen_random_bytes(32), 'base64'), '+/=', '-_');
  INSERT INTO invitations(token, invitation_type, inviter_id, organization_id, email, first_name, last_name, intended_role)
  VALUES (_token, _type, _uid, _org, _clean, NULLIF(trim(_first), ''), NULLIF(trim(_last), ''), _type::text::org_role)
  RETURNING id INTO _id;
  RETURN json_build_object('id', _id, 'token', _token, 'type', _type);
END; $$;

CREATE OR REPLACE FUNCTION public.can_manage_invitation(_uid UUID, _inv invitations)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN _inv.organization_id IS NOT NULL
    THEN is_org_member(_uid, _inv.organization_id, 'admin')
    ELSE _inv.inviter_id = _uid END;
$$;

CREATE OR REPLACE FUNCTION public.list_my_invitations()
RETURNS TABLE(id UUID, token TEXT, invitation_type public.invitation_type, email TEXT, first_name TEXT, last_name TEXT,
  status TEXT, created_at TIMESTAMPTZ, expires_at TIMESTAMPTZ, inviter_name TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT i.id, CASE WHEN i.status = 'pending' AND i.expires_at > now() THEN i.token END,
    i.invitation_type, i.email, i.first_name, i.last_name,
    CASE WHEN i.status = 'pending' AND i.expires_at <= now() THEN 'expired' ELSE i.status::text END,
    i.created_at, i.expires_at, p.full_name
  FROM invitations i LEFT JOIN profiles p ON p.id = i.inviter_id
  WHERE auth.uid() IS NOT NULL AND public.can_manage_invitation(auth.uid(), i)
  ORDER BY i.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.resend_invitation(_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _inv invitations;
BEGIN
  SELECT * INTO _inv FROM invitations WHERE id = _id FOR UPDATE;
  IF NOT FOUND OR NOT can_manage_invitation(auth.uid(), _inv) THEN RAISE EXCEPTION 'Invitation not found'; END IF;
  IF _inv.status <> 'pending' THEN RAISE EXCEPTION 'Only pending invitations can be resent'; END IF;
  UPDATE invitations SET expires_at = now() + interval '7 days' WHERE id = _id RETURNING * INTO _inv;
  RETURN json_build_object('id', _inv.id, 'expires_at', _inv.expires_at);
END; $$;

CREATE OR REPLACE FUNCTION public.revoke_invitation(_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _inv invitations;
BEGIN
  SELECT * INTO _inv FROM invitations WHERE id = _id FOR UPDATE;
  IF NOT FOUND OR NOT can_manage_invitation(auth.uid(), _inv) THEN RAISE EXCEPTION 'Invitation not found'; END IF;
  IF _inv.status <> 'pending' THEN RAISE EXCEPTION 'Only pending invitations can be revoked'; END IF;
  UPDATE invitations SET status = 'revoked' WHERE id = _id;
END; $$;

-- Public lookup: returns only what the invitation page needs
CREATE OR REPLACE FUNCTION public.get_invitation(_token TEXT, _type public.invitation_type)
RETURNS JSON LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _inv invitations; _org TEXT; _inviter TEXT;
BEGIN
  SELECT * INTO _inv FROM invitations WHERE token = _token AND invitation_type = _type;
  IF NOT FOUND THEN RETURN json_build_object('state', 'invalid'); END IF;
  IF _inv.status = 'revoked' THEN RETURN json_build_object('state', 'revoked'); END IF;
  IF _inv.status = 'accepted' THEN RETURN json_build_object('state', 'accepted'); END IF;
  IF _inv.status = 'expired' OR _inv.expires_at <= now() THEN RETURN json_build_object('state', 'expired'); END IF;
  SELECT name INTO _org FROM organizations WHERE id = _inv.organization_id;
  SELECT full_name INTO _inviter FROM profiles WHERE id = _inv.inviter_id;
  RETURN json_build_object('state', 'valid', 'type', _inv.invitation_type, 'email', _inv.email,
    'first_name', _inv.first_name, 'organization_name', _org, 'inviter_name', _inviter,
    'is_parent_invite', _inv.organization_id IS NULL, 'expires_at', _inv.expires_at);
END; $$;

CREATE OR REPLACE FUNCTION public.accept_invitation(_token TEXT, _type public.invitation_type)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid UUID := auth.uid(); _inv invitations; _email TEXT;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Sign in to accept this invitation'; END IF;
  SELECT * INTO _inv FROM invitations WHERE token = _token AND invitation_type = _type FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'This invitation link is not valid'; END IF;
  IF _inv.status = 'revoked' THEN RAISE EXCEPTION 'This invitation has been revoked'; END IF;
  IF _inv.status = 'accepted' THEN RAISE EXCEPTION 'This invitation has already been used'; END IF;
  IF _inv.expires_at <= now() THEN RAISE EXCEPTION 'This invitation has expired'; END IF;
  SELECT email INTO _email FROM auth.users WHERE id = _uid;
  IF lower(_email) <> lower(_inv.email) THEN
    RAISE EXCEPTION 'This invitation was sent to a different email address. Sign in with %', _inv.email;
  END IF;
  IF _inv.inviter_id = _uid THEN RAISE EXCEPTION 'You cannot accept your own invitation'; END IF;
  IF _inv.organization_id IS NOT NULL THEN
    INSERT INTO organization_members(organization_id, user_id, role)
      VALUES (_inv.organization_id, _uid, _inv.intended_role)
      ON CONFLICT (organization_id, user_id, role) DO UPDATE SET status = 'active';
  ELSE
    INSERT INTO parent_learner_links(parent_id, learner_id) VALUES (_inv.inviter_id, _uid)
      ON CONFLICT DO NOTHING;
  END IF;
  UPDATE invitations SET status = 'accepted', accepted_at = now(), accepted_by = _uid WHERE id = _inv.id;
  RETURN json_build_object('type', _inv.invitation_type, 'role', _inv.intended_role);
END; $$;

REVOKE EXECUTE ON FUNCTION public.prevent_account_type_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_manage_invitation(UUID, public.invitations) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_org_member(UUID, UUID, public.org_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.ensure_my_organization() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.my_invite_context() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.create_invitation(public.invitation_type, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.list_my_invitations() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.resend_invitation(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.revoke_invitation(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.accept_invitation(TEXT, public.invitation_type) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_invitation(TEXT, public.invitation_type) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_member(UUID, UUID, public.org_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_invitation(UUID, public.invitations) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_my_organization() TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_invite_context() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_invitation(public.invitation_type, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_my_invitations() TO authenticated;
GRANT EXECUTE ON FUNCTION public.resend_invitation(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_invitation(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_invitation(TEXT, public.invitation_type) TO authenticated;