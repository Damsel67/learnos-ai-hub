ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS customer_type text;
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS org_type text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS setup_completed boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _kind text := NEW.raw_user_meta_data->>'signup_kind';
BEGIN
  IF _kind IS NOT NULL AND _kind NOT IN ('institution','tutoring_company','independent_tutor','parent','student','training_org') THEN
    _kind := NULL;
  END IF;
  INSERT INTO public.profiles (id, full_name, account_type, customer_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE((NEW.raw_user_meta_data->>'account_type')::public.account_type, 'student'),
    _kind
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- No more auto-named organisations: return the admin's existing organisation only.
CREATE OR REPLACE FUNCTION public.ensure_my_organization()
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid UUID := auth.uid(); _org UUID;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT organization_id INTO _org FROM organization_members
    WHERE user_id = _uid AND role = 'admin' AND status = 'active' ORDER BY created_at LIMIT 1;
  RETURN _org;
END; $$;

CREATE OR REPLACE FUNCTION public.my_organization()
RETURNS JSON LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid UUID := auth.uid(); _o organizations;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT o.* INTO _o FROM organizations o JOIN organization_members m ON m.organization_id = o.id
    WHERE m.user_id = _uid AND m.role = 'admin' AND m.status = 'active' ORDER BY m.created_at LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;
  RETURN json_build_object('id', _o.id, 'name', _o.name, 'org_type', _o.org_type, 'country', _o.country,
    'website', _o.website, 'logo_url', _o.logo_url, 'setup_completed', _o.setup_completed);
END; $$;

CREATE OR REPLACE FUNCTION public.create_my_organization(_name TEXT, _type TEXT, _country TEXT, _website TEXT DEFAULT NULL)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid UUID := auth.uid(); _org UUID; _done boolean;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF (SELECT account_type FROM profiles WHERE id = _uid) <> 'organization' THEN
    RAISE EXCEPTION 'Only organisation accounts can create an organisation';
  END IF;
  IF length(trim(coalesce(_name,''))) < 2 OR length(_name) > 120 THEN RAISE EXCEPTION 'Enter your organisation name'; END IF;
  IF _type NOT IN ('school','tutoring_company','training_org') THEN RAISE EXCEPTION 'Choose an organisation type'; END IF;
  IF length(trim(coalesce(_country,''))) < 2 THEN RAISE EXCEPTION 'Choose your country'; END IF;
  SELECT o.id, o.setup_completed INTO _org, _done FROM organizations o JOIN organization_members m ON m.organization_id = o.id
    WHERE m.user_id = _uid AND m.role = 'admin' AND m.status = 'active' ORDER BY m.created_at LIMIT 1;
  IF _org IS NOT NULL AND _done THEN RAISE EXCEPTION 'Your organisation is already set up'; END IF;
  IF _org IS NOT NULL THEN
    UPDATE organizations SET name = trim(_name), org_type = _type, country = trim(_country),
      website = NULLIF(trim(_website), ''), setup_completed = true WHERE id = _org;
  ELSE
    INSERT INTO organizations(name, created_by, org_type, country, website, setup_completed)
      VALUES (trim(_name), _uid, _type, trim(_country), NULLIF(trim(_website), ''), true) RETURNING id INTO _org;
    INSERT INTO organization_members(organization_id, user_id, role) VALUES (_org, _uid, 'admin');
  END IF;
  RETURN _org;
END; $$;

CREATE OR REPLACE FUNCTION public.update_organization_profile(_org UUID, _name TEXT, _type TEXT, _country TEXT, _website TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT is_org_member(auth.uid(), _org, 'admin') THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF length(trim(coalesce(_name,''))) < 2 OR length(_name) > 120 THEN RAISE EXCEPTION 'Enter your organisation name'; END IF;
  IF _type NOT IN ('school','tutoring_company','training_org') THEN RAISE EXCEPTION 'Choose an organisation type'; END IF;
  IF length(trim(coalesce(_country,''))) < 2 THEN RAISE EXCEPTION 'Choose your country'; END IF;
  UPDATE organizations SET name = trim(_name), org_type = _type, country = trim(_country),
    website = NULLIF(trim(_website), ''), setup_completed = true WHERE id = _org;
END; $$;

-- Invitation saved on the account at sign-up, so it survives switching device/browser.
CREATE OR REPLACE FUNCTION public.my_pending_invite()
RETURNS JSON LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid UUID := auth.uid(); _meta jsonb; _email text; _inv invitations;
BEGIN
  IF _uid IS NULL THEN RETURN NULL; END IF;
  SELECT raw_user_meta_data, email INTO _meta, _email FROM auth.users WHERE id = _uid;
  IF _meta->>'invite_token' IS NULL OR _meta->>'invite_type' NOT IN ('admin','tutor','learner') THEN RETURN NULL; END IF;
  SELECT * INTO _inv FROM invitations WHERE token = _meta->>'invite_token'
    AND invitation_type = (_meta->>'invite_type')::invitation_type;
  IF NOT FOUND OR _inv.status <> 'pending' OR _inv.expires_at <= now() OR lower(_inv.email) <> lower(_email) THEN
    RETURN NULL;
  END IF;
  RETURN json_build_object('type', _inv.invitation_type, 'token', _inv.token);
END; $$;

REVOKE EXECUTE ON FUNCTION public.my_organization() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.create_my_organization(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_organization_profile(UUID, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.my_pending_invite() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_organization() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_my_organization(TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_organization_profile(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_pending_invite() TO authenticated;