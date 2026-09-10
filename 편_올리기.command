#!/bin/bash
# 카드뉴스 편 올리기 — 더블클릭으로 실행한다.
# 다운로드 폴더에서 방금 내보낸 편 JSON 을 찾아 projects/ 에 넣고 커밋까지 한다.
# 푸시는 GitHub Desktop 에서 [Push origin] 을 누른다.

cd "$(dirname "$0")" || exit 1
clear
echo "════════════════════════════════════════"
echo "  ARETE 카드뉴스 — 편 올리기"
echo "════════════════════════════════════════"
echo

python3 - <<'PY'
import json, os, glob, shutil, subprocess, time

REPO = os.getcwd()
DOWN = os.path.expanduser("~/Downloads")

# 1) 다운로드 폴더에서 최근 2시간 안에 받은 카드뉴스 JSON 을 찾는다
cands = []
for p in glob.glob(os.path.join(DOWN, "*.json")):
    if time.time() - os.path.getmtime(p) > 7200: continue
    try:
        d = json.load(open(p, encoding="utf-8"))
        if isinstance(d, dict) and isinstance(d.get("cards"), list) and d["cards"]:
            cands.append((os.path.getmtime(p), p, d))
    except Exception:
        pass

if not cands:
    print("다운로드 폴더에서 카드뉴스 파일을 못 찾았습니다.")
    print()
    print("확인할 것:")
    print("  · 편집기에서 [JSON 내보내기] 를 눌렀나요?")
    print("  · 받은 지 2시간이 넘지 않았나요?")
    raise SystemExit(1)

cands.sort(reverse=True)
_, src, data = cands[0]
name = data.get("name", "제목 없음")
pid  = os.path.splitext(os.path.basename(src))[0]

# 사파리는 같은 이름이 이미 있으면 뒤에 -2, -3 을 붙인다.
# 그대로 두면 resilience-2.json 이라는 엉뚱한 편이 생긴다. 떼어낸다.
import re
base = re.sub(r"[-_ ]\d+$", "", pid)
if base != pid and os.path.exists(os.path.join(REPO, "projects", base + ".json")):
    print(f"파일 이름이 {pid} 인데 -숫자는 사파리가 붙인 것입니다.")
    print(f"기존 편 {base} 를 고친 것으로 봅니다.")
    print()
    pid = base

print(f"찾았습니다 : {os.path.basename(src)}")
print(f"편 이름    : {name}")
print(f"카드       : {len(data['cards'])}장")
print()

dst = os.path.join(REPO, "projects", pid + ".json")
new = not os.path.exists(dst)
print(("새 편으로 추가합니다." if new else "기존 편을 덮어씁니다.") + f"  →  projects/{pid}.json")
print()
if input("진행할까요? (엔터 = 예 / n = 취소) ").strip().lower() == "n":
    print("취소했습니다."); raise SystemExit(1)

# 2) JSON 안에 통째로 들어간 이미지를 파일로 빼낸다
#    에디터에서 사진을 넣으면 base64 로 박혀서 JSON 이 수백 KB~수 MB 가 된다.
#    assets/img/ 로 빼고 경로만 남기면 파일이 작아지고 변경 내역도 읽을 수 있다.
import base64, re, hashlib
EXT = {"image/png":"png","image/jpeg":"jpg","image/webp":"webp",
       "image/gif":"gif","image/svg+xml":"svg"}
os.makedirs(os.path.join(REPO,"assets","img"), exist_ok=True)
moved = 0
for ci, c in enumerate(data.get("cards", [])):
    for e in c.get("els", []):
        v = e.get("src","")
        if not (isinstance(v,str) and v.startswith("data:")): continue
        m = re.match(r"data:([^;,]+);base64,(.*)$", v, re.S)
        if not m: continue
        raw = base64.b64decode(m.group(2))
        ext = EXT.get(m.group(1), "bin")
        fn  = f"{pid}-{ci+1:02d}-{hashlib.sha1(raw).hexdigest()[:8]}.{ext}"
        open(os.path.join(REPO,"assets","img",fn), "wb").write(raw)
        e["src"] = f"assets/img/{fn}"
        moved += 1
if moved:
    print(f"사진 {moved}개를 assets/img/ 로 빼냈습니다. (JSON 이 그만큼 가벼워집니다)")
    print()

# 3) 편 파일을 제자리에 넣는다
json.dump(data, open(dst,"w",encoding="utf-8"), ensure_ascii=False, indent=2)

# 4) 새 편이면 목록에 추가한다
idxp = os.path.join(REPO, "projects", "index.json")
idx = []
if os.path.exists(idxp):
    try: idx = json.load(open(idxp, encoding="utf-8"))
    except Exception: idx = []
idx = [x if isinstance(x, dict) else {"id": x, "title": x} for x in idx]
if not any(x.get("id") == pid for x in idx):
    idx.append({"id": pid, "title": name})
else:
    for x in idx:
        if x.get("id") == pid: x["title"] = name
json.dump(idx, open(idxp, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

# 5) 커밋
subprocess.run(["git", "add", "projects/", "assets/img/"], cwd=REPO, check=True)
r = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=REPO)
if r.returncode == 0:
    print("바뀐 내용이 없습니다. (같은 파일을 다시 올렸을 수 있어요)")
    raise SystemExit(0)
msg = f"카드뉴스: {name} ({'새 편' if new else '수정'})"
subprocess.run(["git", "commit", "-q", "-m", msg], cwd=REPO, check=True)

print()
print("커밋했습니다:", msg)
print()
print("────────────────────────────────────────")
print("마지막 한 단계:")
print("  GitHub Desktop 을 열고 [Push origin] 을 누르세요.")
print("  1~2분 뒤 팀원 화면에 반영됩니다.")
print("────────────────────────────────────────")
PY

echo
read -n 1 -s -r -p "아무 키나 누르면 창이 닫힙니다."
