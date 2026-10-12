# 역할 일러스트 넣는 곳

이 폴더에 그림 파일을 넣으면, 코드로 그린 기본 초상 대신 그 그림이 금테 메달 안에 표시됩니다.
코드를 고칠 필요는 없고, 파일을 넣고 서버를 다시 띄우거나(로컬) 푸시하면(Render) 반영됩니다.

## 파일 이름

역할마다 아래 이름으로 넣습니다. 확장자는 `.webp`, `.png`, `.jpg` 중 아무거나 됩니다.
일부만 넣어도 되고, 없는 것은 기본 그림이 나옵니다.

| 파일 이름 | 내용 | 진영 | 비율 |
|---|---|---|---|
| `merlin` | 멀린 | 선 | 1:1 |
| `percival` | 퍼시벌 | 선 | 1:1 |
| `servant` | 아서의 충신 | 선 | 1:1 |
| `assassin` | 암살자 | 악 | 1:1 |
| `morgana` | 모르가나 | 악 | 1:1 |
| `mordred` | 모드레드 | 악 | 1:1 |
| `oberon` | 오베론 | 악 | 1:1 |
| `minion` | 모드레드의 하수인 | 악 | 1:1 |
| `background` | 화면 배경 | | 16:9 |
| `background-mobile` | 좁은 화면용 배경 (선택) | | 9:16 |

## 그림 규격

- **초상**: 정사각형 512×512 이상. 화면에서는 원형으로 잘려 보이므로 네 귀퉁이는 버려집니다.
- **구도**: 허리 위까지 나오고, 머리가 그림 높이의 3분의 1쯤 차지하는 정도. 모자·왕관·뿔 끝까지 그림 안에 들어와야 합니다.
- **배경색**: 선은 파란 배경, 악은 붉은 배경으로 통일해 진영을 구분합니다.
- **용량**: 초상은 200KB 이하, 배경은 400KB 이하를 권합니다. `.webp` 가 가장 작습니다.
- 테두리는 넣지 않습니다. 금테는 화면에서 자동으로 둘러집니다.

## 만드는 순서 (Leonardo 기준)

1. `merlin` 을 만들고 마음에 드는 장을 고릅니다.
2. 멀린을 Style Reference 에 걸고 `percival`, `servant` 를 만듭니다.
3. Style Reference 를 빼고 `assassin` 을 만들어 고릅니다.
4. 암살자를 Style Reference 에 걸고 `morgana`, `mordred`, `oberon`, `minion` 을 만듭니다.
5. 멀린을 Style Reference 에 걸고 배경을 만듭니다.

진영별로 기준 그림을 따로 거는 것은 배경색이 섞이지 않게 하기 위해서입니다.

## 선의 세력 (파란 배경)

### merlin

```
plain deep royal blue background with a soft golden glow behind the head, medium shot portrait from the waist up of an old wise wizard with a long white beard and a tall star-embroidered blue pointed hat, holding a staff topped with a glowing blue crystal, facing viewer, centered, the whole head and hat fully inside the frame with empty space above, character fills the central 70 percent of the image, painterly digital illustration, dark Arthurian fantasy, dramatic rim lighting, rich detail
```

Negative

```
text, letters, watermark, signature, frame, border, logo, extra fingers, deformed hands, blurry, low quality, photo, 3d render, scenery, landscape, castle, forest, close-up, extreme close-up, face filling the frame, cropped hat, cut off head
```

### percival

```
plain deep royal blue background with a soft golden glow behind the head, medium shot portrait from the waist up of a handsome young knight in his early twenties, no helmet, shoulder-length golden blond hair, clean-shaven youthful face, shining ornate silver full plate armor with gold trim, red cape over one shoulder, holding a longsword upright in front of his chest, confident noble expression, facing viewer, centered, the whole head fully inside the frame with empty space above, character fills the central 70 percent of the image, painterly digital illustration, dark Arthurian fantasy, dramatic rim lighting, rich detail
```

Negative

```
text, letters, watermark, signature, frame, border, logo, extra fingers, deformed hands, blurry, low quality, photo, 3d render, scenery, landscape, castle, forest, close-up, extreme close-up, face filling the frame, cut off head, old man, elderly, wrinkles, beard, mustache, gray hair, white hair, helmet
```

### servant

```
plain deep royal blue background with a soft golden glow behind the head, medium shot portrait from the waist up of a teenage squire about eighteen years old, short messy dark brown hair, freckles, clean-shaven boyish face, earnest hopeful expression, simple blue cloth tunic over a chainmail shirt, brown leather shoulder strap, no plate armor, no helmet, holding a wooden spear with a small blue pennant, facing viewer, centered, the whole head fully inside the frame with empty space above, character fills the central 70 percent of the image, painterly digital illustration, dark Arthurian fantasy, dramatic rim lighting, rich detail
```

Negative

```
text, letters, watermark, signature, frame, border, logo, extra fingers, deformed hands, blurry, low quality, photo, 3d render, scenery, landscape, castle, forest, close-up, extreme close-up, face filling the frame, cut off head, old man, elderly, wrinkles, beard, mustache, gray hair, white hair, helmet, plate armor
```

## 악의 세력 (붉은 배경)

### assassin

```
plain dark crimson red background with a black vignette, medium shot portrait from the waist up of a hooded assassin in a black cloak, face hidden in shadow with glowing red eyes and a black cloth mask over the mouth, raising a gleaming dagger in one hand, facing viewer, centered, the whole hood fully inside the frame with empty space above, character fills the central 70 percent of the image, painterly digital illustration, dark Arthurian fantasy, dramatic rim lighting, rich detail
```

Negative

```
text, letters, watermark, signature, frame, border, logo, extra fingers, deformed hands, blurry, low quality, photo, 3d render, scenery, landscape, castle, forest, close-up, extreme close-up, face filling the frame, cut off head, blue background
```

### morgana

```
plain dark crimson red background with a black vignette, medium shot portrait from the waist up of a beautiful sinister enchantress with long black hair, a golden tiara with a red jewel, violet eyes, high-collared black and purple gown, cold smile, a small green magical flame floating above her raised palm, facing viewer, centered, the whole head and tiara fully inside the frame with empty space above, character fills the central 70 percent of the image, painterly digital illustration, dark Arthurian fantasy, dramatic rim lighting, rich detail
```

Negative

```
text, letters, watermark, signature, frame, border, logo, extra fingers, deformed hands, blurry, low quality, photo, 3d render, scenery, landscape, castle, forest, close-up, extreme close-up, face filling the frame, cut off head, blue background
```

### mordred

```
plain dark crimson red background with a black vignette, medium shot portrait from the waist up of a dark usurper king in black spiked plate armor, closed black helmet with glowing red eye slits and a jagged golden crown, tattered black cape, both hands resting on the pommel of a black greatsword, facing viewer, centered, the whole helmet and crown fully inside the frame with empty space above, character fills the central 70 percent of the image, painterly digital illustration, dark Arthurian fantasy, dramatic rim lighting, rich detail
```

Negative

```
text, letters, watermark, signature, frame, border, logo, extra fingers, deformed hands, blurry, low quality, photo, 3d render, scenery, landscape, castle, forest, close-up, extreme close-up, face filling the frame, cropped crown, cut off head, blue background
```

### oberon

```
plain dark crimson red background with a black vignette, medium shot portrait from the waist up of a mysterious forest spirit lord wearing a pale bone skull mask with large stag antlers, crown of dark thorny branches and dead leaves, glowing green eyes, ragged cloak of dark leaves and fur, facing viewer, centered, the whole head and both antlers fully inside the frame with empty space above, character fills the central 60 percent of the image, painterly digital illustration, dark Arthurian fantasy, dramatic rim lighting, rich detail
```

Negative

```
text, letters, watermark, signature, frame, border, logo, extra fingers, deformed hands, blurry, low quality, photo, 3d render, scenery, landscape, castle, forest, close-up, extreme close-up, face filling the frame, cropped antlers, cut off head, blue background, green background
```

### minion

```
plain dark crimson red background with a black vignette, medium shot portrait from the waist up of a scarred sneering mercenary thug in his thirties, short black hair, black eye patch over one eye, rough stubble, a long scar across his cheek, dark studded leather armor with a torn red sash, a heavy spiked mace resting on his shoulder, no helmet, cruel grin, facing viewer, centered, the whole head fully inside the frame with empty space above, character fills the central 70 percent of the image, painterly digital illustration, dark Arthurian fantasy, dramatic rim lighting, rich detail
```

Negative

```
text, letters, watermark, signature, frame, border, logo, extra fingers, deformed hands, blurry, low quality, photo, 3d render, scenery, landscape, castle, forest, close-up, extreme close-up, face filling the frame, cut off head, blue background, helmet, hood, mask, crown, horns
```

## 배경

그림 위에 어두운 막이 한 겹 덮이고, 그 위에 양피지 카드와 원탁이 올라갑니다. 어둡고 잔잔한 그림이 어울립니다.
화면 비율에 맞춰 가운데를 기준으로 잘리므로, 성과 달은 가운데에 두세요.
`background` 만 넣으면 휴대폰에서는 그림의 가운데 세로 띠만 보입니다.

### background (16:9)

```
wide establishing shot of a medieval castle on a hill at night, full moon behind thin clouds, starry sky, warm candlelight in the castle windows, red banners on the towers, misty valley and dark pine forest in the foreground, distant mountains, dark blue and deep purple palette with small warm highlights, painterly digital illustration, dark Arthurian fantasy, calm and low contrast, castle centered, no people
```

### background-mobile (9:16)

```
tall vertical composition of a medieval castle on a hill at night seen from below, full moon and starry sky filling the upper half, warm candlelight in the castle windows, red banners on the towers, mist and dark pine forest at the bottom, dark blue and deep purple palette with small warm highlights, painterly digital illustration, dark Arthurian fantasy, calm and low contrast, castle centered in the lower half, no people
```

Negative (배경 공통)

```
text, letters, watermark, signature, frame, border, logo, people, characters, blurry, low quality, photo, 3d render, bright daylight
```

## 여덟 장을 구분하는 기준

| 역할 | 배경 | 얼굴 | 머리 | 차림 | 들고 있는 것 |
|---|---|---|---|---|---|
| 멀린 | 파랑 | 노인, 긴 흰 수염 | 별 무늬 고깔모자 | 파란 로브 | 수정 지팡이 |
| 퍼시벌 | 파랑 | 20대 초반, 수염 없음 | 금발, 투구 없음 | 은빛 판금 갑옷, 붉은 망토 | 장검 |
| 아서의 충신 | 파랑 | 10대 후반, 주근깨 | 짧은 갈색 머리, 투구 없음 | 파란 천 옷, 사슬 갑옷 | 깃발 단 창 |
| 암살자 | 빨강 | 그늘에 가려짐, 붉은 눈 | 검은 두건 | 검은 망토, 복면 | 단검 |
| 모르가나 | 빨강 | 여성, 보랏빛 눈 | 긴 검은 머리, 왕관 | 검보라 드레스 | 초록 불꽃 |
| 모드레드 | 빨강 | 투구에 가려짐, 붉은 눈 | 왕관 얹은 검은 투구 | 가시 돋친 검은 갑옷 | 검은 대검 |
| 오베론 | 빨강 | 뼈 가면, 초록 눈 | 사슴뿔 | 잎과 털 망토 | 없음 |
| 하수인 | 빨강 | 30대, 안대와 흉터 | 짧은 검은 머리, 투구 없음 | 징 박힌 가죽 갑옷 | 가시 철퇴 |

## 저작권

보드게임 "레지스탕스: 아발론"의 공식 일러스트는 저작권이 있으므로 쓰면 안 됩니다.
직접 그리거나, AI 이미지 생성기로 만들거나, 사용이 허락된 그림을 쓰세요.
