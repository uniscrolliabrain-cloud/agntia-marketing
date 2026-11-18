#!/usr/bin/env python3
"""Real PostgreSQL tests against unchanged Agntia Marketing migrations.
All SQL/data/connections are confined to this disposable local cluster.
The SKIP LOCKED SQL below is a LAB SPECIMEN, not an implemented product worker.
"""
import os,json,pathlib,subprocess,time,select,hashlib,sys
ROOT=pathlib.Path(os.environ.get('MKT_PG_LAB',str(pathlib.Path(__file__).resolve().parent))).resolve()
BIN=ROOT/'pgsql/bin'; E=ROOT/'evidence'; E.mkdir(exist_ok=True)
SOURCE=pathlib.Path(os.environ.get('MKT_REVIEW_SOURCE','/workspace/reviews/agntia-marketing-1a848a4'))
DB='mkt_original'; ADMIN='lab_admin'; API='mkt_api_test'; WORKER='mkt_worker_test'
PGHOST=str(ROOT/'socket'); PGPORT='55432'; RESULTS=[]; SERIAL=0
ENV={**os.environ,'PGHOST':PGHOST,'PGPORT':PGPORT,'PGCONNECT_TIMEOUT':'5'}

def sql(query,role=ADMIN,db=DB,expect_ok=True):
 global SERIAL
 SERIAL+=1
 if role=='anon':
  query='SET ROLE anon;'+query
 cmd=[str(BIN/'psql'),'-X','-qAt','-v','ON_ERROR_STOP=1','-v','VERBOSITY=verbose','-U',ADMIN if role=='anon' else role,'-d',db,'-c',query]
 r=subprocess.run(cmd,env=ENV,text=True,capture_output=True,timeout=15)
 (E/f'sql-{SERIAL:03d}.json').write_text(json.dumps({'role':role,'database':db,'sql':query,'exit_code':r.returncode,'stdout':r.stdout,'stderr':r.stderr},indent=2))
 if expect_ok and r.returncode:raise AssertionError(r.stderr)
 return r

def scoped(query,tenant='tenant_a',role=API,expect_ok=True):
 return sql(f"BEGIN; SET LOCAL app.tenant_id='{tenant}'; {query}; ROLLBACK;",role=role,expect_ok=expect_ok)

def check(name,fn,scope='MIGRATIONS_REAL_DB'):
 try:
  detail=fn();r={'name':name,'status':'PASS','scope':scope,'detail':detail}
 except Exception as ex:
  r={'name':name,'status':'FAIL','scope':scope,'detail':str(ex)}
 RESULTS.append(r);(E/'results.json').write_text(json.dumps({'source_sha':'1a848a49775407997a9550fbe58d27bcde222208','tests':RESULTS},indent=2));print(json.dumps(r),flush=True)

def equal(actual,expected):
 assert actual==expected,f'expected={expected!r}, actual={actual!r}'
 return actual

def denied(query,tenant='tenant_a',role=API,state='42501'):
 r=scoped(query,tenant,role,expect_ok=False)
 assert r.returncode!=0,'SQL succeeded but was required to reject'
 assert state in r.stderr,r.stderr
 return {'sqlstate':state,'exit_code':r.returncode}

def contact_insert(tenant,id):
 return f"INSERT INTO contacts(tenant_id,id,email_ref,country,locale,lifecycle_stage,interest_topic) VALUES('{tenant}','{id}','synthetic-ref','ES','es','lead','synthetic')"

def intent_insert(id,subject=None,operation=None,extra=''):
 return "INSERT INTO outbound_intents(tenant_id,id,operation_key,campaign_id,subject_ref,channel,payload_hash,approval_ref,audience_snapshot_id,eligibility_ref,state) VALUES("+f"'tenant_a','{id}','{operation or id}','campaign_a','{subject or id}','email','synthetic-hash','approval_a','snapshot_a','synthetic-evidence','queued')"+extra

# The cluster is dedicated to this review. Never use a production DSN.
assert pathlib.Path(PGHOST).is_dir()
sql("CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE mkt_api_test LOGIN INHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS; CREATE ROLE mkt_worker_test LOGIN INHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS; CREATE ROLE mkt_owner_test LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS; GRANT authenticated TO mkt_api_test,mkt_worker_test;",db='postgres')
sql('CREATE DATABASE '+DB,db='postgres')
for filename in ['0001_schema.sql','0002_rls.sql']:
 path=SOURCE/'db/migrations'/filename
 r=subprocess.run([str(BIN/'psql'),'-X','-U',ADMIN,'-d',DB,'-v','ON_ERROR_STOP=1','--single-transaction','-f',str(path)],env=ENV,text=True,capture_output=True,timeout=20)
 (E/(filename+'.log')).write_text(r.stdout+'\n'+r.stderr)
 assert r.returncode==0,r.stderr
 RESULTS.append({'name':'apply_'+filename,'status':'PASS','scope':'MIGRATIONS_REAL_DB','sha256':hashlib.sha256(path.read_bytes()).hexdigest()})

sql("""
INSERT INTO tenants(id,name,plan) VALUES('tenant_a','Synthetic tenant A','sandbox'),('tenant_b','Synthetic tenant B','sandbox');
INSERT INTO memberships(tenant_id,actor_id,roles,scopes) VALUES('tenant_a','actor_api',ARRAY['operator'],ARRAY['marketing.read']),('tenant_b','actor_b',ARRAY['operator'],ARRAY['marketing.read']);
INSERT INTO contacts(tenant_id,id,email_ref,country,locale,lifecycle_stage,interest_topic,suppressed) VALUES('tenant_a','contact_a','ref_a','ES','es','lead','growth',true),('tenant_b','contact_b','ref_b','ES','es','lead','growth',false);
INSERT INTO briefs(tenant_id,id,version,status,body) VALUES('tenant_a','brief_a',1,'accepted','{}'),('tenant_b','brief_b',1,'accepted','{}');
INSERT INTO audience_snapshots(tenant_id,id,rule_hash,rule,member_refs,eligible_count,excluded_count,members_hash,policy_version,source_watermark,expires_at) VALUES('tenant_a','snapshot_a','h','{}','[]',1,0,'h','p1',1,now()+interval '1 day'),('tenant_b','snapshot_b','h','{}','[]',1,0,'h','p1',1,now()+interval '1 day');
INSERT INTO creatives(tenant_id,id,revision,body,hash) VALUES('tenant_a','creative_a',1,'{}','h'),('tenant_b','creative_b',1,'{}','h');
INSERT INTO approvals(tenant_id,approval_ref,approver_actor_id,approver_is_human,revision_hash,audience_max_hash,purpose,channel,cost_ceiling_amount,cost_ceiling_currency,policy_version,expires_at) VALUES('tenant_a','approval_a','reviewer_a',true,'h','h','marketing','email',1,'EUR','p1',now()+interval '1 day'),('tenant_b','approval_b','reviewer_b',true,'h','h','marketing','email',1,'EUR','p1',now()+interval '1 day');
INSERT INTO campaigns(tenant_id,id,name,brief_id,channel,revision,audience_snapshot_id,creative_id,approval_ref,cost_ceiling_amount,cost_ceiling_currency,state,version) VALUES('tenant_a','campaign_a','Synthetic A','brief_a','email',1,'snapshot_a','creative_a','approval_a',1,'EUR','queued',1),('tenant_b','campaign_b','Synthetic B','brief_b','email',1,'snapshot_b','creative_b','approval_b',1,'EUR','queued',1);
INSERT INTO outbound_intents(tenant_id,id,operation_key,campaign_id,subject_ref,channel,payload_hash,approval_ref,audience_snapshot_id,eligibility_ref,state) VALUES('tenant_a','confirmed_a','confirmed_key','campaign_a','contact_a','email','h','approval_a','snapshot_a','proof','confirmed'),('tenant_b','queued_b','queued_b','campaign_b','contact_b','email','h','approval_b','snapshot_b','proof','queued');
INSERT INTO receipts(tenant_id,id,intent_id,provider,remote_id,state) VALUES('tenant_a','receipt_a','confirmed_a','sandbox','synthetic_remote_a','accepted');
INSERT INTO audit_log(tenant_id,actor_id,action,detail) VALUES('tenant_a','actor_api','synthetic','preserve me');
ALTER TABLE contacts OWNER TO mkt_owner_test;
""")
check('roles_are_not_superuser_or_bypassrls',lambda:equal(sql("SELECT bool_and(NOT rolsuper AND NOT rolbypassrls AND NOT rolcreaterole) FROM pg_roles WHERE rolname IN ('mkt_api_test','mkt_worker_test','mkt_owner_test')").stdout.strip(),'t'))
check('api_reads_only_tenant_a_contacts',lambda:equal(scoped('SELECT string_agg(tenant_id,\',\') FROM contacts').stdout.strip(),'tenant_a'))
check('worker_reads_only_tenant_b_contacts',lambda:equal(scoped('SELECT string_agg(tenant_id,\',\') FROM contacts','tenant_b',WORKER).stdout.strip(),'tenant_b'))
check('missing_tenant_reads_zero',lambda:equal(sql('SELECT count(*) FROM contacts',role=API).stdout.strip(),'0'))
check('empty_tenant_reads_zero',lambda:equal(sql("BEGIN;SET LOCAL app.tenant_id='';SELECT count(*) FROM contacts;ROLLBACK",role=API).stdout.strip(),'0'))
check('set_local_tenant_does_not_leak_after_commit',lambda:equal(sql("BEGIN;SET LOCAL app.tenant_id='tenant_a';SELECT count(*) FROM contacts;COMMIT;SELECT count(*) FROM contacts",role=API).stdout.strip(),'1\n0'))
check('force_rls_applies_to_non_superuser_table_owner',lambda:equal(scoped('SELECT string_agg(tenant_id,\',\') FROM contacts',role='mkt_owner_test').stdout.strip(),'tenant_a'))
check('anon_cannot_read_contacts',lambda:denied('SELECT * FROM contacts',role='anon'))
check('insert_other_tenant_rejected',lambda:denied(contact_insert('tenant_b','intruder')))
check('update_row_tenant_rejected',lambda:denied("UPDATE contacts SET tenant_id='tenant_b' WHERE id='contact_a'"))
check('update_other_tenant_affects_zero',lambda:equal(scoped("WITH changed AS(UPDATE contacts SET country='FR' WHERE tenant_id='tenant_b' RETURNING id)SELECT count(*)FROM changed").stdout.strip(),'0'))
check('delete_other_tenant_affects_zero',lambda:equal(scoped("WITH changed AS(DELETE FROM contacts WHERE tenant_id='tenant_b' RETURNING id)SELECT count(*)FROM changed").stdout.strip(),'0'))

# Check isolation on every tenant_id table, rather than a contacts-only proxy.
tables=sql("SELECT table_name FROM information_schema.columns WHERE table_schema='public' AND column_name='tenant_id' ORDER BY table_name").stdout.splitlines()
def all_tables():
 for role,tenant in [(API,'tenant_a'),(WORKER,'tenant_b')]:
  for table in tables:
   equal(scoped(f"SELECT count(*) FROM {table} WHERE tenant_id <> '{tenant}'",tenant,role).stdout.strip(),'0')
 return {'tables':len(tables),'roles':2,'cross_tenant_rows':0}
check('all_tenant_id_tables_isolate_both_roles',all_tables)
check('tenant_directory_does_not_reveal_other_tenant',lambda:equal(scoped("SELECT count(*) FROM tenants WHERE id<>'tenant_a'").stdout.strip(),'0'))

for col,other in [('brief_id','brief_b'),('audience_snapshot_id','snapshot_b'),('creative_id','creative_b'),('approval_ref','approval_b')]:
 check('campaign_fk_'+col+'_rejects_cross_tenant',lambda col=col,other=other:denied(f"UPDATE campaigns SET {col}='{other}' WHERE id='campaign_a'",state='23503'))
check('intent_campaign_fk_rejects_cross_tenant',lambda:denied("UPDATE outbound_intents SET campaign_id='campaign_b' WHERE id='confirmed_a'",state='23503'))
check('receipt_intent_fk_rejects_cross_tenant',lambda:denied("UPDATE receipts SET intent_id='queued_b' WHERE id='receipt_a'",state='23503'))
# These must reject invalid graph edges, even when the parent exists in another tenant.
check('intent_approval_fk_rejects_cross_tenant',lambda:denied("UPDATE outbound_intents SET approval_ref='approval_b' WHERE id='confirmed_a'",state='23503'))
check('intent_snapshot_fk_rejects_cross_tenant',lambda:denied("UPDATE outbound_intents SET audience_snapshot_id='snapshot_b' WHERE id='confirmed_a'",state='23503'))
check('intent_subject_fk_rejects_cross_tenant',lambda:denied("UPDATE outbound_intents SET subject_ref='contact_b' WHERE id='confirmed_a'",state='23503'))
check('application_can_append_audit_with_generated_sequence',lambda:scoped("INSERT INTO audit_log(tenant_id,actor_id,action,detail)VALUES('tenant_a','actor_api','synthetic_append','expected allowed')").stdout.strip())
check('audit_log_cannot_be_updated_by_application_role',lambda:denied("UPDATE audit_log SET detail='rewritten'"))
check('audit_log_cannot_be_deleted_by_worker_role',lambda:denied('DELETE FROM audit_log',role=WORKER))
check('membership_role_cannot_be_self_escalated_by_data_role',lambda:denied("UPDATE memberships SET roles=ARRAY['owner'],scopes=ARRAY['marketing.*'] WHERE actor_id='actor_api'"))
check('duplicate_operation_key_rejected',lambda:denied(intent_insert('duplicate','duplicate','confirmed_key'),state='23505'))

def transaction_rollback():
 r=sql("BEGIN;SET LOCAL app.tenant_id='tenant_a';INSERT INTO approvals(tenant_id,approval_ref,approver_actor_id,approver_is_human,revision_hash,audience_max_hash,purpose,channel,cost_ceiling_amount,cost_ceiling_currency,policy_version,expires_at) VALUES('tenant_a','approval_rollback','reviewer',true,'h','h','marketing','email',1,'EUR','p1',now()+interval '1 day');"+intent_insert('invalid_parent').replace("'campaign_a'","'missing_campaign'")+";COMMIT",role=API,expect_ok=False)
 assert r.returncode and '23503' in r.stderr
 equal(sql("SELECT count(*)FROM approvals WHERE approval_ref='approval_rollback'").stdout.strip(),'0')
 return {'sqlstate':'23503','partial_approval_rows':0}
check('failed_transaction_leaves_no_partial_approval',transaction_rollback,'POSTGRES_TRANSACTION_PRIMITIVE')

CLAIM="""WITH candidate AS (
 SELECT tenant_id,id FROM outbound_intents
 WHERE tenant_id='tenant_a' AND state='queued' AND id LIKE 'race_%'
 ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 1
) UPDATE outbound_intents AS i SET state='leased',lease_fence=i.lease_fence+1,
 attempts=i.attempts+1,updated_at=now()
 FROM candidate AS c WHERE i.tenant_id=c.tenant_id AND i.id=c.id
 RETURNING i.id,i.lease_fence"""
(E/'claim-specimen.sql').write_text('-- LAB SPECIMEN ONLY: not currently wired in product worker\n'+CLAIM+';\n')
def concurrency(single):
 sql("DELETE FROM outbound_intents WHERE id LIKE 'race_%';"+intent_insert('race_1')+';'+('' if single else intent_insert('race_2')+';'))
 query="BEGIN;SET LOCAL app.tenant_id='tenant_a';"+CLAIM+";SELECT pg_sleep(2);COMMIT;"
 p=subprocess.Popen([str(BIN/'psql'),'-X','-qAt','-v','ON_ERROR_STOP=1','-U',WORKER,'-d',DB,'-c',query],env=ENV,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 try:
  ready,_,_=select.select([p.stdout],[],[],5);assert ready,'worker1 did not acquire lock in time'
  first=p.stdout.readline().strip();assert first=='race_1|1',first
  assert p.poll() is None,'worker1 transaction unexpectedly finished before competitor'
  started=time.monotonic();second=scoped(CLAIM.replace('RETURNING i.id,i.lease_fence','RETURNING i.id,i.lease_fence'),role=WORKER);elapsed=time.monotonic()-started
  # scoped() rolls back competitor: this still verifies lock exclusion, but commit
  # a separate contender below for the persisted two-row outcome.
  assert elapsed<1.5,f'contender blocked {elapsed}s'
  equal(second.stdout.strip(),'' if single else 'race_2|1')
  committed=sql("BEGIN;SET LOCAL app.tenant_id='tenant_a';"+CLAIM+';COMMIT',role=WORKER).stdout.strip()
  equal(committed,'' if single else 'race_2|1')
  rest,err=p.communicate(timeout=6);assert p.returncode==0,err
  rows=sql("SELECT id||'|'||state||'|'||attempts FROM outbound_intents WHERE id LIKE 'race_%' ORDER BY id").stdout.strip()
  equal(rows,'race_1|leased|1' if single else 'race_1|leased|1\nrace_2|leased|1')
  return {'first':first,'competing_result':committed,'competing_seconds':round(elapsed,4),'persisted':rows,'external_sends':0}
 finally:
  if p.poll() is None:p.terminate();p.communicate(timeout=5)
check('skip_locked_two_connections_one_intent',lambda:concurrency(True),'LAB_SQL_SPECIMEN_NOT_PRODUCT_WORKER')
check('skip_locked_two_connections_make_disjoint_progress',lambda:concurrency(False),'LAB_SQL_SPECIMEN_NOT_PRODUCT_WORKER')

# Transactional DDL test: source migration text is unchanged, caller supplies -1.
def ddl_rollback():
 sql('CREATE DATABASE mkt_ddl_rollback',db='postgres')
 text=(SOURCE/'db/migrations/0001_schema.sql').read_text()+"\nDO $$ BEGIN RAISE EXCEPTION 'synthetic migration failure'; END $$;"
 path=E/'migration-failure-specimen.sql';path.write_text(text)
 r=subprocess.run([str(BIN/'psql'),'-X','-U',ADMIN,'-d','mkt_ddl_rollback','-v','ON_ERROR_STOP=1','--single-transaction','-f',str(path)],env=ENV,text=True,capture_output=True,timeout=15)
 (E/'migration-failure.log').write_text(r.stdout+r.stderr);assert r.returncode!=0
 equal(sql("SELECT count(*)FROM information_schema.tables WHERE table_schema='public'",db='mkt_ddl_rollback').stdout.strip(),'0')
 return {'failure_exit_code':r.returncode,'tables_after_rollback':0,'transaction_wrapper':'harness --single-transaction'}
check('injected_migration_failure_rolls_back_ddl',ddl_rollback,'POSTGRES_TRANSACTION_PRIMITIVE')

def dump_restore():
 sql("UPDATE approvals SET revoked_at=now() WHERE tenant_id='tenant_a' AND approval_ref='approval_a'")
 archive=E/'synthetic-backup.dump'
 r=subprocess.run([str(BIN/'pg_dump'),'-U',ADMIN,'-d',DB,'-Fc','-f',str(archive)],env=ENV,text=True,capture_output=True,timeout=30);assert r.returncode==0,r.stderr
 sql('CREATE DATABASE mkt_restored',db='postgres')
 r=subprocess.run([str(BIN/'pg_restore'),'-U',ADMIN,'-d','mkt_restored','--exit-on-error',str(archive)],env=ENV,text=True,capture_output=True,timeout=30);(E/'restore.log').write_text(r.stdout+r.stderr);assert r.returncode==0,r.stderr
 checks={}
 for name,query in {'suppressed':"SELECT suppressed FROM contacts WHERE tenant_id='tenant_a' AND id='contact_a'",'revoked':"SELECT revoked_at IS NOT NULL FROM approvals WHERE tenant_id='tenant_a' AND approval_ref='approval_a'",'confirmed':"SELECT state FROM outbound_intents WHERE tenant_id='tenant_a' AND id='confirmed_a'",'receipts':"SELECT count(*)FROM receipts WHERE tenant_id='tenant_a'",'audit':"SELECT detail FROM audit_log WHERE tenant_id='tenant_a'"}.items():
  checks[name]=equal(sql(query,db='mkt_restored').stdout.strip(),sql(query).stdout.strip())
 equal(sql("BEGIN;SET LOCAL app.tenant_id='tenant_a';SELECT count(*)FROM contacts WHERE tenant_id<>'tenant_a';ROLLBACK",role=API,db='mkt_restored').stdout.strip(),'0')
 return {'restored':checks,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'worker_executed':False}
check('native_dump_restore_preserves_suppression_revocation_receipt_and_rls',dump_restore,'NATIVE_BACKUP_NOT_PRODUCT_RESTORE_WORKFLOW')

summary={'source_sha':'1a848a49775407997a9550fbe58d27bcde222208','postgres_version':sql('SELECT version()').stdout.strip(),'tests':RESULTS,'totals':{'passed':sum(x['status']=='PASS'for x in RESULTS),'failed':sum(x['status']=='FAIL'for x in RESULTS)},'product_worker_postgres':'NOT_IMPLEMENTED','product_gates_auto_promoted':0}
(E/'results.json').write_text(json.dumps(summary,indent=2));print(json.dumps(summary['totals']),flush=True)
sys.exit(1 if summary['totals']['failed'] else 0)
