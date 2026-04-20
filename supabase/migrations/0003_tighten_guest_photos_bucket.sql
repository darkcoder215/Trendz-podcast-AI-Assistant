-- Drop the broad SELECT policy on guest-photos. The bucket is already public
-- (public=true), so individual object URLs continue to work via
-- storage.getPublicUrl(); removing the policy just prevents clients from
-- listing/enumerating every uploaded file.
drop policy if exists "guest photos public read" on storage.objects;
