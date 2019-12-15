import {
	el,
	log,
	eventCopyToClipboard,
	createNotifyElement,
	createWordList,
	eventInputTabInTextarea,
	resizeHeight,
	escapeRegExp,
	restrictRegExp,
} from "./lib";

//出力方法の種類
enum OTTYPE{
	ot="ot",
	reverse="reverse",
	split="split",
}
//出力関数構造体
//0軸:OTTYPE
//1軸:区切り文字の変換有無による処理切替
const OtFunc = {
	"ot": [ot0, ot1],
	"reverse": [otReverse0, otReverse1],
	"split": [otSplit0, otSplit1],
}

//グローバルDOM要素取得
const eIn = <HTMLTextAreaElement>el("In");
const eOt = <HTMLTextAreaElement>el("Ot");
const eDlmt = <HTMLTextAreaElement>el("Dlmt");
const eStringReplaceTo = <HTMLTextAreaElement>el("StringReplaceTo");
const ePrefix = <HTMLTextAreaElement>el("Prefix");
const eSuffix = <HTMLTextAreaElement>el("Suffix");
const eCheckboxReplaceDlmt = <HTMLInputElement>el("CheckboxReplaceDlmt");
const eCheckboxRegExp = <HTMLInputElement>el("CheckboxRegExp");
const eCheckboxAutoHeight = <HTMLInputElement>el("CheckboxAutoHeight");
const ePlhlrOtWordList = <HTMLTableCellElement>el("PlhlrOtWordList");
const eErrorRegExp = (<HTMLElement>el("ErrorRegExp"));
const eBtnOt = <HTMLButtonElement>el("BtnOt");

//初期化処理
function init(){
	//イベント登録
	//bnt clickイベント
	eBtnOt.addEventListener("click", otEntry.bind(null, OTTYPE.ot));
	(<HTMLButtonElement>el("BtnOtReverse")).addEventListener("click", otEntry.bind(null, OTTYPE.reverse));
	(<HTMLButtonElement>el("BtnOtSplit")).addEventListener("click", otEntry.bind(null, OTTYPE.split));
	(<HTMLButtonElement>el("BtnCopyOt")).addEventListener("click", eventCopyToClipboard.bind(eOt));
	//(<HTMLButtonElement>el("BtnPasteInIn")).addEventListener pasteClipboard.bind(<HTMLTextAreaElement>el("In"));	//要permission

	//textarea高さ自動調整
	eIn.addEventListener("input", () => {
		if(eCheckboxAutoHeight.checked) resizeHeight.bind(eIn)(); });
	eBtnOt.addEventListener("click", () => {
		if(eCheckboxAutoHeight.checked) resizeHeight.bind(eOt)(); });

	//checkbox clickイベント
	eCheckboxReplaceDlmt.addEventListener("click", setStyleStringReplaceTo);
	eCheckboxRegExp.addEventListener("click", setStyleRegExp);

	//textareaのTab入力では、カーソル移動をキャンセルし、Tab入力を行う
	document.addEventListener('keydown', (event)=>{ //if(!eCheckboxRegExp.checked)	//非正規表現時のみ有効
		eventInputTabInTextarea(event); });

	//初期化処理
	setStyleStringReplaceTo();
	setStyleRegExp();
}init();
//========================================================
//処理関数
//========================================================
//区切り文字の変換の有無のスタイル変更
function setStyleStringReplaceTo(){
	if(eCheckboxReplaceDlmt.checked){
		eStringReplaceTo.readOnly = false;
		eStringReplaceTo.classList.remove("grayout");
		eStringReplaceTo.placeholder = "削除";
		//eTrStringReplaceTo.classList.remove("strikeThrough");
	}else{
		eStringReplaceTo.readOnly = true;
		eStringReplaceTo.classList.add("grayout");
		eStringReplaceTo.placeholder = "";
		//eTrStringReplaceTo.classList.add("strikeThrough");
	}
}
//正規表現の有無の注意書き変更
function setStyleRegExp(){
	const e = <HTMLElement>el("NoteRegExp");
	if(eCheckboxRegExp.checked){ e.style.display = "inline"; }
	else{ e.style.display = "none"; }
}

//区切り文字を取得する
function getDlmt(){
	let dlmt = "";
	//正規表現検索か
	if(eCheckboxRegExp.checked){
		dlmt = restrictRegExp(eDlmt.value);
	}else{
		dlmt = escapeRegExp(eDlmt.value);
	}
	//正規表現エラーキャッチ
	try{
		//区切り文字を変換するか
		if(eCheckboxReplaceDlmt.checked){
			return RegExp(dlmt);
		}else{
			return RegExp("("+dlmt+")");
		}
	}catch(e){
		return <Error>e;
	}
}
//----------------------------------------
//出力処理
//----------------------------------------
//出力共通処理
let Words:Array<string>;	//引数省略のためグローバル変数
function otEntry(ottype:OTTYPE){
	let dlmt = getDlmt();
	//RegExpエラー処理
	if(dlmt instanceof Error){
		eErrorRegExp.textContent = dlmt.message;
		//log(dlmt);
	}else{//正常系
		Words = eIn.value.split(dlmt);
		//出力タイプと区切り文字変換の有無により使用関数を選択実行
		OtFunc[ottype][eCheckboxReplaceDlmt.checked ? 1 : 0]();
		eErrorRegExp.textContent = "";
	}
}

//順番出力====================
//区切り文字変換なし
function ot0(){
	let otText = "";
	const pre = ePrefix.value;
	const suf = eSuffix.value;
	//単語をつなげる
	let wLen = Words.length;
	for(let i=0; i<wLen-1; i+=2){
		otText += pre + Words[i] + suf + Words[i+1];
	}otText += pre + Words[wLen-1] + suf;
	eOt.value = otText;
}
//区切り文字変換あり
function ot1(){
	let otText = "";
	const pre = ePrefix.value;
	const suf_strRep2 = eSuffix.value + eStringReplaceTo.value;
	//単語をつなげる
	let wLen = Words.length;
	for(let i=0; i<wLen-1; i++){
		otText += pre + Words[i] + suf_strRep2;
	}otText += pre + Words[wLen-1] + eSuffix.value;
	eOt.value = otText;
}

//逆順出力====================
//区切り文字変換なし
function otReverse0(){
	let otText = "";
	const pre = ePrefix.value;
	const suf = eSuffix.value;
	//単語をつなげる
	for(let i=Words.length-1; i>=2; i-=2){
		otText += pre + Words[i] + suf + Words[i-1];
	}otText += pre + Words[0] + suf;
	eOt.value = otText;
}
//区切り文字変換あり
function otReverse1(){
	let otText = "";
	const pre = ePrefix.value;
	const suf_strRep2 = eSuffix.value + eStringReplaceTo.value;
	//単語をつなげる
	for(let i=Words.length-1; i>=1; i--){
		otText += pre + Words[i] + suf_strRep2;
	}otText += pre + Words[0] + eSuffix.value;
	eOt.value = otText;
}

//分割出力====================
//区切り文字変換なし
function otSplit0(){
	const ul = document.createElement("ul");
	const fragment = document.createDocumentFragment();
	const pre = ePrefix.value;
	const suf = eSuffix.value;
	//単語をつなげる
	let wLen = Words.length;
	for(let i=0; i<wLen-1; i+=2){	//インライン展開したい
		//textareaに単語を入れる
		const textarea = document.createElement("textarea");
		textarea.value = pre + Words[i] + suf + Words[i+1];
		//コピーボタンを作る
		const button = document.createElement("button");
		button.textContent = "Copy";
		button.onclick = eventCopyToClipboard.bind(textarea);
		//liにtextareaとbuttonを入れて、fragmentに追加する
		const li = document.createElement("li");
		li.appendChild(textarea);
		li.appendChild(button);
		fragment.appendChild(li);
	}//ラスト処理
	const textarea = document.createElement("textarea"); textarea.value = pre + Words[wLen-1] + suf;
	const button = document.createElement("button"); button.textContent = "Copy"; button.onclick = eventCopyToClipboard.bind(textarea);
	const li = document.createElement("li"); li.appendChild(textarea); li.appendChild(button);
	fragment.appendChild(li);
	ul.appendChild(fragment);
	//単語一覧出力領域の子要素を置き換える（存在しない場合は追加する）
	if(ePlhlrOtWordList.firstChild){
		ePlhlrOtWordList.replaceChild(ul, ePlhlrOtWordList.firstChild);
	}else{ePlhlrOtWordList.appendChild(ul);}
}
//区切り文字変換あり
function otSplit1(){
	const ul = document.createElement("ul");
	ul.appendChild(createWordList(Words, ePrefix.value, eSuffix.value+eStringReplaceTo.value));
	//単語一覧出力領域の子要素を置き換える（存在しない場合は追加する）
	if(ePlhlrOtWordList.firstChild){
		ePlhlrOtWordList.replaceChild(ul, ePlhlrOtWordList.firstChild);
	}else{ePlhlrOtWordList.appendChild(ul);}
}
/***************************************************************
 * 旧関数群

//区切り文字の変換後文字列を取得する
function getStringReplaceTo(){
	//区切り文字を変換するか
	if(eCheckboxReplaceDlmt.checked){
		//変換するとき
		return eStringReplaceTo.value;	//変換文字列を返す
	}else{
		//変換しないとき
		return eDlmt.value;					//区切り文字を返す
	}	
}

//入力を区切り文字で分割する
//つなげて出力する
function ot(){
	const words = eIn.value.split(eDlmt.value);
	let otText = "";
	const strRep2 = getStringReplaceTo();
	const suf_strRep2 = eSuffix.value + strRep2;
	const pre = ePrefix.value;
	//単語をつなげる
	words.forEach((w) => {
		otText += pre + w + suf_strRep2;
	});
	//出力
	eOt.value = otText.substr(0, (otText.length - strRep2.length));

}

//入力を区切り文字で分割する
//逆順につなげて出力する
function otReverse(){
	const words = eIn.value.split(eDlmt.value);
	let otText = "";
	const strRep2 = getStringReplaceTo();
	const suf_strRep2 = eSuffix.value + strRep2;
	const pre = ePrefix.value;
	
	//逆順にする
	for(let i=words.length-1; i>=0; i--){
		otText += pre + words[i] + suf_strRep2;
	}
	//出力
	eOt.value = otText.substr(0, (otText.length - strRep2.length));
}

//入力を区切り文字で分割する
//単語一覧を生成し、出力する
function otSplit(){
	const words = eIn.value.split(eDlmt.value);
	const ul = document.createElement("ul");
	ul.appendChild(createWordList(words, ePrefix.value, eSuffix.value+getStringReplaceTo()));
	//単語一覧出力領域の子要素を置き換える（存在しない場合は追加する）
	if(ePlhlrOtWordList.firstChild){
		ePlhlrOtWordList.replaceChild(ul, ePlhlrOtWordList.firstChild);
	}else{
		ePlhlrOtWordList.appendChild(ul);
	}
}
*/