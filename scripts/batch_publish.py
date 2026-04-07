import json, time, urllib.request

BASE = "https://global-payroll-expert-platform.vercel.app"

countries = [
  ("GB","United Kingdom"),("US","United States"),("DE","Germany"),("FR","France"),
  ("AU","Australia"),("IE","Ireland"),("NL","Netherlands"),("BE","Belgium"),
  ("CA","Canada"),("DK","Denmark"),("SE","Sweden"),("NO","Norway"),
  ("IT","Italy"),("ES","Spain"),("PL","Poland"),("PT","Portugal"),
  ("SG","Singapore"),("CH","Switzerland"),("JP","Japan"),("AE","United Arab Emirates"),
]

content_types = [
  ("Country Report", "employer obligations employment law payroll tax framework and EOR considerations"),
  ("Tax Guide", "income tax corporate tax VAT employer tax obligations and filing deadlines"),
  ("EOR Guide", "employer of record structure employment relationship worker rights payroll under EOR and transition to direct employment"),
  ("Payroll Guide", "payroll frequency gross pay deductions employer contributions net pay payslip requirements and filing obligations"),
  ("Hiring Guide", "right to work employment contracts job advertising background checks onboarding and employer registration"),
  ("HR Compliance Guide", "employment contract compliance working time payroll compliance discrimination data protection health and safety and record keeping"),
  ("Leave and Benefits", "annual leave public holidays sick leave maternity paternity parental leave and mandatory benefits"),
  ("Compliance Calendar", "monthly quarterly and annual employer compliance obligations filing deadlines and penalties"),
]

# Add already published articles here as ("CC", "Content Type") to skip them
skip = {
  ("GB", "Country Report"), ("GB", "Tax Guide"), ("GB", "EOR Guide"),
  ("GB", "Payroll Guide"), ("GB", "Hiring Guide"), ("GB", "HR Compliance Guide"),
  ("GB", "Leave and Benefits"), ("GB", "Compliance Calendar"),
  ("US", "Country Report"), ("US", "Tax Guide"), ("US", "EOR Guide"),
  ("US", "Payroll Guide"), ("US", "Hiring Guide"), ("US", "HR Compliance Guide"),
  ("US", "Leave and Benefits"), ("US", "Compliance Calendar"),
  ("DE", "Country Report"), ("DE", "Tax Guide"), ("DE", "EOR Guide"),
  ("DE", "Payroll Guide"), ("DE", "Hiring Guide"), ("DE", "HR Compliance Guide"),
  ("DE", "Leave and Benefits"), ("DE", "Compliance Calendar"),
}

LOG_PATH = "/workspaces/HRLake-Platform/scripts/batch_log.txt"

log = open(LOG_PATH, "w")
success = 0
failed = 0
skipped = 0
total = len(countries) * len(content_types)
done = 0

for ct, topic_suffix in content_types:
  for cc, cn in countries:
    done += 1
    if (cc, ct) in skip:
      print(f"[{done}/{total}] SKIP {ct} - {cn}")
      skipped += 1
      continue

    topic = f"{cn} {topic_suffix}"
    print(f"[{done}/{total}] Generating {ct} - {cn}...", end=" ", flush=True)

    try:
      gen_payload = json.dumps({
        "site": "HRLake",
        "contentType": ct,
        "country": cn,
        "topic": topic,
        "tone": "Authoritative",
        "length": "standard"
      }).encode()

      req = urllib.request.Request(
        BASE + "/api/content-factory/generate",
        data=gen_payload,
        headers={"Content-Type": "application/json"},
        method="POST"
      )
      resp = urllib.request.urlopen(req, timeout=120)
      gen = json.loads(resp.read())

      if "content" not in gen:
        raise Exception(gen.get("error", "no content returned"))

      pub_payload = json.dumps({
        "site": "HRLake",
        "contentType": ct,
        "country": cc,
        "topic": topic,
        "content": gen["content"],
        "aiSummary": gen.get("aiSummary", ""),
        "keyTerms": gen.get("keyTerms", ""),
        "showOnSites": ["HRLake"],
        "canonicalOwner": "HRLake"
      }).encode()

      req2 = urllib.request.Request(
        BASE + "/api/content-factory/publish",
        data=pub_payload,
        headers={"Content-Type": "application/json"},
        method="POST"
      )
      resp2 = urllib.request.urlopen(req2, timeout=60)
      pub = json.loads(resp2.read())

      if pub.get("success"):
        content_len = len(gen["content"])
        doc_id = pub["documentId"]
        slug = pub["slug"]
        print(f"OK ({content_len} chars) ID:{doc_id}")
        log.write(f"OK|{ct}|{cc}|{cn}|{doc_id}|{slug}\n")
        log.flush()
        success += 1
      else:
        raise Exception(pub.get("error", "publish failed"))

    except Exception as e:
      print(f"FAILED: {e}")
      log.write(f"FAIL|{ct}|{cc}|{cn}|{e}\n")
      log.flush()
      failed += 1

    time.sleep(2)

log.close()
print(f"\nDONE: {success} published, {failed} failed, {skipped} skipped")
print(f"Log: {LOG_PATH}")
