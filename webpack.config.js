module.exports = {
	//entryファイル設定
	entry: {
		index: './src/index.ts'
	},
	//出力ファイル設定
	output: {
		path: "-",
		filename: "[name].js"
	},
  //webpack-build-mode
  //	"production"なら、圧縮ファイル出力
  //	"development"なら、ソースマップ有効出力
  mode: "development",

  //localhostの自動起動
  devServer: {
    contentBase: "dist",
    open: true
  },

  //ts
	module:{
		rules:[{
			//拡張子.tsの場合
			test:/\.ts$/,
			//TypeScriptをコンパイルする
			use:"ts-loader"
		}]
	},
	//import文で.tsファイルを解決する
	resolve:{
		extensions:[".ts"]
	},
};