var parts = [
{ key: 1, en:"chest", ja: "胸", img_path: "./img/chest.jpg", categories: [
    { key: 11, en:"machine", ja: "マシン", events: [
        { key: 1101, en:"chest press", ja: "チェスト プレス" },
        { key: 1102, en:"butterfly machine", ja: "バタフライ マシン" },
        { key: 1103, en:"cable cross over", ja: "ケーブル クロスオーバー" }]},
    { key: 12, en:"dumbbell", ja: "ダンベル", events: [
        { key: 1201, en:"dumbbell fly", ja: "ダンベル フライ" },
        { key: 1202, en:"incline dumbbell fly", ja: "インクライン ダンベルフライ" },
        { key: 1203, en:"dumbbell bench press", ja: "ダンベル ベンチプレス" },
        { key: 1204, en:"incline dumbbell bench press", ja: "インクライン ダンベル ベンチプレス" },
        { key: 1205, en:"dumbbell pull over", ja: "ダンベル プルオーバー" }]},
    { key: 13, en:"barbell", ja: "バーベル", events: [
        { key: 1301, en:"bench press", ja: "ベンチ プレス" },
        { key: 1302, en:"incline bench press", ja: "インクライン ベンチプレス" },
        { key: 1303, en:"decline bench press", ja: "デクライン ベンチプレス" },
        { key: 1304, en:"bent-arm pullover", ja: "ベント アーム プルオーバー" }]},
    { key: 14, en:"self weight", ja: "自重", events: [
        { key: 1401, en:"", ja: "プッシュアップ" },
        { key: 1402, en:"", ja: "ディップス" }]} ]},
{ key: 2, en:"back", ja: "背中", img_path: "./img/back.jpg", categories: [
    { key: 21, en:"machine", ja: "マシン", events: [
        { key: 2101, en:"", ja: "ベントオーバー ローイング" },
        { key: 2102, en:"", ja: "デッドリフト" },
        { key: 2103, en:"", ja: "バック エクステンション" },
        { key: 2104, en:"", ja: "ベンドオーバー" },
        { key: 2105, en:"", ja: "ベントアーム プルオーバー" }]},
    { key: 22, en:"dumbbell", ja: "ダンベル", events: [
        { key: 2201, en:"", ja: "ダンベル プルオーバー" },
        { key: 2202, en:"", ja: "ワンハンド ローイング" }]},
    { key: 23, en:"barbell", ja: "バーベル", events: [
        { key: 2301, en:"", ja: "ラット プルダウン" },
        { key: 2302, en:"", ja: "シーテッド プーリーロー" }]},
    { key: 24, en:"self weight", ja: "自重", events: [
        { key: 2401, en:"", ja: "チンニング" }]} ]},
{ key: 3, en:"shoulder", ja: "肩", img_path: "./img/shoulder.jpg", categories: [
    { key: 31, en:"machine", ja: "マシン", events: [
        { key: 3101, en:"", ja: "スタンディング ロー" },
        { key: 3102, en:"", ja: "バック プレス" },
        { key: 3103, en:"", ja: "フロント プレス" },
        { key: 3104, en:"", ja: "バーベル シュラッグ" },
        { key: 3105, en:"", ja: "ベントオーバー フロント プルアップ" },
        { key: 3106, en:"", ja: "プルアップ トゥ チェスト" }]},
    { key: 32, en:"dumbbell", ja: "ダンベル", events: [
        { key: 3201, en:"", ja: "サイドレイズ" },
        { key: 3202, en:"", ja: "ダンベルプレス" },
        { key: 3203, en:"", ja: "ベントオーバー ラテラル" },
        { key: 3204, en:"", ja: "フロントレイズ" },
        { key: 3205, en:"", ja: "ダンベル シュラッグ" },
        { key: 3206, en:"", ja: "ワンハンド ラテラル" }]},
    { key: 33, en:"barbell", ja: "バーベル", events: [
        { key: 3301, en:"", ja: "ケーブル サイドレイズ" },
        { key: 3302, en:"", ja: "ケーブル フロントレイズ" }]},
    { key: 34, en:"self weight", ja: "自重", events: [
        { key: 3401, en:"", ja: "ハンドスタンド プッシュアップ" }]} ]},
{ key: 4, en:"triceps", ja: "上腕三頭筋", img_path: "./img/triceps.jpg", categories: [
    { key: 41, en:"machine", ja: "マシン", events: [
        { key: 4101, en:"", ja: "フレンチプレス" },
        { key: 4102, en:"", ja: "トライセプス エクステンション" },
        { key: 4103, en:"", ja: "ナローグリップ ベンチプレス" }]},
    { key: 42, en:"dumbbell", ja: "ダンベル", events: [
        { key: 4201, en:"", ja: "ﾜﾝﾊﾝﾄﾞ ﾄﾗｲｾﾌﾟｽ ｴｸｽﾃﾝｼｮﾝ ｽﾀﾝﾃﾞｨﾝｸﾞ" },
        { key: 4202, en:"", ja: "ﾜﾝﾊﾝﾄﾞ ﾄﾗｲｾﾌﾟｽ ｴｸｽﾃﾝｼｮﾝ ﾗｲｲﾝｸﾞ" },
        { key: 4203, en:"", ja: "トライセプス キックバック" }]},
    { key: 43, en:"barbell", ja: "バーベル", events: [
        { key: 4301, en:"", ja: "ケーブル トライセプス エクステンション" },
        { key: 4302, en:"", ja: "プレスダウン" }]},
    { key: 44, en:"self weight", ja: "自重", events: [
        { key: 4401, en:"", ja: "ナロー プッシュアップ" },
        { key: 4402, en:"", ja: "リバース プッシュアップ" }]} ]},
{ key: 5, en:"biceps", ja: "上腕二頭筋", img_path: "./img/biceps.jpg", categories: [
    { key: 51, en:"machine", ja: "マシン", events: [
        { key: 50, en:"", ja: "バーベルカール" },
        { key: 50, en:"", ja: "プリーチャーズ ベンチカール" }]},
    { key: 52, en:"dumbbell", ja: "ダンベル", events: [
        { key: 50, en:"", ja: "ダンベルカール" },
        { key: 50, en:"", ja: "コンセントレーション カール" },
        { key: 50, en:"", ja: "インクライン カール" },
        { key: 50, en:"", ja: "ハンマー カール" },
        { key: 50, en:"", ja: "ライイングダウン カール" }]},
    { key: 54, en:"self weight", ja: "自重", events: [
        { key: 50, en:"", ja: "ケーブル カール" }]} ]},
{ key: 6, en:"abdominal", ja: "腹筋", img_path: "./img/abdominal.jpg", categories: [
    { key: 61, en:"machine", ja: "マシン", events: [
        { key: 60, en:"", ja: "ケーブル クランチ" },
        { key: 60, en:"", ja: "ロープ クランチ" }]},
    { key: 62, en:"dumbbell", ja: "ダンベル", events: [
        { key: 60, en:"", ja: "サイドベンド" }]},
    { key: 62, en:"dumbbell", ja: "ダンベル", events: [
        { key: 60, en:"", ja: "プローン ローリング" }]},
    { key: 64, en:"self weight", ja: "自重", events: [
        { key: 60, en:"", ja: "ストレート レッグ クランチ" },
        { key: 60, en:"", ja: "シットアップ" },
        { key: 60, en:"", ja: "クランチ" },
        { key: 60, en:"", ja: "ヒップ レイズ" },
        { key: 60, en:"", ja: "レッグ レイズ" },
        { key: 60, en:"", ja: "ハンギング レッグ レイズ" },
        { key: 60, en:"", ja: "ボディ アーチ" }]} ]},
{ key: 7, en:"legs", ja: "足", img_path: "./img/legs.jpg", categories: [
    { key: 71, en:"machine", ja: "マシン", events: [
        { key: 70, en:"", ja: "レッグ プレス" },
        { key: 70, en:"", ja: "レッグ エクステンション" },
        { key: 70, en:"", ja: "レッグ カール" }]},
    { key: 72, en:"dumbbell", ja: "ダンベル", events: [
        { key: 70, en:"", ja: "フル スクワット" },
        { key: 70, en:"", ja: "ランジ" },
        { key: 70, en:"", ja: "フロント スクワット" },
        { key: 70, en:"", ja: "ハック リフト" }]},
    { key: 74, en:"self weight", ja: "自重", events: [
        { key: 70, en:"", ja: "ワンレッグ スクワット" },
        { key: 70, en:"", ja: "シッシー スクワット" }]} ]},
{ key: 8, en:"calf", ja: "ふくらはぎ", img_path: "./img/calf.jpg", categories: [
    { key: 81, en:"machine", ja: "マシン", events: [
        { key: 70, en:"", ja: "ｶｰﾌﾚｲｽﾞ ｵﾝ ﾚｯｸﾞ ﾌﾟﾚｽ ﾏｼﾝ" },
        { key: 70, en:"", ja: "ケーブル カール" }]} ]},
{ key: 8, en:"wrist", ja: "前腕部", img_path: "./img/wrist.jpg", categories: [
    { key: 81, en:"machine", ja: "マシン", events: [
        { key: 70, en:"", ja: "リストカール" },
        { key: 70, en:"", ja: "リストカール オン ベンチ" }]} ]};
