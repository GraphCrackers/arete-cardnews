# 폰트 라이선스 확인 기록

확인일: **2026-09-10**. 이 저장소는 공개다 — 폰트 파일을 여기 두는 것은 **재배포**에 해당한다.
그래서 다섯 개를 하나씩 확인했다.

**웹페이지 설명이 아니라 폰트 파일에 박힌 라이선스 고지(name table ID 13)를 근거로 삼았다.**
배포처 페이지는 요약이거나 틀릴 수 있고, 파일 안의 고지가 실제로 따라다니는 조항이다.

| 폰트 | 라이선스 | 재배포 | 이 저장소에 | 굵기 |
|---|---|---|---|---|
| Pretendard | SIL OFL 1.1 | 가능 | **있음** | 9종 (100–900) |
| Paperlogy | SIL OFL 1.1 | 가능 | **있음** | 9종 (100–900) |
| SUIT | SIL OFL 1.1 | 가능 | **있음** | 9종 (100–900) |
| Gmarket Sans | eBay Korea 자체 | 가능 | **있음** | 3종 (300·500·700) |
| **Noto Serif KR** | SIL OFL 1.1 | 가능 | **있음** | 4종 (300·400·600·700) |
| **Cormorant Garamond** | SIL OFL 1.1 | 가능 | **있음** | 5종 (300–700) |
| MBK Corporate | 자체 | **불가** | **넣지 않는다** | — |

아래 둘은 **브랜드 서체**다 (gc-system CLAUDE.md §5 — Cormorant Garamond + Noto Serif KR).
2026-09-10 에 에디터에서 고를 수 있도록 추가했다.

라이선스 전문은 `Pretendard-OFL.txt` · `Paperlogy-OFL.txt` · `SUIT-OFL.txt` ·
`GmarketSans-LICENSE.txt` · `NotoSerifKR-OFL.txt` · `CormorantGaramond-OFL.txt` 로 같이 둔다. **OFL은 재배포 시 전문 동봉을 요구한다. 지우지 않는다.**

---

## ⚠ 받을 때 주의 — 가짜 SUIT 저장소가 있다

SUIT을 받다가 발견했다. 검색 결과 상위에 뜨는 **`github.com/sunn-us/SUIT` 은 진짜가 아니다.**

- 별 **0개**, 설명은 "SUIT project" 한 줄, 폰트 파일이 하나도 없다
- 그 안의 `fonts/static/woff2/SUIT.css` 는 폰트 CSS가 아니라 **추적 픽셀**이다:
  `body { background-image: url("https://sunnamemicrosystems.free.beeceptor.com/pixel.png"); }`
  (beeceptor 는 요청을 가로채 기록하는 서비스다. 저 CSS를 링크한 페이지는 열릴 때마다
  그쪽으로 신호를 보내게 된다)

**진짜는 `github.com/sun-typeface/SUIT` 다** — 별 310개, `LICENSE` 있음, 실제 폰트 파일 있음.
이 저장소의 SUIT은 진짜 쪽에서 받았고, 받은 파일마다 매직바이트(`wOF2`)와
내부 이름·라이선스를 확인했다.

**폰트를 추가로 받을 일이 생기면 저장소 주소를 반드시 확인한다.** 이름이 비슷한 가짜가 있다.

---

## MBK — 넣으면 안 된다

메르세데스 벤츠 코리아 한글체다. 이용범위는 넓지만(인쇄·웹·임베딩·BI/CI 모두 허용)
**파일 재배포를 명시적으로 금지**한다. 산돌클라우드 배포 페이지의 라이선스 원문:

> "MBK 서체는 어떠한 이유로든 수정 및 재배포를 할 수 없으며, 배포되는 형태 그대로 사용해야 합니다."

> "MBK 서체를 유료로 판매하거나, 복사 및 배포의 대가로 요금을 부과하거나 수령할 수 없습니다."

**그래서 이 저장소에 MBK 파일은 없고, 앞으로도 넣지 않는다.**
에디터의 `famOf()` 는 `mbk` 인식을 그대로 두었다. MBK를 쓰려면
**각자 자기 맥에 설치한 뒤 에디터의 "폰트 폴더 불러오기"로 그때그때 올린다.**
그렇게 쓰는 것은 재배포가 아니라 사용이므로 허용 범위 안이다.

## Gmarket Sans — OFL 이 아니다

공식 페이지(corp.gmarket.com/fonts)는 'SIL Open Font License' 라고 안내하지만
**파일에 박힌 조항은 eBay Korea 자체 라이선스**다. 전문은 `GmarketSans-LICENSE.txt` 에 있다.

> 가능: 상업적 목적의 사용 (사용범위: 인쇄물, 광고물, 온라인, 영상 포함 **수정 및 배포**)
> 불가능: 서브라이선스, 단독판매, 상표권 이용

어느 쪽으로 읽어도 **배포는 허용**되므로 저장소에 두는 데 문제가 없다.
다만 OFL이라고 적어 두면 나중에 틀린 근거가 되므로 여기 적어 둔다.

**굵기가 Light·Medium·Bold 3종뿐이다.** 공식 배포본에 그것밖에 없다.

---

## 브랜드 서체 — 직접 깎아 넣었다

Noto Serif KR 과 Cormorant Garamond 는 구글 폰트에 **가변폰트로만** 있다.
에디터의 `weightOf()` 는 파일명에서 굵기를 읽으므로 가변폰트를 그대로 넣으면 400 하나가 된다.
그래서 `fontTools.varLib.instancer` 로 굵기별 **static 인스턴스를 뽑아** 넣었다.

**Noto Serif KR 은 한글로 서브셋했다.** 원본이 24,910자(한자 포함) 23.8MB 라 그대로는 못 쓴다.
남긴 범위:

- 한글 음절 전체 `U+AC00–D7A3` (11,172자 — 현대 한국어는 다 된다)
- 한글 자모, 라틴, 구두점, CJK 구두점(「」『』·), 전각기호, 화살표·도형

굵기당 1.2MB 로 줄었다. **한자는 뺐다.** 카드뉴스에 한자를 쓸 일이 생기면 그때 다시 만든다
(⺀ 같은 글자가 두부(□)로 보이면 이것 때문이다).

만든 명령은 이 파일 아래 「다시 만드는 법」에 있다.

---

## 파일 형식 — 왜 woff2 인가

원본(.otf/.ttf)으로 넣으면 30개에 약 27MB다. 에디터는 `index.json` 의 파일을
**페이지를 열 때 전부 받는다.** woff2로 변환해 **11.4MB** 로 줄였고 원본은 두지 않는다.
형식 변환은 OFL과 Gmarket 조항 모두 허용하는 범위다(둘 다 수정·배포 허용).

같이 고친 것: `loadFontManifest()` 가 파일을 하나씩 순차로 `await` 하고 있었다. 병렬로 바꿨다.

**가변폰트(Variable)를 넣으면 안 된다.** 에디터의 `weightOf()` 는 **파일명**에서 굵기를 읽으므로
`SUIT-Variable.ttf` 같은 파일은 굵기 400 하나로만 등록된다. 반드시 굵기별 static 파일을 쓴다.

**전부 다 받지는 않는다.** 총 39개 16.7MB 지만, 에디터는 `document.fonts.add()` 로
**등록만 하고 실제 내려받기는 그 글꼴이 화면에 쓰일 때까지 미룬다.**
기본 상태로 열면 실제로 받는 것은 Pretendard 3~4개뿐이고, 다른 서체를 고르는 순간 그것만 받는다.
(PNG 내보내기 직전에는 `ensureFonts()` 가 그 카드에 필요한 것을 강제로 받아 둔다.
 지연 로딩이라 화면에 안 쓰인 굵기가 빠질 수 있어서다.)

**더 줄이려면** Thin(100)·ExtraLight(200)을 지운다. 약 1.9MB가 줄고,
카드뉴스 크기에서 그 두 굵기는 거의 쓰지 않는다.

---

## 다시 만드는 법 (브랜드 서체)

```bash
pip install fonttools brotli
# 원본: https://github.com/google/fonts/tree/main/ofl/notoserifkr
#       https://github.com/google/fonts/tree/main/ofl/cormorantgaramond
```

```python
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

HANGUL = ("U+0020-007E,U+00A0-00FF,U+2000-206F,U+20A9,U+20AC,"
          "U+3000-303F,U+1100-11FF,U+3130-318F,U+A960-A97F,U+D7B0-D7FF,"
          "U+AC00-D7A3,U+FF01-FF5E,U+2190-2193,U+25A0-25FF,U+2600-26FF")

def build(src, out, wght, unicodes=None):
    f = instancer.instantiateVariableFont(TTFont(src), {'wght': wght})
    f.save('_t.ttf'); f.close()
    o = subset.Options(); o.set(layout_features='*', notdef_outline=True)
    o.flavor = 'woff2'
    font = subset.load_font('_t.ttf', o)
    s = subset.Subsetter(options=o)
    s.populate(unicodes=subset.parse_unicodes(unicodes) if unicodes
               else [c for c in font.getBestCmap()])
    s.subset(font); subset.save_font(font, out, o)

# 파일명이 곧 굵기다. weightOf() 가 이름에서 읽는다 — 이름을 바꾸면 굵기가 틀어진다
for w, n in [(300,'Light'),(400,'Regular'),(600,'SemiBold'),(700,'Bold')]:
    build('NotoSerifKR[wght].ttf', f'NotoSerifKR-{n}.woff2', w, HANGUL)
for w, n in [(300,'Light'),(400,'Regular'),(500,'Medium'),(600,'SemiBold'),(700,'Bold')]:
    build('CormorantGaramond[wght].ttf', f'CormorantGaramond-{n}.woff2', w)
```

그리고 `index.json` 을 다시 만든다 (에디터의 「폰트 목록 index.json 내보내기」 버튼도 같은 일을 한다).

---

## 확인에 쓴 출처

- Pretendard — https://github.com/orioncactus/pretendard
- Paperlogy — https://freesentation.blog/paperlogyfont (미러: github.com/fonts-archive/Paperlogy)
- SUIT — https://github.com/sun-typeface/SUIT ← **`sunn-us/SUIT` 아님. 위 경고 참고**
- Gmarket Sans — https://corp.gmarket.com/fonts/
- Noto Serif KR — https://github.com/google/fonts/tree/main/ofl/notoserifkr
- Cormorant Garamond — https://github.com/google/fonts/tree/main/ofl/cormorantgaramond
- MBK — https://www.sandollcloud.com/free-font/17898/MBKCorporateA
