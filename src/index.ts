import {
	el,
	log,
	copyToClipboard,
	createWordList,
	eventInputTabInTextarea,
	resizeHeight,
} from "./lib";

//グローバルDOM要素取得
const eIn = <HTMLTextAreaElement>el("In");
const eOt = <HTMLTextAreaElement>el("Ot");
const eDlmt = <HTMLTextAreaElement>el("Dlmt");
const eCheckboxReplaceDlmt = <HTMLInputElement>el("CheckboxReplaceDlmt");
const eStringReplaceTo = <HTMLTextAreaElement>el("StringReplaceTo");
const ePrefix = <HTMLTextAreaElement>el("Prefix");
const eSuffix = <HTMLTextAreaElement>el("Suffix");
const ePlhlrOtWordList = <HTMLTableCellElement>el("PlhlrOtWordList");
const eBtnOt = <HTMLButtonElement>el("BtnOt");

//イベント登録
//ボタン
(<HTMLButtonElement>el("BtnOt")).onclick = ot;
(<HTMLButtonElement>el("BtnOtSplit")).onclick = otSplit;
(<HTMLButtonElement>el("BtnOtReverse")).onclick = otReverse;
(<HTMLButtonElement>el("BtnCopyOt")).onclick = copyToClipboard.bind(<HTMLTextAreaElement>el("Ot"));
//(<HTMLButtonElement>el("BtnPasteInIn")).onclick = pasteClipboard.bind(<HTMLTextAreaElement>el("In"));	//要permission

//textareaの高さ変更
eIn.addEventListener("input", resizeHeight);
eBtnOt.addEventListener("click", resizeHeight.bind(eOt));

//区切り文字変換機能のスタイル変更
eCheckboxReplaceDlmt.addEventListener("click", () => { setStyleStringReplaceTo(); });

//textareaのTab入力では、カーソル移動をキャンセルし、Tab入力を行う
document.addEventListener('keydown', eventInputTabInTextarea);

//初期化処理
setStyleStringReplaceTo();

//========================================================
//処理関数
//========================================================
//区切り文字の変換の有効無効のスタイル変更
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
//単語一覧を生成し、bodyに出力する
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
