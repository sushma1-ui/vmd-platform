from PIL import Image
import os, re

ROOT = r"D:\VDM\vmd-platform-v6\vmd-platform"
BASE = os.path.join(ROOT, "apps", "web", "public", "Success Stories")
PUBLIC = os.path.join(ROOT, "apps", "web", "public")
OUT_PREVIEW = os.path.join(PUBLIC, "success-stories", "preview")
OUT_FULL = os.path.join(PUBLIC, "success-stories", "full")
os.makedirs(OUT_PREVIEW, exist_ok=True)
os.makedirs(OUT_FULL, exist_ok=True)

def slugify(s):
    s = os.path.splitext(s)[0]
    s = re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-").lower()
    return re.sub(r"-+", "-", s)

SUB = {"485": "Temporary Graduate", "500": "Student", "189": "Skilled Independent",
       "190": "Skilled Nominated", "491": "Skilled Work Regional", "482": "Skills in Demand"}

def subclass_of(text):
    m = re.search(r"(?:SC)?(485|500|189|190|491|482)", text)
    return m.group(1) if m else None

def occupation_of(name):
    n = name.replace("_", " ")
    for occ in ["Community Worker", "CommunityWorker", "Chef & Cook", "Accountant", "Engineering Technologist"]:
        if occ.lower() in n.lower():
            return occ.replace("CommunityWorker", "Community Worker")
    return ""

def process(src, group):
    im = Image.open(src).convert("RGB"); w, h = im.size
    base = os.path.basename(src)
    slug = (slugify(group) + "-" if group else "") + slugify(base)
    pw = 700; ph = round(h * pw / w)
    im.resize((pw, ph), Image.LANCZOS).save(os.path.join(OUT_PREVIEW, slug + ".webp"), "WEBP", quality=80, method=6)
    fw = min(1100, w); fh = round(h * fw / w)
    im.resize((fw, fh), Image.LANCZOS).save(os.path.join(OUT_FULL, slug + ".webp"), "WEBP", quality=82, method=6)
    return {"slug": slug, "preview": "/success-stories/preview/%s.webp" % slug,
            "full": "/success-stories/full/%s.webp" % slug, "w": pw, "h": ph}

grants = []; skills = []
vg = os.path.join(BASE, "Visa Grants")
for group in sorted(os.listdir(vg)):
    gp = os.path.join(vg, group)
    if not os.path.isdir(gp):
        continue
    for f in sorted(os.listdir(gp)):
        if not f.lower().endswith(".png"):
            continue
        d = process(os.path.join(gp, f), group)
        sc = subclass_of(f) or subclass_of(group)
        d.update({"category": "visa-grant", "group": group,
                  "label": ("Subclass %s" % sc) if sc else group, "sub": SUB.get(sc, ""),
                  "alt": "Visa grant graphic — %s%s. Client details redacted." % (
                      ("Subclass %s" % sc) if sc else group, (" (%s)" % SUB.get(sc, "")) if SUB.get(sc, "") else "")})
        grants.append(d)

sa = os.path.join(BASE, "Skills Assessment")
for f in sorted(os.listdir(sa)):
    if not f.lower().endswith(".png"):
        continue
    d = process(os.path.join(sa, f), None)
    occ = occupation_of(f)
    d.update({"category": "skills-assessment", "group": "Skills Assessment",
              "label": occ or "Skills assessment", "sub": "",
              "alt": "Skills assessment graphic%s. Client details redacted." % ((" — %s" % occ) if occ else "")})
    skills.append(d)

def esc(s):
    return s.replace("\\", "\\\\").replace("'", "\\'")

def emit(arr):
    out = []
    for d in arr:
        out.append("  { slug: '%s', category: '%s', group: '%s', label: '%s', sub: '%s', preview: '%s', full: '%s', width: %d, height: %d, alt: '%s' }," % (
            d["slug"], d["category"], esc(d["group"]), esc(d["label"]), esc(d["sub"]), d["preview"], d["full"], d["w"], d["h"], esc(d["alt"])))
    return "\n".join(out)

ts = (
"// AUTO-GENERATED from public/Success Stories/** — real, consented, privacy-safe\n"
"// client graphics (client names are redacted in-image). Re-run the optimiser\n"
"// after adding files; do not edit by hand.\n"
"export interface SuccessMedia {\n"
"  slug: string;\n"
"  category: 'visa-grant' | 'skills-assessment';\n"
"  group: string;\n"
"  label: string;\n"
"  sub: string;\n"
"  preview: string;\n"
"  full: string;\n"
"  width: number;\n"
"  height: number;\n"
"  alt: string;\n"
"}\n"
"export const VISA_GRANTS: SuccessMedia[] = [\n" + emit(grants) + "\n];\n"
"export const SKILLS_ASSESSMENTS: SuccessMedia[] = [\n" + emit(skills) + "\n];\n"
)
open(os.path.join(ROOT, "apps", "web", "src", "lib", "successMedia.ts"), "w", encoding="utf-8").write(ts)

pv = sum(os.path.getsize(os.path.join(OUT_PREVIEW, f)) for f in os.listdir(OUT_PREVIEW))
fl = sum(os.path.getsize(os.path.join(OUT_FULL, f)) for f in os.listdir(OUT_FULL))
print("grants", len(grants), "skills", len(skills))
print("preview total KB", round(pv/1024), "full total KB", round(fl/1024))
print("labels:", sorted(set(g["label"] + ("|" + g["sub"] if g["sub"] else "") for g in grants)))
print("skills labels:", [s["label"] for s in skills])
print("manifest written")
