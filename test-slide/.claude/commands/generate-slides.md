# generate-slides

台本（原稿・テキスト）を渡すと、Marp 形式の Markdown スライドと Gemini API による画像を自動生成するスキルです。

## 使い方

```
/generate-slides <ファイルパスまたはテキスト>
```

例:
```
/generate-slides slides/bridgestone.md
/generate-slides "ブリヂストンは1931年に創業した..."
```

## 実行手順

引数 `$ARGUMENTS` を台本として受け取り、以下の手順でスライドを生成してください。

### 1. 台本の読み込み

- `$ARGUMENTS` がファイルパスの場合 → そのファイルを読み込む
- `$ARGUMENTS` がテキストの場合 → そのまま台本として使用する

### 2. 台本の段落分割

台本を意味のまとまりで段落に分割する:

- 話題が切り替わる箇所で区切る
- 1段落 = 1スライドを基本とする
- 表紙・目次・まとめ・締めは固定スライドとして別途追加する

### 3. 台本の解析

台本を読み込んだら、以下を把握する:

- **全体テーマ**: 何の発表・説明か
- **主要トピック**: 話の流れの区切り（章・段落の切れ目）
- **キーワード・数字**: 強調すべき固有名詞・数値・日付
- **結論・まとめ**: 台本の締めで言いたいこと

### 4. スライド構成を JSON で出力

Marp ファイルを生成する前に、スライド構成を以下の JSON 形式で出力する。
ユーザーが構成を確認・修正できるようにするため、必ずこの JSON を表示してから次に進む。

```json
{
  "title": "プレゼンタイトル",
  "filename": "output_filename.md",
  "slides": [
    {
      "index": 1,
      "type": "cover",
      "heading": "スライドタイトル",
      "bullets": [],
      "script_excerpt": "対応する台本の抜粋（先頭50文字）",
      "image_prompt": "A professional title slide for a presentation about ..., flat illustration, clean modern style"
    },
    {
      "index": 2,
      "type": "toc",
      "heading": "目次",
      "bullets": ["章1", "章2", "章3"],
      "script_excerpt": "",
      "image_prompt": ""
    },
    {
      "index": 3,
      "type": "content",
      "heading": "スライド見出し",
      "bullets": ["ポイント1", "ポイント2", "ポイント3"],
      "script_excerpt": "対応する台本の抜粋（先頭50文字）",
      "image_prompt": "A visual representation of ... in a clean, modern style, flat illustration, white background"
    }
  ]
}
```

**image_prompt のルール:**
- 英語で記述する
- スライドの内容を視覚的に補完するイメージを指定する
- スタイルは `flat illustration`, `infographic`, `photo-realistic` などを用途に応じて指定する
- `type` が `toc` のスライドは `image_prompt` を空にする
- それ以外の全スライドに必ず生成する

### 5. ファイル名の決定

台本のテーマから英語スネークケースでファイル名を決める。
例: "ブリヂストン会社紹介" → `bridgestone_intro.md`

### 6. Gemini API で画像生成

`image_prompt` が空でない各スライドに対して、以下の Python スクリプトを生成・実行して画像を生成する。

**前提:**
- `.env` ファイルに `GEMINI_API_KEY=<キー>` が設定されていること
- `slides/images/` ディレクトリに画像を保存する

**実行するスクリプト (`generate_images.py`):**

```python
import os, json, base64
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

SLIDES_JSON = """<JSON文字列をここに埋め込む>"""
OUTPUT_DIR = Path("slides/images")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

slides = json.loads(SLIDES_JSON)["slides"]

for slide in slides:
    prompt = slide.get("image_prompt", "")
    if not prompt:
        continue

    idx = slide["index"]
    print(f"Generating image for slide {idx}...")

    response = genai.ImageGenerationModel("imagen-3.0-generate-001").generate_images(
        prompt=prompt,
        number_of_images=1,
        aspect_ratio="16:9",
    )

    image_data = response.images[0]._image_bytes
    out_path = OUTPUT_DIR / f"slide_{idx:02d}.png"
    out_path.write_bytes(image_data)
    print(f"  Saved: {out_path}")

print("Done.")
```

スクリプトを実行する前に `google-generativeai` と `python-dotenv` がインストールされているか確認し、なければインストールする:

```bash
pip install google-generativeai python-dotenv
```

### 7. Marp Markdown ファイルの生成

画像生成完了後、以下のテンプレートに従って Marp ファイルを生成し `slides/` に保存する。
各スライドに対応する画像 (`slides/images/slide_NN.png`) を `![bg right:40%](./images/slide_NN.png)` で埋め込む。
画像がないスライド（目次など）は画像タグを省略する。

```markdown
---
marp: true
theme: default
paginate: true
backgroundColor: #ffffff
style: |
  section {
    font-family: 'Hiragino Kaku Gothic Pro', 'Meiryo', sans-serif;
  }
  h1 { color: #333; }
  h2 {
    color: #333;
    border-bottom: 2px solid #333;
    padding-bottom: 6px;
  }
---

# タイトル

サブタイトル

![bg right:40%](./images/slide_01.png)

---

## 見出し

![bg right:40%](./images/slide_03.png)

- ポイント1
- ポイント2
- ポイント3

---
```

### 8. 完了メッセージ

ファイル生成後、以下を伝える:

- 生成したファイルのパス
- 生成した画像の枚数
- スライド枚数と各スライドのタイトル一覧
- Marp CLI でのコマンド例:
  ```bash
  # プレビュー
  npx @marp-team/marp-cli slides/<ファイル名> --preview

  # PDF エクスポート
  npx @marp-team/marp-cli slides/<ファイル名> --pdf
  ```

## 注意事項

- 台本の文章をそのままスライドに貼り付けない。**要点を箇条書きに圧縮**する
- 1スライドあたり読み上げ時間の目安は1〜2分
- 数字・固有名詞・実績値は必ずスライドに残す
- 台本が日本語なら、スライドも日本語で生成する
- `GEMINI_API_KEY` が未設定の場合は画像生成をスキップし、その旨をユーザーに伝える
