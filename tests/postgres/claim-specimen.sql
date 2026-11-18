-- LAB SPECIMEN ONLY: not currently wired in product worker
WITH candidate AS (
 SELECT tenant_id,id FROM outbound_intents
 WHERE tenant_id='tenant_a' AND state='queued' AND id LIKE 'race_%'
 ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 1
) UPDATE outbound_intents AS i SET state='leased',lease_fence=i.lease_fence+1,
 attempts=i.attempts+1,updated_at=now()
 FROM candidate AS c WHERE i.tenant_id=c.tenant_id AND i.id=c.id
 RETURNING i.id,i.lease_fence;
