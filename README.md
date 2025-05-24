# Story Maker - AIストーリー作成ツール

「Save the Cat」手法を使用したAI駆動のストーリー作成Webアプリケーション。Flask、Gemini AI、shadcn/uiにインスパイアされたモダンなUIで構築されています。

## 機能

- **AI駆動のストーリー生成**: Google Gemini AIを使用してストーリー要素を生成
- **Save the Cat手法**: Blake Snyderの実証済みストーリーテリング構造に従う
- **インタラクティブなワークフロー**: キャラクタープロフィールから完全なアウトラインまで4ステップのプロセス
- **編集モード**: 次のステップに進む前にすべての生成コンテンツを編集可能
- **モダンなUI**: ダークモード対応の美しくレスポンシブなインターフェース
- **日本語完全対応**: すべての機能が日本語でローカライズ済み

## 必要条件

- Python 3.8以上
- Google Gemini APIキー
- モダンなWebブラウザ

## インストール

1. リポジトリをクローン:
```bash
git clone <repository-url>
cd story_maker
```

2. 仮想環境を作成:
```bash
python -m venv venv
source venv/bin/activate  # Windowsの場合: venv\Scripts\activate
```

3. 依存関係をインストール:
```bash
pip install -r requirements.txt
```

4. Gemini APIキーを設定:
```bash
export GEMINI_API_KEY="your-api-key-here"  # Windowsの場合: set GEMINI_API_KEY=your-api-key-here
```

## 使用方法

1. Flaskサーバーを起動:
```bash
python app.py
```

2. ブラウザを開いて以下にアクセス:
```
http://localhost:5000
```

3. 4ステップのプロセスに従う:
   - **ステップ1**: ストーリーコンセプトを入力してキャラクタープロフィールを生成
   - **ステップ2**: プロフィールを選択してストーリーシナリオを生成
   - **ステップ3**: シナリオを選択してストーリー構成を生成
   - **ステップ4**: 最終的な詳細アウトラインを作成

## プロジェクト構造

```
story_maker/
├── app.py              # FlaskアプリケーションとAPIエンドポイント
├── prompts.py          # AIプロンプトテンプレート
├── index.html          # メインHTMLテンプレート
├── script.js           # フロントエンドJavaScriptロジック
├── style.css           # shadcn/uiインスパイアのCSS
├── requirements.txt    # Python依存関係
├── CLAUDE.md          # 開発ガイドライン
└── README.md          # このファイル
```

## 主要機能の説明

### 編集モード
各ステップには以下の機能を持つ編集モードが含まれています：
- 「編集モード」ボタンをクリックして編集を有効化
- 任意のフィールドをクリックしてコンテンツを編集
- Enterキーまたはチェックボタンで変更を保存
- Escapeキーまたは×ボタンで変更をキャンセル

### ストーリー生成フロー
1. **プロフィール生成**: コンセプトに基づいて3つのユニークなキャラクタープロフィールを作成
2. **シナリオ生成**: 選択したプロフィールを使用して3つの異なるストーリーシナリオを開発
3. **構成生成**: 完全な15ビートのストーリー構成を構築
4. **アウトライン生成**: 章ごとの詳細なアウトラインを作成

### UI/UX機能
- ビジュアルプログレスバーによる進捗追跡
- パンくずナビゲーション
- スピナー付きローディング状態
- ユーザーフレンドリーなエラーメッセージによるエラー処理
- すべての画面サイズに対応するレスポンシブデザイン

## APIエンドポイント

- `POST /generate_profiles` - キャラクタープロフィールを生成
- `POST /generate_scenarios` - ストーリーシナリオを生成
- `POST /generate_structure` - ストーリー構成を生成
- `POST /generate_outline` - 最終アウトラインを生成

## 使用技術

- **バックエンド**: Flask (Python)
- **AI**: Google Gemini API (gemini-2.0-flash-preview)
- **フロントエンド**: Vanilla JavaScript、HTML5
- **スタイリング**: Tailwindインスパイアのユーティリティクラスを持つCSS3
- **デザインシステム**: shadcn/uiインスパイアのコンポーネント

## 開発

開発ガイドラインとベストプラクティスについては、[CLAUDE.md](./CLAUDE.md)を参照してください。

### 開発モードでの実行
```bash
export FLASK_DEBUG=1
python app.py
```

### コードスタイル
- Python: PEP 8に従う
- JavaScript: ES6+の機能を使用
- CSS: CSS変数を使用したHSLカラーシステム

## トラブルシューティング

### よくある問題

1. **APIキーエラー**: Gemini APIキーが環境変数として適切に設定されていることを確認
2. **接続エラー**: インターネット接続とファイアウォール設定を確認
3. **生成エラー**: APIクォータが超過していないことを確認

### デバッグモード
詳細なエラーメッセージを表示するためにFlaskデバッグモードを有効化:
```bash
export FLASK_DEBUG=1
```

## ライセンス

このプロジェクトはMITライセンスの下でライセンスされています。

## 謝辞

- 「Save the Cat」手法のBlake Snyder氏
- デザインインスピレーションのshadcn/ui
- コンテンツ生成のGoogle Gemini AI