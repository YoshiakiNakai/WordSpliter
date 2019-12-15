
export const el = document.getElementById.bind(document);
export const log = console.log.bind(console);

//正規表現エスケープ関数
export function escapeRegExp(string) {
	return string.replace(/[.*+?^=!:${}()|[\]\/\\]/g, '\\$&');
}
//CaptureGroupエスケープ関数
export function restrictRegExp(string) {
	return string.replace(/[()]/g, '\\$&');
}

//要素の高さを調整する
//備考：強制レンダリングあり
export function resizeHeight(this:HTMLElement){
	//要素を実際に追加して高さを測る
	let elem = document.createElement(this.tagName);
	elem.style.width = this.clientWidth + "px";//this.offsetWidth + "px";
	//要素によって代入値を変更する
	if(this instanceof HTMLTextAreaElement){
		(<HTMLTextAreaElement>elem).value = this.value;
	}
	document.body.appendChild(elem);
	this.style.height = elem.scrollHeight + "px";
	document.body.removeChild(elem);
}

//textareaのTab入力では、カーソル移動をキャンセルし、Tab入力を行う
export function eventInputTabInTextarea(ev:KeyboardEvent){
	if(ev.keyCode !== 9) return;	//Tabキー判定
	if(!(ev.target instanceof HTMLTextAreaElement)) return;	//target判定
	ev.preventDefault();
	let elem = <HTMLTextAreaElement>ev.target;
	let start = elem.selectionStart;
	let end = elem.selectionEnd;
	let tx = elem.value;
	elem.value = "" + (tx.substring(0, start)) + "\t" + (tx.substring(end));
	elem.selectionStart = elem.selectionEnd = start + 1;
}

//thisの値をコピーする
//コピーの通知も行う
export function eventCopyToClipboard(this:HTMLTextAreaElement, event:MouseEvent){
	this.select();
	document.execCommand("Copy");
	let sl = getSelection();
	if(sl instanceof Selection) sl.empty();	//選択解除
	//コピー通知
	const elemNotify = createNotifyElement("Copied", event.pageX-40, event.pageY-20);
	document.body.appendChild(elemNotify);
	setTimeout(function(){
		document.body.removeChild(elemNotify);
	}, 1000);
}

// //thisへPasteする
// //permissionが必要。API策定中らしい。2019/12
// export function pasteClipboard(this:HTMLTextAreaElement, event:MouseEvent){
// 	this.focus();
// 	document.execCommand("paste");
// }

//通知用DOM要素を生成する
export function createNotifyElement(text="", x=0, y=0){
	const elem = document.createElement("span");
	elem.classList.add("selectNone");
	elem.classList.add("bold");
	elem.classList.add("sm");
	elem.style.position = "absolute";
	elem.style.left = x + "px";
	elem.style.top = y + "px";
	elem.textContent = text;
	return elem;
}

//単語一覧を作る
export function createWordList(words:Array<string>, prefix="", suffix=""){
	const fragment = document.createDocumentFragment();
	words.forEach(function(w){
		//textareaに単語を入れる
		const textarea = document.createElement("textarea");	
		textarea.value = prefix + w + suffix;
		//コピーボタンを作る
		const button = document.createElement("button");
		button.textContent = "Copy";
		button.onclick = eventCopyToClipboard.bind(textarea);
		//liにtextareaとbuttonを入れて、fragmentに追加する
		const li = document.createElement("li");
		li.appendChild(textarea);
		li.appendChild(button);
		fragment.appendChild(li);
	});
	return fragment;
}
