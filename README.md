## はじめに
- 「サポートラビット」は、日々の予定管理や達成状況を可視化し、モチベーションを向上させることを目的としたアプリです。
- 可愛らしいデザインとシンプルな操作性を兼ね備え、特に10代・20代の女性ユーザーをターゲットにしています。
- カレンダーとタスク管理を組み合わせることで、予定を楽しく管理できるよう設計しました。

## コンセプト
### **■ 目的**
- 日々の予定管理や達成状況を視覚化し、モチベーションを高めることを目的としています。
### **■ 機能とデザイン**
- カレンダーと予定一覧を同時に表示し、タスクの達成感を味わえる「達成ボタン」を設置。
- 可愛らしくシンプルなデザインで、特に10代・20代の女性をターゲットにしています。
### **■ 開発の背景**
- 市販のカレンダーアプリでは、自分好みのレイアウトや機能が少なかったため、 **「可愛いデザイン」×「シンプルな操作性」×「達成率の可視化」** を重視して開発しました。
- PC・スマホの両方から気軽にアクセスできるよう、Web上で動作する仕様にしました。
- 要件定義や設計の段階で、実際に他の人から意見をもらいながら開発を進めました。
### **■ 補足**
- どこかで見たことのあるアプリのように感じるかもしれませんが、 温かい目でご覧いただければ幸いです。

## アプリ概要
「サポートラビット」は、以下の機能を備えています。
### ログイン・ユーザー管理
- **ログイン・新規登録**
- **ユーザID・パスワードを忘れた場合**
  - ユーザーがメールアドレスを入力すると、ユーザIDとパスワード変更画面に繋がるボタンが設置されたメールが送信されます。
- **プロフィール画面**
  - ユーザーのプロフィール表示・更新が可能です。
  - パスワード更新可能です。
  - アカウント削除が可能です。
### カレンダー管理
- **スケジュール登録・管理**
  - 登録、更新、削除が可能です。
- **削除機能**
  - 選択したデータを削除可能です。
  - 繰り返し要素がある場合、全データを表示し、選択・一括削除も可能です。
- **タグ管理**
  - タグの作成・削除が可能です。
### 達成機能
  - **タスク達成を記録可能**
### 誕生日
  - **誕生日にアイコンを表示します。**
### 天気情報
  - **現在位置および主要五大都市の天気情報をマップまたはリストから選択可能**
  - **現在の時刻以降の天気情報をグラフ表示**
  - **5日間の天気情報を表示**
### 達成数の可視化
- **達成数画面**
  - 一週間単位で達成状況をグラフ表示
  - 達成したデータの一覧表示

## デモ動画


https://github.com/user-attachments/assets/428adce4-89d8-4d62-929b-a54b1a47262a


### 使用ツール・BGM
- **動画編集:** [ゆっくりムービーメーカー4 Lite](https://manjubox.net/ymm4/)
- **音声:** [VOICEVOX:ずんだもん](https://voicevox.hiroshiba.jp/)
- **BGM:** ["Good Morning Sunshine" written by modus](https://dova-s.jp/bgm/play12645.html) （DOVA-SYNDROME）

### アプリで使用した画像
- **アイコン・モノクロ素材:** [icooon mono](https://icooon-mono.com/)
- **水彩テクスチャ:** [Sui-Sai](https://sui-sai.jp/info/)

## 環境
- **開発言語:**
  - フロントエンド: JavaScript (React 18.2.0)
  - バックエンド: PHP (Laravel 11)
- その他:
  - CSSフレームワーク: Tailwind CSS 3.4.14
  - API通信: Axios 1.7.4
- **コンテナ環境:** Docker を使用
- **サーバー:**
  - **Docker を使用し、コンテナ環境でアプリケーションを構築**
- **検証済みOS:** Windows 11 Home (バージョン 24H2, OSビルド 26100.2894)
### **使用API一覧**
1. **OpenWeatherMap API**
- **用途:** 天気データの取得
- **エンドポイント:** `https://api.openweathermap.org/data/2.5/forecast`
2. **OpenStreetMap Tile API**
- **用途:** 地図の描画
- **エンドポイント:** `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
3. **Leaflet.js API**
- **用途:** 地図操作・マーカー表示
- **使用機能:** `L.map()`, `L.marker()`, `L.popup()` など
4. **Chart.js API**
- **用途:** 気温・降水確率のグラフ表示
5. **OpenWeatherMap Weather Icons API**
- **用途:** 天気アイコンの取得
- **エンドポイント:** `http://openweathermap.org/img/wn/{icon}.png`
---
## 利用方法
### 1. GitHubリポジトリのクローン
まず、GitHubリポジトリのURLを使用してプロジェクトをクローンします。
```bash
git clone https://github.com/15-y-nakamura/support-rabbit.git
cd support-rabbit
```
### 2. 環境変数の設定
`.env` ファイルを作成し、必要な環境変数を設定します。
```bash
cp .env.example .env
```
その後、エディタで `.env` ファイルを開き、以下のようにAPIキーを設定します。
```
API_KEY=your_openweathermap_api_key
```
### 3. Laravel Sail の起動
以下のコマンドを実行して、**Laravel Sail** を使用してDockerコンテナをビルドし、起動します。
```bash
./vendor/bin/sail up --build -d
```
※ `-d` オプションを付けるとバックグラウンドで実行されます。
**初回実行時に以下のコマンドで依存関係をインストールしておくと良いです。**
```bash
./vendor/bin/sail composer install
./vendor/bin/sail artisan migrate --seed
```
### 4. フロントエンドのセットアップ
React の依存関係をインストールし、開発サーバーを起動します。
```bash
./vendor/bin/sail npm install
./vendor/bin/sail npm run dev
```

### 5. アプリケーションの使用
ブラウザで以下のURLにアクセスすると、アプリケーションを使用できます。
- http://localhost/login

## 今後の実装予定の機能
- **チームやグループでの共有**
- **プッシュ通知やリマインダー機能**

## おわりに
React、Laravel学習者のアウトプットとして、リポジトリ公開させていただきました。 

