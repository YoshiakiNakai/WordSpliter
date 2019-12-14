
export const el = document.getElementById.bind(document);
export const log = console.log.bind(console);

//要素の高さを調整する
export function resizeHeight(this:HTMLElement){
	//要素を実際に追加して高さを測る
	let elem = document.createElement(this.tagName);
	elem.style.width = this.clientWidth + "px";
	//要素によって代入値を変更する
	if(this instanceof HTMLTextAreaElement){
		(<HTMLTextAreaElement>elem).value = this.value;
	}
	requestAnimationFrame(() => {
		document.body.appendChild(elem);
		this.style.height = elem.scrollHeight + "px";
		document.body.removeChild(elem);
	});
}

//textareaのTab入力では、カーソル移動をキャンセルし、Tab入力を行う
export function eventInputTabInTextarea(e:KeyboardEvent){
	if(e.keyCode !== 9) return false;	//Tabキー判定
	if(!(e.target instanceof HTMLTextAreaElement)) return false;	//target判定
	e.preventDefault();
	let ele = <HTMLTextAreaElement>e.target;
	let start = ele.selectionStart;
	let end = ele.selectionEnd;
	let tx = ele.value;
	ele.value = "" + (tx.substring(0, start)) + "\t" + (tx.substring(end));
	ele.selectionStart = ele.selectionEnd = start + 1;
	return false;
}

//thisの値をコピーする
//コピーの通知も行う
export function copyToClipboard(this:HTMLTextAreaElement, event:MouseEvent){
	this.select();
	document.execCommand("Copy");
	let sl = getSelection();
	if(sl instanceof Selection) sl.empty();	//選択解除
	//コピー通知
	const eleNotify = createNotifyElement("Copied", event.pageX-40, event.pageY-20);
	document.body.appendChild(eleNotify);
	setTimeout(function(){
		document.body.removeChild(eleNotify);
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
	const ele = document.createElement("span");
	ele.classList.add("selectNone");
	ele.classList.add("bold");
	ele.classList.add("small");
	ele.style.position = "absolute";
	ele.style.left = x + "px";
	ele.style.top = y + "px";
	ele.textContent = text;
	return ele;
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
		button.onclick = copyToClipboard.bind(textarea);
		//liにtextareaとbuttonを入れて、fragmentに追加する
		const li = document.createElement("li");
		li.appendChild(textarea);
		li.appendChild(button);
		fragment.appendChild(li);
	});
	return fragment;
}
