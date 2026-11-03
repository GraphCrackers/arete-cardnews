#!/bin/sh
# 펜 그림 SVG 조각 → 배경 투명 PNG. 회복탄력성 편 졸라맨 화풍(검은 마커 선 + 거친 질감)을 입힌다.
# 사용: tools/pen.sh tools/pen/그림.svg assets/img/편-번호-해시.png 가로 세로
# 조각에는 <path>·<circle> 같은 도형만 쓴다. 선 굵기 기본 15, 색 #111, 끝 둥글게는 여기서 입힌다.
set -e
src=$1 out=$2 w=${3:-1000} h=${4:-1000}
chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
tmp=$(mktemp -d)
cat > "$tmp/p.html" <<EOF
<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:transparent}svg{display:block}</style>
<svg width="$w" height="$h" viewBox="0 0 $w $h" xmlns="http://www.w3.org/2000/svg">
<filter id="pen" x="-5%" y="-5%" width="110%" height="110%">
 <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="7" result="w"/>
 <feDisplacementMap in="SourceGraphic" in2="w" scale="9" xChannelSelector="R" yChannelSelector="G" result="a"/>
 <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="2" result="r"/>
 <feDisplacementMap in="a" in2="r" scale="3" xChannelSelector="R" yChannelSelector="G" result="b"/>
 <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="5" result="g"/>
 <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.75" result="ga"/>
 <feComposite in="b" in2="ga" operator="in"/>
</filter>
<g filter="url(#pen)" fill="none" stroke="#111" stroke-width="15" stroke-linecap="round" stroke-linejoin="round">
$(cat "$src")
</g></svg>
EOF
"$chrome" --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 \
  --window-size="$w,$h" --screenshot="$out" "file://$tmp/p.html" >/dev/null 2>&1
rm -rf "$tmp"
echo "$out"
